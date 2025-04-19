// tauri-v2/packages/api/src/core.ts
var SERIALIZE_TO_IPC_FN = "__TAURI_TO_IPC_KEY__";
function transformCallback(callback, once = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
var Channel = class {
  /** The callback id returned from {@linkcode transformCallback} */
  id;
  #onmessage;
  // the index is used as a mechanism to preserve message order
  #nextMessageIndex = 0;
  #pendingMessages = [];
  #messageEndIndex;
  constructor(onmessage) {
    this.#onmessage = onmessage || (() => {
    });
    this.id = transformCallback((rawMessage) => {
      const index = rawMessage.index;
      if ("end" in rawMessage) {
        if (index == this.#nextMessageIndex) {
          this.cleanupCallback();
        } else {
          this.#messageEndIndex = index;
        }
        return;
      }
      const message = rawMessage.message;
      if (index == this.#nextMessageIndex) {
        this.#onmessage(message);
        this.#nextMessageIndex += 1;
        while (this.#nextMessageIndex in this.#pendingMessages) {
          const message2 = this.#pendingMessages[this.#nextMessageIndex];
          this.#onmessage(message2);
          delete this.#pendingMessages[this.#nextMessageIndex];
          this.#nextMessageIndex += 1;
        }
        if (this.#nextMessageIndex === this.#messageEndIndex) {
          this.cleanupCallback();
        }
      } else {
        this.#pendingMessages[index] = message;
      }
    });
  }
  cleanupCallback() {
    Reflect.deleteProperty(window, `_${this.id}`);
  }
  set onmessage(handler) {
    this.#onmessage = handler;
  }
  get onmessage() {
    return this.#onmessage;
  }
  [SERIALIZE_TO_IPC_FN]() {
    return `__CHANNEL__:${this.id}`;
  }
  toJSON() {
    return this[SERIALIZE_TO_IPC_FN]();
  }
};
async function checkPermissions(plugin) {
  return invoke(`plugin:${plugin}|check_permissions`);
}
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugin/plugins/geolocation/guest-js/index.ts
async function watchPosition(options, cb) {
  const channel = new Channel();
  channel.onmessage = (message) => {
    if (typeof message === "string") {
      cb(null, message);
    } else {
      cb(message);
    }
  };
  await invoke("plugin:geolocation|watch_position", {
    options,
    channel
  });
  return channel.id;
}
async function getCurrentPosition(options) {
  return await invoke("plugin:geolocation|get_current_position", {
    options
  });
}
async function clearWatch(channelId) {
  await invoke("plugin:geolocation|clear_watch", {
    channelId
  });
}
async function checkPermissions2() {
  return await checkPermissions("geolocation");
}
async function requestPermissions(permissions) {
  return await invoke("plugin:geolocation|request_permissions", {
    permissions
  });
}
export {
  checkPermissions2 as checkPermissions,
  clearWatch,
  getCurrentPosition,
  requestPermissions,
  watchPosition
};
