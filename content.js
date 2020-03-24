/*
 * Filename: \centosa\piden\hurman\converter\content.js
 * Path: \centosa\piden\hurman\converter
 * Created Date: Tuesday, March 3rd 2020, 11:27:19 pm
 * Author: Hurman
 * Email: HurmanKz@Hotmail.com
 * Copyright (c) 2020 Kristal Corpuration.
 */
const converter = new Converter();
let pattern = /.*[яюаәбвгғдеэжзийкқлмнңоөпрсцтуүұфхһчшыі]+.*/gi;

function findAndConvert() {
  let elementsInsideBody = [...document.body.getElementsByTagName("*")];
  elementsInsideBody.forEach(element => {
    element.childNodes.forEach(child => {
      if (child.nodeType === 3) replaceText(child);
    });
  });
}

function replaceText(node) {
  let value = node.nodeValue;
  if (value.match(pattern)) {
    value = converter.convertToTote(value);
    node.parentElement.style.fontFamily = "Kerwen Kz";
    node.parentElement.style.direction = "rtl";
  }
  node.nodeValue = value;
}

function injectCustomJs(jsPath) {
  jsPath = jsPath || "js/inject.js";
  var temp = document.createElement("script");
  temp.setAttribute("type", "text/javascript");
  temp.src = chrome.extension.getURL(jsPath);
  temp.onload = function() {
    this.parentNode.removeChild(this);
  };
  document.head.appendChild(temp);
}
window.onload = injectCustomJs("inject.js");
