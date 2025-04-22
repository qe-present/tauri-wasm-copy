use serde_wasm_bindgen::from_value;
#[inline(always)]
pub async fn get_name() -> crate::Result<String> {
    let name=app::getName().await;
    let name: String = from_value(name?)?;
    Ok(name)
}
#[inline(always)]
pub async fn get_version() -> crate::Result<String> {
    let js_val=app::getVersion().await;
    let version: String = from_value(js_val?)?;
    Ok(version)
}
#[inline(always)]
pub async fn get_tauri_version() -> crate::Result<String> {
    let js_val=app::getTauriVersion().await;
    let version: String = from_value(js_val?)?;
    Ok(version)
}

mod app{
    use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
    #[wasm_bindgen(module = "/src/scripts/api/app.js")]
    extern "C" {
        #[wasm_bindgen(catch)]
        pub async fn getName() -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn getVersion()->Result<JsValue, JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn getTauriVersion()->Result<JsValue, JsValue>;
    }
}
