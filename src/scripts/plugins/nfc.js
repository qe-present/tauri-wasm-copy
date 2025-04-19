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
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugin/plugins/nfc/guest-js/index.ts
var RTD_TEXT = [84];
var RTD_URI = [85];
var TechKind = /* @__PURE__ */ ((TechKind2) => {
  TechKind2[TechKind2["IsoDep"] = 0] = "IsoDep";
  TechKind2[TechKind2["MifareClassic"] = 1] = "MifareClassic";
  TechKind2[TechKind2["MifareUltralight"] = 2] = "MifareUltralight";
  TechKind2[TechKind2["Ndef"] = 3] = "Ndef";
  TechKind2[TechKind2["NdefFormatable"] = 4] = "NdefFormatable";
  TechKind2[TechKind2["NfcA"] = 5] = "NfcA";
  TechKind2[TechKind2["NfcB"] = 6] = "NfcB";
  TechKind2[TechKind2["NfcBarcode"] = 7] = "NfcBarcode";
  TechKind2[TechKind2["NfcF"] = 8] = "NfcF";
  TechKind2[TechKind2["NfcV"] = 9] = "NfcV";
  return TechKind2;
})(TechKind || {});
var NFCTypeNameFormat = /* @__PURE__ */ ((NFCTypeNameFormat2) => {
  NFCTypeNameFormat2[NFCTypeNameFormat2["Empty"] = 0] = "Empty";
  NFCTypeNameFormat2[NFCTypeNameFormat2["NfcWellKnown"] = 1] = "NfcWellKnown";
  NFCTypeNameFormat2[NFCTypeNameFormat2["Media"] = 2] = "Media";
  NFCTypeNameFormat2[NFCTypeNameFormat2["AbsoluteURI"] = 3] = "AbsoluteURI";
  NFCTypeNameFormat2[NFCTypeNameFormat2["NfcExternal"] = 4] = "NfcExternal";
  NFCTypeNameFormat2[NFCTypeNameFormat2["Unknown"] = 5] = "Unknown";
  NFCTypeNameFormat2[NFCTypeNameFormat2["Unchanged"] = 6] = "Unchanged";
  return NFCTypeNameFormat2;
})(NFCTypeNameFormat || {});
function record(format, kind, id, payload) {
  return {
    format,
    kind: typeof kind === "string" ? Array.from(new TextEncoder().encode(kind)) : kind,
    id: typeof id === "string" ? Array.from(new TextEncoder().encode(id)) : id,
    payload: typeof payload === "string" ? Array.from(new TextEncoder().encode(payload)) : payload
  };
}
function textRecord(text, id, language = "en") {
  const payload = Array.from(new TextEncoder().encode(language + text));
  payload.unshift(language.length);
  return record(1 /* NfcWellKnown */, RTD_TEXT, id ?? [], payload);
}
var protocols = [
  "",
  "http://www.",
  "https://www.",
  "http://",
  "https://",
  "tel:",
  "mailto:",
  "ftp://anonymous:anonymous@",
  "ftp://ftp.",
  "ftps://",
  "sftp://",
  "smb://",
  "nfs://",
  "ftp://",
  "dav://",
  "news:",
  "telnet://",
  "imap:",
  "rtsp://",
  "urn:",
  "pop:",
  "sip:",
  "sips:",
  "tftp:",
  "btspp://",
  "btl2cap://",
  "btgoep://",
  "tcpobex://",
  "irdaobex://",
  "file://",
  "urn:epc:id:",
  "urn:epc:tag:",
  "urn:epc:pat:",
  "urn:epc:raw:",
  "urn:epc:",
  "urn:nfc:"
];
function encodeURI(uri) {
  let prefix = "";
  protocols.slice(1).forEach(function(protocol) {
    if ((prefix.length === 0 || prefix === "urn:") && uri.indexOf(protocol) === 0) {
      prefix = protocol;
    }
  });
  if (prefix.length === 0) {
    prefix = "";
  }
  const encoded = Array.from(new TextEncoder().encode(uri.slice(prefix.length)));
  const protocolCode = protocols.indexOf(prefix);
  encoded.unshift(protocolCode);
  return encoded;
}
function uriRecord(uri, id) {
  return record(
    1 /* NfcWellKnown */,
    RTD_URI,
    id ?? [],
    encodeURI(uri)
  );
}
function mapScanKind(kind) {
  const { type: scanKind, ...kindOptions } = kind;
  return { [scanKind]: kindOptions };
}
async function scan(kind, options) {
  return await invoke("plugin:nfc|scan", {
    kind: mapScanKind(kind),
    ...options
  });
}
async function write(records, options) {
  const { kind, ...opts } = options ?? {};
  if (kind) {
    opts.kind = mapScanKind(kind);
  }
  await invoke("plugin:nfc|write", {
    records,
    ...opts
  });
}
async function isAvailable() {
  return await invoke("plugin:nfc|is_available");
}
export {
  NFCTypeNameFormat,
  RTD_TEXT,
  RTD_URI,
  TechKind,
  isAvailable,
  record,
  scan,
  textRecord,
  uriRecord,
  write
};
