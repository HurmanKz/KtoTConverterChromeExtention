/*
 * Filename: \centosa\piden\hurman\converter\content.js
 * Path: \centosa\piden\hurman\converter
 * Created Date: Tuesday, March 3rd 2020
 * Author: Hurman
 * Copyright (c) 2020 Kristal Corpuration.
 */

// Use more efficient message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "highlightIcon":
            chrome.action.setIcon({
                path: {
                    "16": "icons/favicon-16x16.png",
                    "32": "icons/favicon-32x32.png",
                    "48": "icons/favicon.ico",
                    "128": "icons/apple-touch-icon.png"
                },
                tabId: sender.tab.id
            });
            break;
        // Add more cases as needed
    }
    return false; // Don't keep message channel open
});

// Updated action API for Manifest V3
chrome.action.onClicked.addListener((tab) => {
    chrome.action.setPopup({
        tabId: tab.id,
        popup: "popup.html"
    });
});

// Optimized URL encoding
const fixedEncodeURI = (() => {
    const replacements = {
        '%5B': '[',
        '%5D': ']'
    };
    
    return (url) => {
        return encodeURI(url).replace(/%5[BD]/g, match => replacements[match]);
    };
})();
