// background.js

//MAIN CODE 

let isScanning = true;
let detectedUrls = new Set();
let ports = new Set();

const VIRUSTOTAL_API_KEY = 'YOUR_API_KEY_HERE';
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/vtapi/v2/url/report';

// Handle port connections from popup
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    ports.add(port);
    
    // Send initial status
    port.postMessage({
      type: 'scanningStatus',
      isScanning,
      detectedUrls: Array.from(detectedUrls)
    });

    port.onMessage.addListener(async (msg) => {
      switch (msg.action) {
        case 'startScanning':
          isScanning = true;
          // Notify all content scripts to resume scanning
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { action: 'startScanning' });
            });
          });
          break;

        case 'stopScanning':
          isScanning = false;
          // Notify all content scripts to stop scanning
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { action: 'stopScanning' });
            });
          });
          break;

        case 'exitExtension':
          // Clean up before exiting
          detectedUrls.clear();
          isScanning = false;
          // Notify content scripts to clean up
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, { action: 'cleanup' });
            });
          });
          // Reload extension
          chrome.runtime.reload();
          break;

        case 'getStatus':
          port.postMessage({
            type: 'scanningStatus',
            isScanning,
            detectedUrls: Array.from(detectedUrls)
          });
          break;
      }

      // Broadcast status to all popups
      broadcastStatus();
    });

    port.onDisconnect.addListener(() => {
      ports.delete(port);
    });
  }
});

// Broadcast status to all connected popups
function broadcastStatus() {
  for (const port of ports) {
    try {
      port.postMessage({
        type: 'scanningStatus',
        isScanning,
        detectedUrls: Array.from(detectedUrls)
      });
    } catch (error) {
      console.error('Error broadcasting status:', error);
      ports.delete(port);
    }
  }
}

// Check URL with VirusTotal API
async function checkWithVirusTotal(url) {
  if (!isScanning) return false;
  
  try {
    const params = new URLSearchParams({
      apikey: VIRUSTOTAL_API_KEY,
      resource: url
    });
    
    const response = await fetch(`${VIRUSTOTAL_API_URL}?${params}`);
    if (!response.ok) {
      throw new Error('VirusTotal API request failed');
    }
    
    const data = await response.json();
    return data.positives > 0;
  } catch (error) {
    console.error('VirusTotal API error:', error);
    return false;
  }
}

// Check URL with Ollama LLM
async function checkWithLLM(url) {
  if (!isScanning) return false;
  
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt: `Analyze this URL for phishing characteristics: ${url}
        Common phishing indicators:
        - Misspelled domain names
        - Unusual TLDs
        - Long, randomly generated subdomains
        - Mixed character sets
        - Numbers replacing letters
        Return only "suspicious" or "safe"`,
        stream: false
      })
    });
    
    const data = await response.json();
    return data.response.toLowerCase().includes('suspicious');
  } catch (error) {
    console.error('Ollama API error:', error);
    return false;
  }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkUrls') {
    if (isScanning) {
      checkUrls(request.urls, sender.tab.id).then(() => {
        broadcastStatus();
        sendResponse({ success: true });
      });
    } else {
      sendResponse({ success: false, reason: 'scanning_disabled' });
    }
    return true;
  }
  
  if (request.action === 'openWarningPage') {
    if (isScanning) {
      chrome.tabs.create({
        url: `warning.html?url=${encodeURIComponent(request.url)}`
      });
    }
    return true;
  }
});

// Process URLs and update UI
async function checkUrls(urls, tabId) {
  if (!isScanning) return;

  for (const url of urls) {
    // Skip if URL is already detected as suspicious
    if (detectedUrls.has(url)) continue;

    // Check with VirusTotal first
    const isVirusTotalPhishing = await checkWithVirusTotal(url);
    if (isVirusTotalPhishing) {
      detectedUrls.add(url);
      highlightUrl(url, tabId);
      continue;
    }

    // If not flagged by VirusTotal, check with LLM
    const isLLMPhishing = await checkWithLLM(url);
    if (isLLMPhishing) {
      detectedUrls.add(url);
      highlightUrl(url, tabId);
    }
  }
}

// Highlight suspicious URL in content
function highlightUrl(url, tabId) {
  if (!isScanning) return;

  chrome.tabs.sendMessage(tabId, {
    action: 'highlightPhishingUrl',
    url: url
  });
  
  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Phishing Alert!',
    message: 'Detected a potential phishing URL!'
  });
}

// Handle extension install/update
chrome.runtime.onInstalled.addListener(() => {
  // Initialize extension state
  isScanning = true;
  detectedUrls.clear();
});



