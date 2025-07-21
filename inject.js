/*
 * Filename: \centosa\piden\hurman\converter\content.js
 * Path: \centosa\piden\hurman\converter
 * Created Date: Tuesday, March 3rd 2020, 11:27:19 pm
 * Author: Hurman
 * Email: HurmanKz@Hotmail.com
 * Copyright (c) 2020 Kristal Corpuration.
 */
console.info("see: Kristal.Kz");

require("//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
var trScript = document.createElement("script");
trScript.type = "text/javascript";
trScript.async = true;
trScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
document.body.append(trScript);

function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'ko'}, 'google_translate_element');
}

/* <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script> */