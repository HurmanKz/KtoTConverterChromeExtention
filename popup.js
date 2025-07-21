document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const transformBtn = document.getElementById('transformBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const transformPageBtn = document.getElementById('transformPage');
    const showOriginalBtn = document.getElementById('showOriginal');
    const autoTranslateCheckbox = document.getElementById('autoTranslate');

    // Initialize transformer
    const transformer = new Transformer();

    // Hide "Show Original" button initially
    showOriginalBtn.classList.add('hidden');

    // Load saved settings
    chrome.storage.sync.get(['autoTranslate'], (result) => {
        autoTranslateCheckbox.checked = result.autoTranslate || false;
    });

    // Show/hide buttons using classes instead of inline styles
    transformBtn?.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'transform' }, (response) => {
                if (response.success) {
                    transformBtn.classList.add('hidden');
                    showOriginalBtn.classList.remove('hidden');
                }
            });
        });
    });

    showOriginalBtn?.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'restore' }, (response) => {
                if (response.success) {
                    showOriginalBtn.classList.add('hidden');
                    transformBtn.classList.remove('hidden');
                }
            });
        });
    });

    // Transform textarea content
    transformBtn?.addEventListener('click', () => {
        const text = inputText.value;
        if (text) {
            outputText.value = transformer.transformToTote(text);
        }
    });

    // Copy converted text
    copyBtn?.addEventListener('click', async () => {
        const text = outputText.value;
        if (text) {
            try {
                await navigator.clipboard.writeText(text);
                copyBtn.textContent = 'Көшірілді!';
                setTimeout(() => {
                    copyBtn.textContent = 'Көшіру';
                }, 2000);
            } catch (err) {
                console.error('Copy failed:', err);
            }
        }
    });

    // Clear both textareas
    clearBtn?.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        inputText.focus();
    });

    // Auto-convert as user types with debouncing
    let timeout;
    inputText?.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const text = inputText.value;
            if (text) {
                outputText.value = transformer.transformToTote(text);
            }
        }, 300); // Reduced from 500ms for better responsiveness
    });

    // Transform page button
    transformPageBtn?.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'transform' }, (response) => {
                if (response?.success) {
                    transformPageBtn.classList.add('hidden');
                    showOriginalBtn.classList.remove('hidden');
                }
            });
        });
    });

    // Show original button
    showOriginalBtn?.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'restore' }, (response) => {
                if (response?.success) {
                    showOriginalBtn.classList.add('hidden');
                    transformPageBtn.classList.remove('hidden');
                }
            });
        });
    });

    // Auto-translate checkbox
    autoTranslateCheckbox?.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        chrome.storage.sync.set({ autoTranslate: enabled });
        
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'setAutoTranslate',
                value: enabled
            });
        });
    });
});