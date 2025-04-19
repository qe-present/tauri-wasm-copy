use serde_wasm_bindgen::from_value;
#[inline(always)]
pub async fn get_name() -> crate::Result<String> {
    let name=app::getName().await;
    let name: String = from_value(name?)?;
    Ok(name)
}

mod app{
    use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
    #[wasm_bindgen(module = "/src/scripts/api/app.js")]
    extern "C" {
        #[wasm_bindgen(catch)]
        pub async fn getName() -> Result<JsValue, JsValue>;

    }
}
