//Main CODE
// popup.js
let port = null;

document.addEventListener('DOMContentLoaded', () => {
  const statusElement = document.getElementById('status');
  const exitButton = document.getElementById('exit');

  // Connect to background script
  port = chrome.runtime.connect({ name: 'popup' });

  // Handle messages from background script
  port.onMessage.addListener((msg) => {
    if (msg.type === 'scanningStatus') {
      updateStatus(msg.detectedUrls || []);
    }
  });

  function updateStatus(detectedUrls) {
    if (detectedUrls.length > 0) {
      statusElement.innerHTML = `
        <p class="warning">⚠️ Detected ${detectedUrls.length} suspicious URL${detectedUrls.length > 1 ? 's' : ''}:</p>
        <ul style="text-align: left; max-height: 100px; overflow-y: auto;">
          ${detectedUrls.map(url => `<li style="word-break: break-all;">${url}</li>`).join('')}
        </ul>
      `;
    } else {
      statusElement.textContent = 'Actively scanning... No suspicious URLs detected';
    }
  }

  // Enhanced exit button functionality
  exitButton.addEventListener('click', () => {
    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    ripple.style.borderRadius = '50%';
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.animation = 'ripple 0.6s linear';
    
    exitButton.appendChild(ripple);
    
    // Send exit message and close after animation
    setTimeout(() => {
      port.postMessage({ action: 'exitExtension' });
      chrome.tabs.query({ active: true, currentWindow: true }, () => {
        window.close();
      });
    }, 200);
  });

  // Request initial status
  port.postMessage({ action: 'getStatus' });
});

// Add to background.js (add this to your existing background.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exitExtension') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'cleanup' });
        chrome.runtime.reload();
      }
    });
    return true;
  }
});