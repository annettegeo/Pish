// background.js

//MAIN CODE 


// background.js
console.log("Background script is running!");

let detectedUrls = new Set();
let ports = new Set();
const VIRUSTOTAL_API_KEY = 'VirusTotal Api key yours'; // Add your own API key here
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3/urls';
const GROQ_API_KEY = "Your groq api key"; // Add your own API key here

// Broadcast status to all connected popups
function broadcastStatus() {
    for (const port of ports) {
        try {
            port.postMessage({
                type: 'scanningStatus',
                detectedUrls: Array.from(detectedUrls)
            });
        } catch (error) {
            console.error('Error broadcasting status:', error);
            ports.delete(port);
        }
    }
}

// Updated Groq API helper function with correct endpoint and model
async function makeGroqRequest(messages) {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "mixtral-8x7b-32768",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 100
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            retryCount++;
            console.error(`Attempt ${retryCount} failed:`, error);
            if (retryCount === maxRetries) throw error;
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
    }
    return null;
}

// Test Groq connection with error handling
async function testGroq() {
    try {
        console.log("Testing Groq connection...");
        const response = await makeGroqRequest([
            { role: "user", content: "Hello, what is 2+2?" }
        ]);
        console.log("Groq API Response:", response);
        if (response) {
            console.log("Groq connection successful!");
        }
    } catch (error) {
        console.error("Error connecting to Groq API:", error);
    }
}

// Run initial test
testGroq();

// Feature extraction function
function extractUrlFeatures(url) {
    const urlObj = new URL(url);
    return {
        domainLength: urlObj.hostname.length,
        numSpecialChars: (urlObj.hostname.match(/[^a-zA-Z0-9.-]/g) || []).length,
        numDigits: (urlObj.hostname.match(/\d/g) || []).length,
        hasIPAddress: /\d+\.\d+\.\d+\.\d+/.test(urlObj.hostname),
        numDots: (urlObj.hostname.match(/\./g) || []).length,
        pathLength: urlObj.pathname.length,
        queryLength: urlObj.search.length,
        hasHTTPS: urlObj.protocol === 'https:',
        hasMultiSubdomains: urlObj.hostname.split('.').length > 2
    };
}

// Site comparison functions
async function compareWithOriginalSite(suspectedUrl, originalUrl) {
    try {
        const [suspectedResponse, originalResponse] = await Promise.all([
            fetch(suspectedUrl),
            fetch(originalUrl)
        ]);

        const [suspectedHtml, originalHtml] = await Promise.all([
            suspectedResponse.text(),
            originalResponse.text()
        ]);

        const similarity = calculateSimilarity(suspectedHtml, originalHtml);
        return similarity > 0.9;
    } catch (error) {
        console.error('Site comparison error:', error);
        return false;
    }
}

function calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
        for (let i = 1; i <= len1; i++) {
            const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + substitutionCost
            );
        }
    }

    return 1 - (matrix[len2][len1] / Math.max(len1, len2));
}

let urlCache = new Map();

// Check URL with Groq LLM
async function checkWithLLM(url) {    
    if (urlCache.has(url)) {
        console.log("Using cached result for:", url);
        return urlCache.get(url); // Return cached result instead of calling API
    }

    try {
        const urlFeatures = extractUrlFeatures(url);
        const response = await makeGroqRequest([
            {
                role: "user",
                content: `Analyze this URL and its features for phishing characteristics:
                URL: ${url}
                
                Features:
                - Domain Length: ${urlFeatures.domainLength}
                - Special Characters: ${urlFeatures.numSpecialChars}
                - Number of Digits: ${urlFeatures.numDigits}
                - Contains IP Address: ${urlFeatures.hasIPAddress}
                - Number of Dots: ${urlFeatures.numDots}
                - Path Length: ${urlFeatures.pathLength}
                - Query Length: ${urlFeatures.queryLength}
                - Uses HTTPS: ${urlFeatures.hasHTTPS}
                - Multiple Subdomains: ${urlFeatures.hasMultiSubdomains}
                
                Return only "suspicious" or "safe"`
            }
        ]);

        const result = response?.toLowerCase().includes("suspicious"); // ✅ Corrected!
        urlCache.set(url, result); // ✅ Now this line executes properly
        return result; 
        
    } catch (error) {
        console.error('Groq API error:', error);
        return false;
    }
}

// Check URL with VirusTotal API with rate limiting
async function checkWithVirusTotal(url) {
    try {
        // Add delay for rate limiting
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        const encodedUrl = encodeURIComponent(url);
        const submitResponse = await fetch(VIRUSTOTAL_API_URL, {
            method: 'POST',
            headers: {
                'x-apikey': VIRUSTOTAL_API_KEY,
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: `url=${encodedUrl}`
        });

        if (submitResponse.status === 429) {
            console.log('VirusTotal API rate limit reached, skipping check');
            return false;
        }

        if (!submitResponse.ok) {
            throw new Error(`URL submission failed: ${submitResponse.status}`);
        }

        const submitData = await submitResponse.json();
        await new Promise(resolve => setTimeout(resolve, 2000));

        const analysisId = submitData.data.id;
        const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
            headers: {
                'x-apikey': VIRUSTOTAL_API_KEY,
                'accept': 'application/json'
            }
        });

        if (!analysisResponse.ok) {
            throw new Error('Analysis retrieval failed');
        }

        const analysisData = await analysisResponse.json();
        return analysisData.data.attributes.stats.malicious > 0;
    } catch (error) {
        console.error('VirusTotal API error:', error);
        return false;
    }
}

// Handle port connections from popup
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'popup') {
        ports.add(port);
        
        // Send initial status
        port.postMessage({
            type: 'scanningStatus',
            detectedUrls: Array.from(detectedUrls)
        });

        port.onMessage.addListener(async (msg) => {
            if (msg.action === 'getStatus') {
                port.postMessage({
                    type: 'scanningStatus',
                    detectedUrls: Array.from(detectedUrls)
                });
            }
            broadcastStatus();
        });

        port.onDisconnect.addListener(() => {
            ports.delete(port);
        });
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkUrls') {
        checkUrls(request.urls, sender.tab.id).then(() => {
            broadcastStatus();
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (request.action === 'openWarningPage') {
        chrome.tabs.create({
            url: `warning.html?url=${encodeURIComponent(request.url)}`
        });
        return true;
    }
});

// Process URLs and update UI
async function checkUrls(urls, tabId) {
    for (const url of urls) {
        // Skip if URL is already detected as suspicious
        if (detectedUrls.has(url)) continue;

        // Extract features and perform initial checks
        const urlFeatures = extractUrlFeatures(url);
        
        // Quick check for obvious phishing indicators
        if (urlFeatures.hasIPAddress || urlFeatures.numSpecialChars > 3) {
            detectedUrls.add(url);
            highlightUrl(url, tabId);
            continue;
        }

        // Check with Groq LLM first
        const isLLMPhishing = await checkWithLLM(url);
        if (isLLMPhishing) {
            detectedUrls.add(url);
            highlightUrl(url, tabId);
            continue;
        }

        // If not flagged by Groq LLM, check with VirusTotal
        const isVirusTotalPhishing = await checkWithVirusTotal(url);
        if (isVirusTotalPhishing) {
            detectedUrls.add(url);
            highlightUrl(url, tabId);
        }
    }
}

// Highlight suspicious URL in content
function highlightUrl(url, tabId) {
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
    detectedUrls.clear();
});