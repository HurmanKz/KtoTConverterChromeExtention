document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("button").addEventListener("click", () => {
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
          tabs[0].id,
          {code: 'findAndConvert();'});
      });
    });
  }, false);
}, false);