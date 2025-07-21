/*
 * Filename: \centosa\piden\hurman\converter\content.js
 * Path: \centosa\piden\hurman\converter
 * Created Date: Tuesday, March 3rd 2020
 * Author: Hurman
 * Copyright (c) 2020 Kristal Corporation.
 */

// Initialize global variables at the top
const transformer = new Transformer();
// Cyrillic range including ъь explicitly
const pattern = /[\u0400-\u04FF\u0500-\u052F\u044A\u044C\u042A\u042C]+/i;
// Kazakh letters without ъь since they're in pattern
const kazakhLetters = /[ёяюаәбвгғдеэжзийкқлмнңоөпрссцтуүұфхһчшщыі]/i;
const whitelistChars = [' ', '\n', '\t', '\r'];

// Add these state variables
let isTransformed = false;
let processedNodes = new WeakSet();
let originalNodes = new Map();
let checkAttributes = false;

// Add these constants at the top with other declarations
const mismatchStyle = `
    border-bottom: 2px dashed #ff4444;
    cursor: help;
    position: relative;
    display: inline-block;
`;

// Update tooltip style
const tooltipStyle = `
    visibility: hidden;
    background-color: #333;
    color: #fff;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-align: left;
    padding: 12px;
    border-radius: 6px;
    position: fixed;
    z-index: 999999;
    max-width: 300px;
    word-wrap: break-word;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    opacity: 0;
    transition: opacity 0.2s;
`;

// Add at the top after global variables
// fetch(chrome.runtime.getURL('fonts.css'))
//   .then(response => response.text())
//   .then(css => {
//     const style = document.createElement('style');
//     style.textContent = css;
//     document.head.appendChild(style);
//   });

const fontUrl = chrome.runtime.getURL('fonts/KzOnly.ttf');

const style = document.createElement('style');
style.textContent = `
  @font-face {
    font-family: 'KzOnly';
    src: url('${fontUrl}') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  body, * {
    font-family: 'KzOnly', sans-serif !important;
  }
`;
document.head.appendChild(style);


// Listen for commands from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch (request.action) {
      case 'transform':
        transformPage();
        break;
      case 'restore':
        restoreOriginal();
        break;
      case 'setAutoTranslate':
        handleAutoTranslate(request.value);
        break;
      case 'setDeepSearch':
        checkAttributes = request.value;
        if (isTransformed) {
          restoreOriginal();
          transformPage();
        }
        break;
    }
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error in message handler:', error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
});

function collectTextNodes(element, collection) {
    // Basic tags to check
    const tagsToCheck = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'span', 'a', 'div', 'label', 'button',
        'li', 'ul', 'nav', 'menu', 'strong', 'em',
        'td', 'th', 'caption', 'figcaption'
    ];

    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    // const text = node.nodeValue.trim();
                    const text = node.nodeValue;
                    // Changed to lowercase for comparison
                    if (text && kazakhLetters.test(text.toLowerCase()) && !processedNodes.has(node)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();
                    if (tagsToCheck.includes(tagName)) {
                        // Process attributes if deep search is enabled
                        if (checkAttributes) {
                            const attributesToCheck = ['title', 'alt', 'placeholder', 'aria-label', 'data-text'];
                            attributesToCheck.forEach(attr => {
                                // Changed to lowercase for comparison
                                if (node.hasAttribute(attr) && kazakhLetters.test(node.getAttribute(attr).toLowerCase())) {
                                    const originalText = node.getAttribute(attr);
                                    originalNodes.set(node, originalText);
                                    node.setAttribute(attr, transformer.transformToTote(originalText));
                                }
                            });
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
                return NodeFilter.FILTER_SKIP;
            }
        }
    );

    let node;
    while (node = walker.nextNode()) {
        if (node.nodeType === Node.TEXT_NODE && !processedNodes.has(node)) {
            // const text = node.nodeValue.trim();
            const text = node.nodeValue;
            if (text && kazakhLetters.test(text)) {
                collection.push(node);
            }
        }
    }
}

// Add right after collectTextNodes
function processNodes(nodes) {
    const chunk = nodes.splice(0, 100); // Process in smaller chunks
    
    chunk.forEach(node => {
        if (!processedNodes.has(node)) {
            transformText(node);
            processedNodes.add(node);
        }
    });

    if (nodes.length > 0) {
        requestIdleCallback(() => processNodes(nodes));
    }
}

function transformPage() {
  if (isTransformed) return;

  const nodesToProcess = [];

  // Process main content first
  collectTextNodes(document.body, nodesToProcess);

  // Process elements with specific attributes using the Kazakh pattern
  const elementsWithKazakh = document.querySelectorAll(`
        [placeholder], [title], [alt], [data-text], [aria-label]
    `);

  elementsWithKazakh.forEach(el => {
    const attributes = ['placeholder', 'title', 'alt', 'data-text', 'aria-label'];

    attributes.forEach(attr => {
      if (el.hasAttribute(attr) && kazakhLetters.test(el.getAttribute(attr))) {
        // Store original text before transforming
        const originalText = el.getAttribute(attr);
        originalNodes.set(el.getAttribute(attr), originalText);
        el.setAttribute(attr, transformer.transformToTote(originalText));
      }
    });
  });

  if (nodesToProcess.length) {
    processNodes(nodesToProcess);
    isTransformed = true;
  }
}

function restoreOriginal() {
  if (!isTransformed) return;

  // Remove all mismatch tooltips
  document.querySelectorAll('[data-is-mismatch-tooltip]').forEach(t => t.remove());

  // Restore original nodes
  for (const [node, data] of originalNodes) {
    if (node && node.parentNode) {
      const textNode = document.createTextNode(data.text || data);
      node.parentNode.replaceChild(textNode, node);
    }
  }

  isTransformed = false;
  processedNodes = new WeakSet();
  originalNodes.clear();
}

// Update transformText function
function transformText(node) {
    if (node.parentElement?.dataset.isMismatchSpan) {
        return;
    }

    const originalValue = node.nodeValue;
    const value = originalValue.trim();
    
    if (pattern.test(value.toLowerCase())) {
        if (!originalNodes.has(node)) {
            originalNodes.set(node, originalValue);
        }

        const mismatches = findMismatches(value);
        const transformedText = transformer.transformToTote(value);
        
        if (mismatches.length > 0) {
            if (node.parentElement?.dataset.isTransformed) {
                return;
            }

            const span = document.createElement('span');
            span.style.cssText = mismatchStyle;
            span.dataset.isMismatchSpan = 'true';
            span.dataset.isTransformed = 'true';
            span.style.fontFamily = 'KzOnly'; // Updated font family
            span.textContent = transformedText;
            
            const tooltip = document.createElement('div');
            tooltip.style.cssText = tooltipStyle;
            tooltip.dataset.isMismatchTooltip = 'true';
            tooltip.innerHTML = `
                <div style="font-size: 16px; padding: 8px;">
                    ${mismatches.map(m => `
                        <div style="margin: 4px 0;">
                            <strong style="color: #ff4444">Mismatch:</strong> 
                            <span style="background: #444; padding: 2px 8px; border-radius: 4px; margin: 0 4px;">${m.char || '␀'}</span>
                            <span style="color: #999">U+${m.char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Single tooltip instance
            let activeTooltip = null;
            
            span.addEventListener('mouseover', (e) => {
                if (activeTooltip) return;
                
                activeTooltip = tooltip.cloneNode(true);
                document.body.appendChild(activeTooltip);
                
                const rect = span.getBoundingClientRect();
                activeTooltip.style.visibility = 'visible';
                activeTooltip.style.opacity = '1';
                activeTooltip.style.top = `${rect.bottom + 5}px`;
                activeTooltip.style.left = `${rect.left}px`;
            });
            
            span.addEventListener('mouseout', (e) => {
                if (activeTooltip && !e.relatedTarget?.closest('[data-is-mismatch-tooltip]')) {
                    activeTooltip.remove();
                    activeTooltip = null;
                }
            });

            // Replace node only if not already replaced
            if (node.parentNode) {
                node.parentNode.replaceChild(span, node);
                originalNodes.set(span, {
                    text: originalValue,
                    tooltip: tooltip
                });
            }
        } else {
            // For non-mismatched text
            const span = document.createElement('span');
            span.style.fontFamily = 'KzOnly'; // Updated font family
            span.textContent = transformedText;
            node.parentNode.replaceChild(span, node);
            originalNodes.set(span, originalValue);
            processedNodes.add(span);
        }
    }
}

// Update findMismatches function to show ASCII codes
function findMismatches(text) {
    const mismatches = [];
    const validChars = new Set([
        ...transformer.kyrlAlphabetList.map(char => char.toLowerCase()),
        'ъ', 'ь' // Add these explicitly to valid chars
    ]);
    
    [...text].forEach(char => {
        const lowerChar = char.toLowerCase();
        // Only check Cyrillic chars that aren't whitespace
        if (pattern.test(char) && !whitelistChars.includes(char)) {
            // Don't mark ъь as mismatches
            if (!validChars.has(lowerChar) && lowerChar !== 'ъ' && lowerChar !== 'ь' && lowerChar !== 'щ') {
                mismatches.push({
                    char: char,
                    code: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
                    type: 'Unknown letter'
                });
            }
        }
    });
    
    return mismatches;
}

function handleAutoTranslate(enabled) {
  chrome.storage.sync.set({ autoTranslate: enabled });
  if (enabled && !isTransformed) {
    transformPage();
  } else if (!enabled && isTransformed) {
    restoreOriginal();
  }
}

function setParentElementStyle(node) {
    if (!node) return;

    let parent = node.parentElement;
    while (parent && parent.style.display.includes("inline")) {
        parent = parent.parentElement;
    }
    
    if (parent) {
        parent.style.fontFamily = "KzOnly";
        parent.style.direction = "rtl";
    }
}

// Initialize the observer
const observer = new MutationObserver((mutations) => {
    if (!isTransformed) return;
    
    const nodesToProcess = [];
    
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    collectTextNodes(node, nodesToProcess);
                } else if (node.nodeType === Node.TEXT_NODE && !processedNodes.has(node)) {
                    if (pattern.test(node.nodeValue)) {
                        nodesToProcess.push(node);
                    }
                }
            });
        } else if (mutation.type === 'characterData') {
            if (!processedNodes.has(mutation.target) && pattern.test(mutation.target.nodeValue)) {
                nodesToProcess.push(mutation.target);
            }
        }
    });
    
    if (nodesToProcess.length > 0) {
        requestIdleCallback(() => processNodes(nodesToProcess));
    }
});

// Start observing// Start observing
window.addEventListener('unload', () => observer.disconnect());// Cleanup when extension is disabled/removed

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

// Cleanup when extension is disabled/removed
window.addEventListener('unload', () => observer.disconnect());
