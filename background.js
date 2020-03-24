/*
 * Filename: \centosa\piden\hurman\converter\content.js
 * Path: \centosa\piden\hurman\converter
 * Created Date: Tuesday, March 3rd 2020, 11:27:19 pm
 * Author: Hurman
 * Email: HurmanKz@Hotmail.com
 * Copyright (c) 2020 Kristal Corpuration.
 */
var menuItem = {
  id: "wikit",
  title: "Wikit %s",
  contexts: ["selection"]
};
var menuItemSpeak = {
  id: "speak",
  title: "Speak",
  contexts: ["selection"]
};
chrome.contextMenus.create(menuItem);
chrome.contextMenus.create(menuItemSpeak);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "highlightIcon") {
    // chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    //   chrome.pageAction.show(tabs[0].id);
    // });
  }
});

chrome.browserAction.onClicked.addListener(tab => {
  chrome.browserAction.setPopup({ popup: "popup.html" });
});

// Functions:

function fixedEncodeURI(url) {
  return encodeURI(url)
    .replace(/%5B/g, "[")
    .replace(/%5D/g, "]");
}

// chrome.contextMenus.onClicked.addListener(clickedData => {
//   if (clickedData.menuItemId == "wikit" && clickedData.selectionText) {
//     let wikitUrl =
//       "https://en.wikipedia.org/wiki/" +
//       fixedEncodeURI(clickedData.selectionText);
//     let createData = {
//       url: wikitUrl,
//       type: "popup",
//       top: screen.availWidth / 10,
//       left: screen.availHeight / 10,
//       width: screen.availWidth / 3,
//       height: screen.availHeight / 3
//     };
//     chrome.windows.create(createData, () => {});
//   } else if (clickedData.menuItemId == "speak" && clickedData.selectionText) {
//     chrome.tts.speak(clickedData.selectionText, { rate: 0.7 });
//   }
// });

// chrome.runtime.onInstalled.addListener(function() {
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//     chrome.declarativeContent.onPageChanged.addRules([
//       {
//         conditions: [
//           new chrome.declarativeContent.PageStateMatcher({
//             pageUrl: { urlContains: "youtube.com" }
//           })
//         ],
//         actions: [new chrome.declarativeContent.ShowPageAction()]
//       }
//     ]);
//   });
// });

// omnibox
// chrome.omnibox.onInputChanged.addListener((text, suggest) => {
//   if (!text) return;

//   if (text == "Kz") {
//     suggest([
//       { content: "Kazakh " + text, description: "Kazakhstan" },
//       { content: "Kazakh " + text, description: "China Kazakh" },
//       { content: "Kazakh " + text, description: "Kazakhstan" },
//       { content: "Kazakh " + text, description: "China Kazakh" }
//     ]);
//   } else if (text == "kk") {
//     suggest([
//       { content: "Kazakh " + text, description: "Kazakhstan" },
//       { content: "Kazakh " + text, description: "China Kazakh" },
//       { content: "Kazakh " + text, description: "Kazakhstan" },
//       { content: "Kazakh " + text, description: "China Kazakh" }
//     ]);
//   } else {
//     suggest([
//       { content: "Kazakh " + text, description: "Kazakhstan" },
//       { content: "Kazakh " + text, description: "China Kazakh" },
//       { content: "Kazakh " + text, description: "Kazakhstan" },
//       { content: "Kazakh " + text, description: "China Kazakh" }
//     ]);
//   }
// });

// chrome.omnibox.onInputEntered.addListener(text => {
//   if (!text) return;
//   let href = "https://www.google.com/search?q=" + text;
//   openUrlCurrentTab(href);
// });

// function getCurrentTabId(callback) {
//   chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//     if (callback) callback(tabs.length ? tabs[0].id : null);
//   });
// }

// function openUrlCurrentTab(url) {
//   getCurrentTabId(tabId => {
//     chrome.tabs.update(tabId, { url: url });
//   });
// }

// function sendMessageToContentScript(message) {
//   chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//     chrome.tabs.sendMessage(tabs[0].id, message, () => {});
//   });
// }

// chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.cmd == "convert") {
//     sendMessageToContentScript(request);
//   }
//   return true;
// });
