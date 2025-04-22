use serde::Serialize;
use serde::de::DeserializeOwned;
#[inline(always)]
pub async fn invoke<S:Serialize,R:DeserializeOwned>(cmd:String,args:S)->crate::Result<R>{
    let js_val=core::invoke(cmd,args).await?;
    let result: R = serde_wasm_bindgen::from_value(js_val)?;
    Ok(result)
}


mod core{
    use serde::{Serialize};
    use serde::de::DeserializeOwned;
    use wasm_bindgen::prelude::wasm_bindgen;
    #[wasm_bindgen(module = "/src/scripts/api/core.js")]
    extern "C"{
        #[wasm_bindgen(catch)]
        pub async fn invoke<S:Serialize,R:DeserializeOwned>(cmd:String,args:S)
            -> crate::Result<R>;

    }
}