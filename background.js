// background.js
//MAIN CODE 




// console.log("Background script is running!");

// let detectedUrls = new Set();
// let ports = new Set();
// const VIRUSTOTAL_API_KEY = ''; 
// const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3/urls';
// const GROQ_API_KEY = "";

// // Supabase configuration
// const supabaseUrl = 'https://gcohsrptxssxhpafwvvj.supabase.co';
// const supabaseKey = '';

// // Function to add URL to Supabase database
// async function addUrlToDatabase(url) {
//     try {
//         const response = await fetch(`${supabaseUrl}/rest/v1/SuspiciousURL`, {
//             method: 'POST',
//             headers: {
//                 'apikey': supabaseKey,
//                 'Authorization': `Bearer ${supabaseKey}`,
//                 'Content-Type': 'application/json',
//                 'Prefer': 'return=representation'
//             },
//             body: JSON.stringify({ url: url })
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('URL added to database:', data);
//         return true;
//     } catch (error) {
//         console.error('Error adding URL to database:', error);
//         return false;
//     }
// }

// // Add this new function to check URL in database
// async function checkUrlInDatabase(url) {
//     try {
//         const response = await fetch(`${supabaseUrl}/rest/v1/SuspiciousURL?url=eq.${encodeURIComponent(url)}`, {
//             method: 'GET',
//             headers: {
//                 'apikey': supabaseKey,
//                 'Authorization': `Bearer ${supabaseKey}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         return data.length > 0; // Returns true if URL exists in database
//     } catch (error) {
//         console.error('Error checking URL in database:', error);
//         return false;
//     }
// }

// // Modified broadcast status function to ensure popup gets updates
// function broadcastStatus() {
//     const urlsArray = Array.from(detectedUrls);
    
//     // Update all connected ports
//     for (const port of ports) {
//         try {
//             port.postMessage({
//                 type: 'scanningStatus',
//                 detectedUrls: urlsArray
//             });
//         } catch (error) {
//             console.error('Error broadcasting status:', error);
//             ports.delete(port);
//         }
//     }

//     // Update notification if needed
//     if (urlsArray.length > 0) {
//         chrome.notifications.create('phishing-detector', {
//             type: 'basic',
//             iconUrl: 'icon.png',
//             title: 'Phishing URLs Detected!',
//             message: `Total of ${urlsArray.length} suspicious URL${urlsArray.length > 1 ? 's' : ''} found.`,
//             priority: 2,
//             requireInteraction: true
//         });
//     } else {
//         chrome.notifications.clear('phishing-detector');
//     }
// }

// // Updated Groq API helper function with correct endpoint and model
// async function makeGroqRequest(messages) {
//     const maxRetries = 3;
//     let retryCount = 0;

//     while (retryCount < maxRetries) {
//         try {
//             const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${GROQ_API_KEY}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     model: "mixtral-8x7b-32768",
//                     messages: messages,
//                     temperature: 0.7,
//                     max_tokens: 100
//                 })
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
//             }

//             const data = await response.json();
//             return data.choices[0].message.content;
//         } catch (error) {
//             retryCount++;
//             console.error(`Attempt ${retryCount} failed:`, error);
//             if (retryCount === maxRetries) throw error;
//             await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
//         }
//     }
//     return null;
// }

// // Test Groq connection with error handling
// async function testGroq() {
//     try {
//         console.log("Testing Groq connection...");
//         const response = await makeGroqRequest([
//             { role: "user", content: "Hello, what is 2+2?" }
//         ]);
//         console.log("Groq API Response:", response);
//         if (response) {
//             console.log("Groq connection successful!");
//         }
//     } catch (error) {
//         console.error("Error connecting to Groq API:", error);
//     }
// }

// // Run initial test
// testGroq();

// // Feature extraction function
// function extractUrlFeatures(url) {
//     const urlObj = new URL(url);
//     return {
//         domainLength: urlObj.hostname.length,
//         numSpecialChars: (urlObj.hostname.match(/[^a-zA-Z0-9.-]/g) || []).length,
//         numDigits: (urlObj.hostname.match(/\d/g) || []).length,
//         hasIPAddress: /\d+\.\d+\.\d+\.\d+/.test(urlObj.hostname),
//         numDots: (urlObj.hostname.match(/\./g) || []).length,
//         pathLength: urlObj.pathname.length,
//         queryLength: urlObj.search.length,
//         hasHTTPS: urlObj.protocol === 'https:',
//         hasMultiSubdomains: urlObj.hostname.split('.').length > 2
//     };
// }

// // Site comparison functions
// async function compareWithOriginalSite(suspectedUrl, originalUrl) {
//     try {
//         const [suspectedResponse, originalResponse] = await Promise.all([
//             fetch(suspectedUrl),
//             fetch(originalUrl)
//         ]);

//         const [suspectedHtml, originalHtml] = await Promise.all([
//             suspectedResponse.text(),
//             originalResponse.text()
//         ]);

//         const similarity = calculateSimilarity(suspectedHtml, originalHtml);
//         return similarity > 0.9;
//     } catch (error) {
//         console.error('Site comparison error:', error);
//         return false;
//     }
// }

// function calculateSimilarity(str1, str2) {
//     const len1 = str1.length;
//     const len2 = str2.length;
//     const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

//     for (let i = 0; i <= len1; i++) matrix[0][i] = i;
//     for (let j = 0; j <= len2; j++) matrix[j][0] = j;

//     for (let j = 1; j <= len2; j++) {
//         for (let i = 1; i <= len1; i++) {
//             const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
//             matrix[j][i] = Math.min(
//                 matrix[j][i - 1] + 1,
//                 matrix[j - 1][i] + 1,
//                 matrix[j - 1][i - 1] + substitutionCost
//             );
//         }
//     }

//     return 1 - (matrix[len2][len1] / Math.max(len1, len2));
// }

// let urlCache = new Map();

// // Check URL with Groq LLM
// async function checkWithLLM(url) {    
//     if (urlCache.has(url)) {
//         console.log("Using cached result for:", url);
//         return urlCache.get(url);
//     }

//     try {
//         const urlFeatures = extractUrlFeatures(url);
//         const response = await makeGroqRequest([
//             {
//                 role: "user",
//                 content: `Analyze this URL and its features for phishing characteristics:
//                 URL: ${url}
                
//                 Features:
//                 - Domain Length: ${urlFeatures.domainLength}
//                 - Special Characters: ${urlFeatures.numSpecialChars}
//                 - Number of Digits: ${urlFeatures.numDigits}
//                 - Contains IP Address: ${urlFeatures.hasIPAddress}
//                 - Number of Dots: ${urlFeatures.numDots}
//                 - Path Length: ${urlFeatures.pathLength}
//                 - Query Length: ${urlFeatures.queryLength}
//                 - Uses HTTPS: ${urlFeatures.hasHTTPS}
//                 - Multiple Subdomains: ${urlFeatures.hasMultiSubdomains}
                
//                 Return only "suspicious" or "safe"`
//             }
//         ]);

//         const result = response?.toLowerCase().includes("suspicious");
//         urlCache.set(url, result);
//         return result;
        
//     } catch (error) {
//         console.error('Groq API error:', error);
//         return false;
//     }
// }

// // Check URL with VirusTotal API with rate limiting
// async function checkWithVirusTotal(url) {
//     try {
//         await new Promise(resolve => setTimeout(resolve, 15000));
        
//         const encodedUrl = encodeURIComponent(url);
//         const submitResponse = await fetch(VIRUSTOTAL_API_URL, {
//             method: 'POST',
//             headers: {
//                 'x-apikey': VIRUSTOTAL_API_KEY,
//                 'accept': 'application/json',
//                 'content-type': 'application/x-www-form-urlencoded'
//             },
//             body: `url=${encodedUrl}`
//         });

//         if (submitResponse.status === 429) {
//             console.log('VirusTotal API rate limit reached, skipping check');
//             return false;
//         }

//         if (!submitResponse.ok) {
//             throw new Error(`URL submission failed: ${submitResponse.status}`);
//         }

//         const submitData = await submitResponse.json();
//         await new Promise(resolve => setTimeout(resolve, 2000));

//         const analysisId = submitData.data.id;
//         const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
//             headers: {
//                 'x-apikey': VIRUSTOTAL_API_KEY,
//                 'accept': 'application/json'
//             }
//         });

//         if (!analysisResponse.ok) {
//             throw new Error('Analysis retrieval failed');
//         }

//         const analysisData = await analysisResponse.json();
//         return analysisData.data.attributes.stats.malicious > 0;
//     } catch (error) {
//         console.error('VirusTotal API error:', error);
//         return false;
//     }
// }

// // Handle port connections from popup
// chrome.runtime.onConnect.addListener((port) => {
//     if (port.name === 'popup') {
//         ports.add(port);
        
//         port.postMessage({
//             type: 'scanningStatus',
//             detectedUrls: Array.from(detectedUrls)
//         });

//         port.onMessage.addListener(async (msg) => {
//             if (msg.action === 'getStatus') {
//                 port.postMessage({
//                     type: 'scanningStatus',
//                     detectedUrls: Array.from(detectedUrls)
//                 });
//             }
//             broadcastStatus();
//         });

//         port.onDisconnect.addListener(() => {
//             ports.delete(port);
//         });
//     }
// });

// // Handle messages from content scripts and popup
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'checkUrls') {
//         checkUrls(request.urls, sender.tab.id).then(() => {
//             broadcastStatus();
//             sendResponse({ success: true });
//         });
//         return true;
//     }
    
//     if (request.action === 'openWarningPage') {
//         chrome.tabs.create({
//             url: `warning.html?url=${encodeURIComponent(request.url)}`
//         });
//         return true;
//     }

//     if (request.action === 'getStatus') {
//         sendResponse({
//             type: 'scanningStatus',
//             detectedUrls: Array.from(detectedUrls)
//         });
//         return true;
//     }

//     if (request.action === 'unflagUrl') {
//         handleUnflagUrl(request.url).then(success => {
//             sendResponse({ success });
//         });
//         return true; // Required for async response
//     }
//     // ... your existing message handlers ...
// });

// // Modified checkUrls function to include database integration
// async function checkUrls(urls, tabId) {
//     let updatedUrls = false;
    
//     for (const url of urls) {
//         if (detectedUrls.has(url)) continue;

//         // First check if URL exists in database
//         const existsInDatabase = await checkUrlInDatabase(url);
//         if (existsInDatabase) {
//             console.log('URL found in database, skipping API checks:', url);
//             detectedUrls.add(url);
//             highlightUrl(url, tabId);
//             updatedUrls = true;
//             continue;
//         }

//         // If not in database, proceed with other checks
//         const urlFeatures = extractUrlFeatures(url);
        
//         if (urlFeatures.hasIPAddress || urlFeatures.numSpecialChars > 3) {
//             detectedUrls.add(url);
//             await addUrlToDatabase(url); // Add to database
//             highlightUrl(url, tabId);
//             updatedUrls = true;
//             continue;
//         }

//         const isLLMPhishing = await checkWithLLM(url);
//         if (isLLMPhishing) {
//             detectedUrls.add(url);
//             await addUrlToDatabase(url); // Add to database
//             highlightUrl(url, tabId);
//             updatedUrls = true;
//             continue;
//         }

//         const isVirusTotalPhishing = await checkWithVirusTotal(url);
//         if (isVirusTotalPhishing) {
//             detectedUrls.add(url);
//             await addUrlToDatabase(url); // Add to database
//             highlightUrl(url, tabId);
//             updatedUrls = true;
//         }
//     }
    
//     if (updatedUrls) {
//         broadcastStatus();
//     }
// }

// // Store the current notification ID
// let currentNotificationId = 'phishing-alert';

// // Modified highlightUrl function
// function highlightUrl(url, tabId) {
//     chrome.tabs.sendMessage(tabId, {
//         action: 'highlightPhishingUrl',
//         url: url
//     });

//     chrome.action.openPopup();
//     broadcastStatus();
// }

// // Handle extension install/update
// chrome.runtime.onInstalled.addListener(() => {
//     detectedUrls.clear();
// });

// // Add this new function to handle unflagging
// async function handleUnflagUrl(url) {
//     try {
//         // Remove from Supabase database
//         const response = await fetch(`${supabaseUrl}/rest/v1/SuspiciousURL?url=eq.${encodeURIComponent(url)}`, {
//             method: 'DELETE',
//             headers: {
//                 'apikey': supabaseKey,
//                 'Authorization': `Bearer ${supabaseKey}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`Failed to delete URL from database: ${response.status}`);
//         }

//         // Remove from local Set
//         detectedUrls.delete(url);

//         // Remove highlighting from all tabs
//         const tabs = await chrome.tabs.query({});
//         for (const tab of tabs) {
//             try {
//                 await chrome.tabs.sendMessage(tab.id, {
//                     action: 'removeHighlight',
//                     url: url
//                 });
//             } catch (error) {
//                 console.log(`Could not send message to tab ${tab.id}`);
//             }
//         }

//         // Broadcast updated status
//         broadcastStatus();
//         return true;

//     } catch (error) {
//         console.error('Error unflagging URL:', error);
//         return false;
//     }
// }







console.log("Background script is running!");

let detectedUrls = new Set();
let ports = new Set();
const VIRUSTOTAL_API_KEY = 'Your own key'; // Replace with your own key
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3/urls';
const GROQ_API_KEY = "your key";// Replace with your own key


// Store URL data including IP information
let urlDataMap = new Map();

// Supabase configuration
const supabaseUrl = 'https://gcohsrptxssxhpafwvvj.supabase.co';
const supabaseKey = 'your own key'; // Replace with your own key

// Function to add URL to Supabase database
async function addUrlToDatabase(url) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/SuspiciousURL`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('URL added to database:', data);
        return true;
    } catch (error) {
        console.error('Error adding URL to database:', error);
        return false;
    }
}

// Add this new function to check URL in database
async function checkUrlInDatabase(url) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/SuspiciousURL?url=eq.${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.length > 0; // Returns true if URL exists in database
    } catch (error) {
        console.error('Error checking URL in database:', error);
        return false;
    }
}

// New function to resolve hostname to IP using Google DNS API
async function resolveHostnameToIp(hostname) {
    try {
        console.log("Resolving hostname to IP:", hostname);
        
        // If hostname is already an IP, return it directly
        if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname)) {
            return hostname;
        }

        // Use Google's DNS-over-HTTPS API to resolve hostname to IP
        const dnsResponse = await fetch(`https://dns.google/resolve?name=${hostname}`);
        
        if (!dnsResponse.ok) {
            throw new Error(`DNS resolution error: ${dnsResponse.status}`);
        }
        
        const dnsData = await dnsResponse.json();
        
        if (dnsData.Answer && dnsData.Answer.length > 0) {
            // Find the A record (type 1)
            for (const record of dnsData.Answer) {
                if (record.type === 1) { // Type 1 is A record (IPv4)
                    return record.data;
                }
            }
        }
        
        throw new Error('No IP address found for hostname');
    } catch (error) {
        console.error('Error resolving hostname to IP:', error);
        return null;
    }
}

// New function to get host information from Internet DB API
async function getInternetDbInfo(ip) {
    if (!ip) return null;
    
    try {
        console.log("Querying Internet DB for IP:", ip);
        const response = await fetch(`https://internetdb.shodan.io/${ip}`);
        
        if (!response.ok) {
            throw new Error(`Internet DB query error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            ip: ip,
            ports: data.ports || [],
            hostnames: data.hostnames || [],
            cpes: data.cpes || [],
            tags: data.tags || [],
            vulnerabilities: data.vulns || [],
            // Additional fields that we can infer
            country: 'Not available in Internet DB',
            isp: 'Not available in Internet DB',
            lastUpdate: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error getting info from Internet DB:', error);
        return {
            ip: ip,
            ports: [],
            hostnames: [],
            country: 'Unknown',
            isp: 'Unknown',
            lastUpdate: 'Unknown',
            tags: [],
            vulnerabilities: []
        };
    }
}

// Modified function to gather IP information for a URL using Internet DB
async function gatherIpInfo(url) {
    try {
        // Parse URL and extract hostname
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        console.log("Checking hostname:", hostname);

        // First try to resolve hostname to IP
        const ip = await resolveHostnameToIp(hostname);
        console.log("IP from DNS resolve:", ip);

        if (!ip) {
            // If DNS resolve fails
            return {
                url: url,
                hostname: hostname,
                ip: 'Not found',
                ports: [],
                country: 'Unknown',
                isp: 'Unknown',
                tags: [],
                hostnames: [hostname],
                vulnerabilities: []
            };
        }

        // Get host information from Internet DB
        const hostInfo = await getInternetDbInfo(ip);
        console.log("Host info from Internet DB:", hostInfo);

        return {
            url: url,
            hostname: hostname,
            ...hostInfo
        };
    } catch (error) {
        console.error('Error gathering IP info:', error);
        return {
            url: url,
            hostname: 'Error parsing URL',
            ip: 'Error',
            ports: [],
            country: 'Unknown',
            isp: 'Unknown',
            tags: [],
            hostnames: [],
            vulnerabilities: []
        };
    }
}

// Modified broadcast status function to ensure popup gets updates
function broadcastStatus() {
    const urlsArray = Array.from(detectedUrls);
    
    // Update all connected ports
    for (const port of ports) {
        try {
            port.postMessage({
                type: 'scanningStatus',
                detectedUrls: urlsArray,
                urlDataMap: Object.fromEntries(urlDataMap)
            });
        } catch (error) {
            console.error('Error broadcasting status:', error);
            ports.delete(port);
        }
    }

    // Update notification if needed
    if (urlsArray.length > 0) {
        chrome.notifications.create('phishing-detector', {
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Phishing URLs Detected!',
            message: `Total of ${urlsArray.length} suspicious URL${urlsArray.length > 1 ? 's' : ''} found.`,
            priority: 2,
            requireInteraction: true
        });
    } else {
        chrome.notifications.clear('phishing-detector');
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
        return urlCache.get(url);
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

        const result = response?.toLowerCase().includes("suspicious");
        urlCache.set(url, result);
        return result;
        
    } catch (error) {
        console.error('Groq API error:', error);
        return false;
    }
}

// Check URL with VirusTotal API with rate limiting
async function checkWithVirusTotal(url) {
    try {
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
        
        port.postMessage({
            type: 'scanningStatus',
            detectedUrls: Array.from(detectedUrls),
            urlDataMap: Object.fromEntries(urlDataMap)
        });

        port.onMessage.addListener(async (msg) => {
            if (msg.action === 'getStatus') {
                port.postMessage({
                    type: 'scanningStatus',
                    detectedUrls: Array.from(detectedUrls),
                    urlDataMap: Object.fromEntries(urlDataMap)
                });
            }
            
            if (msg.action === 'getIpData') {
                const url = msg.url;
                
                // Check if we already have data
                if (urlDataMap.has(url) && urlDataMap.get(url).ipInfo) {
                    port.postMessage({
                        type: 'ipData',
                        url: url,
                        data: urlDataMap.get(url).ipInfo
                    });
                } else {
                    // Fetch IP data
                    console.log("Fetching IP data for:", url);
                    const ipInfo = await gatherIpInfo(url);
                    
                    // Update the URL data map
                    if (!urlDataMap.has(url)) {
                        urlDataMap.set(url, {});
                    }
                    urlDataMap.get(url).ipInfo = ipInfo;
                    
                    // Send back to popup
                    port.postMessage({
                        type: 'ipData',
                        url: url,
                        data: ipInfo
                    });
                    
                    // Broadcast updated status to all connected ports
                    broadcastStatus();
                }
            }
            
            broadcastStatus();
        });

        port.onDisconnect.addListener(() => {
            ports.delete(port);
        });
    }
});

// Handle messages from content scripts and popup
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

    if (request.action === 'getStatus') {
        sendResponse({
            type: 'scanningStatus',
            detectedUrls: Array.from(detectedUrls),
            urlDataMap: Object.fromEntries(urlDataMap)
        });
        return true;
    }

    if (request.action === 'unflagUrl') {
        handleUnflagUrl(request.url).then(success => {
            sendResponse({ success });
        });
        return true; // Required for async response
    }
    
    if (request.action === 'getIpData') {
        const url = request.url;
        gatherIpInfo(url).then(data => {
            if (!urlDataMap.has(url)) {
                urlDataMap.set(url, {});
            }
            urlDataMap.get(url).ipInfo = data;
            sendResponse({ success: true, data: data });
            broadcastStatus();
        });
        return true; // Required for async response
    }
    
    if (request.action === 'scanCurrentPage') {
        if (sender && sender.tab) {
            chrome.tabs.sendMessage(sender.tab.id, { action: 'scanPage' }, () => {
                sendResponse({ message: 'Scanning initiated' });
            });
        } else {
            sendResponse({ message: 'Tab information not available' });
        }
        return true;
    }
});

// Modified checkUrls function to include database integration
async function checkUrls(urls, tabId) {
    let updatedUrls = false;
    
    for (const url of urls) {
        if (detectedUrls.has(url)) continue;

        // First check if URL exists in database
        const existsInDatabase = await checkUrlInDatabase(url);
        if (existsInDatabase) {
            console.log('URL found in database, skipping API checks:', url);
            detectedUrls.add(url);
            
            // Initialize URL data in map if needed
            if (!urlDataMap.has(url)) {
                urlDataMap.set(url, {});
            }
            
            highlightUrl(url, tabId);
            updatedUrls = true;
            continue;
        }

        // If not in database, proceed with other checks
        const urlFeatures = extractUrlFeatures(url);
        
        if (urlFeatures.hasIPAddress || urlFeatures.numSpecialChars > 3) {
            detectedUrls.add(url);
            await addUrlToDatabase(url); // Add to database
            
            // Initialize URL data in map if needed
            if (!urlDataMap.has(url)) {
                urlDataMap.set(url, {});
            }
            
            highlightUrl(url, tabId);
            updatedUrls = true;
            continue;
        }

        const isLLMPhishing = await checkWithLLM(url);
        if (isLLMPhishing) {
            detectedUrls.add(url);
            await addUrlToDatabase(url); // Add to database
            
            // Initialize URL data in map if needed
            if (!urlDataMap.has(url)) {
                urlDataMap.set(url, {});
            }
            
            highlightUrl(url, tabId);
            updatedUrls = true;
            continue;
        }

        const isVirusTotalPhishing = await checkWithVirusTotal(url);
        if (isVirusTotalPhishing) {
            detectedUrls.add(url);
            await addUrlToDatabase(url); // Add to database
            
            // Initialize URL data in map if needed
            if (!urlDataMap.has(url)) {
                urlDataMap.set(url, {});
            }
            
            highlightUrl(url, tabId);
            updatedUrls = true;
        }
    }
    
    if (updatedUrls) {
        broadcastStatus();
    }
}

// Store the current notification ID
let currentNotificationId = 'phishing-alert';

// Modified highlightUrl function
function highlightUrl(url, tabId) {
    chrome.tabs.sendMessage(tabId, {
        action: 'highlightPhishingUrl',
        url: url
    });

    chrome.action.openPopup();
    broadcastStatus();
}

// Handle extension install/update
chrome.runtime.onInstalled.addListener(() => {
    detectedUrls.clear();
    urlDataMap.clear();
});

// Add this new function to handle unflagging
async function handleUnflagUrl(url) {
    try {
        // Remove from Supabase database
        const response = await fetch(`${supabaseUrl}/rest/v1/SuspiciousURL?url=eq.${encodeURIComponent(url)}`, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete URL from database: ${response.status}`);
        }

        // Remove from local Set and Map
        detectedUrls.delete(url);
        urlDataMap.delete(url);

        // Remove highlighting from all tabs
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'removeHighlight',
                    url: url
                });
            } catch (error) {
                console.log(`Could not send message to tab ${tab.id}`);
            }
        }

        // Broadcast updated status
        broadcastStatus();
        return true;

    } catch (error) {
        console.error('Error unflagging URL:', error);
        return false;
    }
}

