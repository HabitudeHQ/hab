var str1 = "{\"function\":\"integration\",\"params\":{\"provider_name\":\"forms\",\"action\":\"new_form\",\"provider_category\":null,\"data\":{\"form_json\":{\"logoPosition\":\"right\",\"pages\":[{\"name\":\"page1\",\"elements\":[{\"type\":\"text\",\"name\":\"Q1: New question (text)\",\"id\":\"0a4c-0159\",\"inputType\":\"email\"}]}]},\"form_id\":\"1690025272483x769118343999520800\"}}}";
var str2 = "hello";
var str3 = "{{0dae-0c64-8336-ef79_CSwbquvBLu^_Q1: New question (text)^_1^_null^_null^_null^_t}}";

function checkForObjects(value) {
    let bookends = String(value).substring(0, 1) + String(value).substring(String(value).length - 1, String(value).length);
    let isStringifiedArray = bookends === "[]";
    let isStringifiedObject = bookends === "{}";
    
    if (!isStringifiedArray && !isStringifiedObject) return false;

    let canParse = false;

    try {
        JSON.parse(value);
        canParse = true;
    }
    catch (err) {

    }
    return canParse;
}

console.log(checkForObjects(str1));
console.log(checkForObjects(str2));
console.log(checkForObjects(str3));

