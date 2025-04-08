//Pish trail waala pish

console.log("Background script is running!");

let detectedUrls = new Set();
let ports = new Set();
const VIRUSTOTAL_API_KEY = ''; //your key
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3/urls';
const GROQ_API_KEY = ""; //your key

// Store URL data including IP information
let urlDataMap = new Map();

// Supabase configuration
const supabaseUrl = 'https://gcohsrptxssxhpafwvvj.supabase.co';
const supabaseKey = ''; //your key

// List of popular domains to check against for typosquatting
const POPULAR_DOMAINS = [
    'google.com', 'facebook.com', 'amazon.com', 'youtube.com', 'twitter.com',
    'instagram.com', 'linkedin.com', 'microsoft.com', 'apple.com', 'netflix.com',
    'yahoo.com', 'ebay.com', 'reddit.com', 'wikipedia.org', 'github.com'
];

// Function to calculate Levenshtein distance between two strings
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Function to check for common typosquatting patterns
function checkTyposquattingPatterns(hostname) {
    const patterns = [
        /^(www\.)?([a-z0-9]+)(\-[a-z0-9]+)?\.(com|net|org|info|biz|us|co|uk)$/i,
        /^([a-z0-9]+)(\-[a-z0-9]+)?\.(com|net|org|info|biz|us|co|uk)$/i
    ];
    
    let match = null;
    for (const pattern of patterns) {
        match = hostname.match(pattern);
        if (match) break;
    }
    
    if (!match) return false;
    
    const domainPart = match[2] || match[1];
    const tld = match[3];
    
    // Check against popular domains
    for (const popularDomain of POPULAR_DOMAINS) {
        const [popularMain, popularTld] = popularDomain.split('.');
        
        // Check if the domain part is similar to a popular domain
        const distance = levenshteinDistance(domainPart, popularMain);
        const similarityThreshold = Math.floor(popularMain.length * 0.3); // 30% of length
        
        if (distance <= similarityThreshold && distance > 0) {
            // Check if TLD is different
            if (tld !== popularTld) {
                return {
                    isTyposquatting: true,
                    originalDomain: popularDomain,
                    distance: distance,
                    type: 'tld-substitution'
                };
            }
            
            return {
                isTyposquatting: true,
                originalDomain: popularDomain,
                distance: distance,
                type: 'character-variation'
            };
        }
    }
    
    return { isTyposquatting: false };
}

// Enhanced function to detect typosquatting
async function detectTyposquatting(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        
        // First check against known patterns
        const patternResult = checkTyposquattingPatterns(hostname);
        if (patternResult.isTyposquatting) {
            return patternResult;
        }
        
        // Then check against popular domains using Levenshtein distance
        const domainParts = hostname.replace('www.', '').split('.');
        const mainDomain = domainParts.length > 1 ? 
            domainParts.slice(-2).join('.') : hostname;
            
        for (const popularDomain of POPULAR_DOMAINS) {
            const distance = levenshteinDistance(mainDomain, popularDomain);
            const similarityThreshold = Math.floor(popularDomain.length * 0.3); // 30% of length
            
            if (distance <= similarityThreshold && distance > 0) {
                return {
                    isTyposquatting: true,
                    originalDomain: popularDomain,
                    distance: distance,
                    type: 'similar-domain'
                };
            }
        }
        
        // Check for homograph attacks (Punycode)
        if (/xn--/.test(hostname)) {
            const decoded = hostname.split('.').map(part => {
                return part.startsWith('xn--') ? 
                    part.replace(/^xn--/, '') : part;
            }).join('.');
            
            if (decoded !== hostname) {
                // Check if decoded domain looks like a popular domain
                for (const popularDomain of POPULAR_DOMAINS) {
                    if (decoded.includes(popularDomain)) {
                        return {
                            isTyposquatting: true,
                            originalDomain: popularDomain,
                            distance: levenshteinDistance(decoded, popularDomain),
                            type: 'homograph-attack'
                        };
                    }
                }
            }
        }
        
        return { isTyposquatting: false };
    } catch (error) {
        console.error('Error in typosquatting detection:', error);
        return { isTyposquatting: false };
    }
}

// Function to add URL to Supabase database
async function addUrlToDatabase(url, explanation, score) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/SuspiciousURL`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ 
                url: url,
                explain: explanation, // New column
                score: score         // New column
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('URL and details added to database:', data);
        return true;
    } catch (error) {
        console.error('Error adding URL to database:', error);
        return false;
    }
}

// Function to fetch URLs from OriginalURL table
async function fetchOriginalUrls() {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/OriginalURL?select=Urls`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch URLs: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const urls = data.map(item => item.Urls).filter(url => url);
        console.log('Successfully fetched URLs from OriginalURL:', urls);
        return urls;
    } catch (error) {
        console.error('Error in fetchOriginalUrls:', error);
        return [];
    }
}

// Function to check if a URL exists in OriginalURL database
async function checkUrlInOriginalDatabase(urlToCheck) {
    try {
        if (!cachedOriginalUrls) {
            cachedOriginalUrls = await fetchOriginalUrls();
        }

        const exists = cachedOriginalUrls.some(originalUrl => {
            try {
                const normalizedOriginal = new URL(originalUrl).hostname.toLowerCase();
                const normalizedCheck = new URL(urlToCheck).hostname.toLowerCase();
                return normalizedOriginal === normalizedCheck;
            } catch {
                return false;
            }
        });

        console.log(`URL check result for ${urlToCheck}:`, exists);
        return exists;
    } catch (error) {
        console.error('Error in checkUrlInOriginalDatabase:', error);
        return false;
    }
}

// Function to test database connection
async function testOriginalUrlDatabaseConnection() {
    try {
        const urls = await fetchOriginalUrls();
        if (urls.length > 0) {
            console.log("OriginalURL Database Connection Successful!");
            console.log("Sample URLs from database:", urls.slice(0, 5));
            return urls;
        } else {
            console.log("OriginalURL Database connected but no URLs found");
            return [];
        }
    } catch (error) {
        console.error('Error testing OriginalURL database connection:', error);
        return null;
    }
}

// Cache management
let cachedOriginalUrls = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to refresh the cache periodically
function setupCacheRefresh() {
    setInterval(() => {
        cachedOriginalUrls = null; // Clear cache
        console.log('OriginalURL cache cleared');
    }, CACHE_DURATION);
}

// Initialize cache refresh
setupCacheRefresh();

// Modified checkUrls function to use the new logic
async function checkUrls(urls, tabId) {
    let updatedUrls = false;
    
    // Ensure we have the original URLs cached
    if (!cachedOriginalUrls) {
        cachedOriginalUrls = await fetchOriginalUrls();
    }
    
    for (const url of urls) {
        if (detectedUrls.has(url)) continue;

        // Check against OriginalURL database first
        const isOriginalUrl = cachedOriginalUrls.some(originalUrl => {
            try {
                const normalizedOriginal = new URL(originalUrl).hostname.toLowerCase();
                const normalizedCheck = new URL(url).hostname.toLowerCase();
                return normalizedOriginal === normalizedCheck;
            } catch {
                return false;
            }
        });

        if (isOriginalUrl) {
            console.log('URL found in OriginalURL database, skipping checks:', url);
            continue;
        }

        // Rest of your existing checkUrls logic...
        // (typosquatting checks, VirusTotal, etc.)
    }
    
    if (updatedUrls) {
        broadcastStatus();
    }
}

// Function to check URL in database
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
        if (data.length > 0) {
            // Store the explanation and score in urlDataMap
            if (!urlDataMap.has(url)) {
                urlDataMap.set(url, {});
            }
            urlDataMap.get(url).explanation = data[0].explain;
            urlDataMap.get(url).suspicionScore = data[0].score;
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking URL in database:', error);
        return false;
    }
}

// Function to resolve hostname to IP using Google DNS API
async function resolveHostnameToIp(hostname) {
    try {
        console.log("Resolving hostname to IP:", hostname);
        
        if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname)) {
            return hostname;
        }

        const dnsResponse = await fetch(`https://dns.google/resolve?name=${hostname}`);
        
        if (!dnsResponse.ok) {
            throw new Error(`DNS resolution error: ${dnsResponse.status}`);
        }
        
        const dnsData = await dnsResponse.json();
        
        if (dnsData.Answer && dnsData.Answer.length > 0) {
            for (const record of dnsData.Answer) {
                if (record.type === 1) {
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

// Function to get host information from Internet DB API
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

// Function to gather IP information for a URL using Internet DB
async function gatherIpInfo(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        console.log("Checking hostname:", hostname);

        const ip = await resolveHostnameToIp(hostname);
        console.log("IP from DNS resolve:", ip);

        if (!ip) {
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

// Broadcast status function
function broadcastStatus() {
    const urlsArray = Array.from(detectedUrls);
    
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

// Groq API helper function
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
                    model: "mistral-saba-24b",
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

// Test Groq connection
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

// New function to calculate suspicion score based on URL features
function calculateSuspicionScore(url, urlFeatures, typosquattingResult) {
    let score = 0;
    const weights = {
        domainLength: 5,         // +5 points if domain length > 20
        specialChars: 10,        // 10 points per 5 special characters
        digits: 8,              // 8 points per 5 digits
        ipAddress: 35,          // Changed: 35 points if URL contains an IP address
        dots: 5,                // 5 points per dot beyond 3
        pathLength: 5,          // 5 points if path length > 50
        queryLength: 5,         // 5 points if query length > 100
        http: 30,              // Added: 30 points if site uses HTTP
        multiSubdomains: 25,    // Changed: 25 points if more than 3 subdomains
        typosquatting: 45,      // Changed: 45 points if typosquatting is detected
        redirects: 30,          // Added: 30 points if redirects are detected
        keywords: 20            // 20 points for suspicious keywords
    };
    
    // Base suspicious score starts at 20%
    score += 20;
    
    // Add weighted scores based on features
    if (urlFeatures.domainLength > 20) score += weights.domainLength;
    score += urlFeatures.numSpecialChars * weights.specialChars / 5;
    score += urlFeatures.numDigits * weights.digits / 5;
    if (urlFeatures.hasIPAddress) score += weights.ipAddress;
    
    // Check for subdomains (only if more than 3)
    const subdomainCount = urlFeatures.numDots - 1;
    if (subdomainCount > 3) {
        score += weights.multiSubdomains;
    }
    
    if (urlFeatures.pathLength > 50) score += weights.pathLength;
    if (urlFeatures.queryLength > 100) score += weights.queryLength;
    
    // Check for HTTP (non-HTTPS)
    if (!urlFeatures.hasHTTPS) score += weights.http;
    
    // Check for typosquatting with higher weight
    if (typosquattingResult.isTyposquatting) {
        score += weights.typosquatting;
    }
    
    // Check for redirects
    if (urlFeatures.hasRedirects) {
        score += weights.redirects;
    }
    
    // Check for suspicious keywords
    const keywords = ['login', 'verify', 'account', 'secure', 'password', 'auth', 'signin', 'bank'];
    for (const keyword of keywords) {
        if (url.toLowerCase().includes(keyword)) {
            score += weights.keywords / keywords.length;
            break;
        }
    }
    
    // Cap the score at 95% to avoid absolute certainty
    return Math.min(Math.round(score), 95);
}

// Enhanced function to generate detailed explanation
async function generateExplanation(url, urlFeatures, typosquattingResult, score) {
    try {
        const messages = [
            {
                role: "user",
                content: `Generate a brief, user-friendly explanation (maximum 150 words) for why this URL is suspicious:
                URL: ${url}
                
                Suspicious Score: ${score}%
                
                Features:
                - Domain Length: ${urlFeatures.domainLength}
                - Special Characters: ${urlFeatures.numSpecialChars}
                - Number of Digits: ${urlFeatures.numDigits}
                - Contains IP Address: ${urlFeatures.hasIPAddress}
                - Number of Dots: ${urlFeatures.numDots}
                - Path Length: ${urlFeatures.pathLength}
                - Query Length: ${urlFeatures.queryLength}
                - Uses HTTPS: ${urlFeatures.hasHTTPS}
                - Multiple Subdomains: more than 3 ${urlFeatures.hasMultiSubdomains}
                ${typosquattingResult.isTyposquatting ? 
                    `- Typosquatting: Similar to ${typosquattingResult.originalDomain} (${typosquattingResult.type})` : 
                    '- Typosquatting: No significant similarity detected'}
                
                Based on these features, explain in simple terms why this URL is suspicious. 
                Start with the most concerning issues first.
                Be specific about security risks.
                Keep it brief but informative.`
                           
                
            }
        ];

        const response = await makeGroqRequest(messages);
        return response || "This URL contains suspicious patterns commonly associated with phishing attempts. Always verify the legitimacy of a site before sharing any personal information.";
    } catch (error) {
        console.error('Error generating explanation:', error);
        return "Unable to generate detailed explanation, but this URL has suspicious characteristics.";
    }
}

// Enhanced checkWithLLM function to include score and explanation
async function checkWithLLM(url) {    
    if (urlCache.has(url)) {
        console.log("Using cached result for:", url);
        return urlCache.get(url);
    }

    try {
        const urlFeatures = extractUrlFeatures(url);
        const typosquattingResult = await detectTyposquatting(url);
        
        // Calculate suspicion score
        const suspicionScore = calculateSuspicionScore(url, urlFeatures, typosquattingResult);
        
        const messages = [
            {
                role: "user",
                content: `Analyze this URL for phishing characteristics:
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
                ${typosquattingResult.isTyposquatting ? 
                    `- Typosquatting: Similar to ${typosquattingResult.originalDomain} (${typosquattingResult.type})` : 
                    '- Typosquatting: No significant similarity detected'}
                - Contains login-related keywords: ${url.includes("login") || url.includes("verify") ? 'Yes' : 'No'} 

                Pay special attention to:
                1. Non-HTTPS URLs (especially with login forms)
                2. Domains with many numbers continuously (like bank1238245815.com)
                3. Multiple subdomains (especially more than 4)
                4. URLs containing login/verify/secure keywords
                5. Typosquatting attempts (similar to popular domains)
                6. Redirection Count - Multiple redirects before landing

                Return only "suspicious" or "safe"`
            }
        ];

        const response = await makeGroqRequest(messages);
        const result = response?.toLowerCase().includes("suspicious");
        
        // Generate explanation if suspicious
        let explanation = null;
        if (result) {
            explanation = await generateExplanation(url, urlFeatures, typosquattingResult, suspicionScore);
        }
        
        urlCache.set(url, {
            isSuspicious: result,
            suspicionScore: suspicionScore,
            explanation: explanation
        });
        
        return {
            isSuspicious: result,
            suspicionScore: suspicionScore,
            explanation: explanation
        };
        
    } catch (error) {
        console.error('Groq API error:', error);
        return {
            isSuspicious: false,
            suspicionScore: 0,
            explanation: null
        };
    }
}

// Detect redirect chain
async function checkRedirects(url) {
    try {
        const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        return response.redirected ? response.url : null;
    } catch (error) {
        console.error("Redirect check error:", error);
        return null;
    }
}

async function detectRedirectChain(url) {
    let redirects = [];
    let currentUrl = url;

    while (currentUrl) {
        let nextUrl = await checkRedirects(currentUrl);
        if (nextUrl && nextUrl !== currentUrl) {
            redirects.push(nextUrl);
            currentUrl = nextUrl;
        } else {
            break;
        }
    }

    return redirects.length > 0 ? redirects : null;
}

// Check URL with VirusTotal API
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
                
                if (urlDataMap.has(url) && urlDataMap.get(url).ipInfo) {
                    port.postMessage({
                        type: 'ipData',
                        url: url,
                        data: urlDataMap.get(url).ipInfo
                    });
                } else {
                    console.log("Fetching IP data for:", url);
                    const ipInfo = await gatherIpInfo(url);
                    
                    if (!urlDataMap.has(url)) {
                        urlDataMap.set(url, {});
                    }
                    urlDataMap.get(url).ipInfo = ipInfo;
                    
                    port.postMessage({
                        type: 'ipData',
                        url: url,
                        data: ipInfo
                    });
                    
                    broadcastStatus();
                }
            }
            
            if (msg.action === 'getExplanation') {
                const url = msg.url;
                
                if (urlDataMap.has(url) && urlDataMap.get(url).explanation) {
                    port.postMessage({
                        type: 'explanation',
                        url: url,
                        explanation: urlDataMap.get(url).explanation
                    });
                } else {
                    console.log("Generating explanation for:", url);
                    const urlFeatures = extractUrlFeatures(url);
                    const typosquattingResult = await detectTyposquatting(url);
                    const suspicionScore = urlDataMap.get(url)?.suspicionScore || 70;
                    const explanation = await generateExplanation(url, urlFeatures, typosquattingResult, suspicionScore);
                    
                    if (!urlDataMap.has(url)) {
                        urlDataMap.set(url, {});
                    }
                    urlDataMap.get(url).explanation = explanation;
                    
                    port.postMessage({
                        type: 'explanation',
                        url: url,
                        explanation: explanation
                    });
                    
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
        return true;
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
        return true;
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

    if (request.action === 'getExplanation') {
        const url = request.url;
        
        if (urlDataMap.has(url) && urlDataMap.get(url).explanation) {
            sendResponse({ 
                success: true, 
                explanation: urlDataMap.get(url).explanation 
            });
        } else {
            // Generate explanation if we don't have one
            (async () => {
                const urlFeatures = extractUrlFeatures(url);
                const typosquattingResult = await detectTyposquatting(url);
                const suspicionScore = urlDataMap.get(url)?.suspicionScore || 70;
                const explanation = await generateExplanation(url, urlFeatures, typosquattingResult, suspicionScore);
                
                if (!urlDataMap.has(url)) {
                    urlDataMap.set(url, {});
                }
                urlDataMap.get(url).explanation = explanation;
                
                sendResponse({ 
                    success: true, 
                    explanation: explanation 
                });
                broadcastStatus();
            })();
        }
        return true;
    }
});

// Main URL checking function
async function checkUrls(urls, tabId) {
    let updatedUrls = false;
    
    for (const url of urls) {
        if (detectedUrls.has(url)) continue;

        // First check if URL exists in OriginalURL database
        const isOriginalUrl = await checkUrlInOriginalDatabase(url);
        if (isOriginalUrl) {
            console.log('URL found in OriginalURL database, skipping checks:', url);
            continue;
        }

        // Then check if URL exists in SuspiciousURL database
        const existsInDatabase = await checkUrlInDatabase(url);
        if (existsInDatabase) {
            console.log('URL found in SuspiciousURL database:', url);
            detectedUrls.add(url);
            
            // Data already loaded into urlDataMap by checkUrlInDatabase
            highlightUrl(url, tabId);
            updatedUrls = true;
            continue;
        }

        // Proceed with other checks if URL is not in either database
        const urlFeatures = extractUrlFeatures(url);
        
        if (urlFeatures.hasIPAddress || urlFeatures.numSpecialChars > 3) {
            const typosquattingResult = await detectTyposquatting(url);
            const suspicionScore = calculateSuspicionScore(url, urlFeatures, typosquattingResult);
            const explanation = await generateExplanation(url, urlFeatures, typosquattingResult, suspicionScore);
            
            detectedUrls.add(url);
            await addUrlToDatabase(url, explanation, suspicionScore);
            
            if (!urlDataMap.has(url)) {
                urlDataMap.set(url, {
                    suspicionScore: suspicionScore,
                    explanation: explanation
                });
            }
            
            highlightUrl(url, tabId);
            updatedUrls = true;
            continue;
        }

        const llmResult = await checkWithLLM(url);
        if (llmResult.isSuspicious) {
            detectedUrls.add(url);
            await addUrlToDatabase(url, llmResult.explanation, llmResult.suspicionScore);
            
            if (!urlDataMap.has(url)) {
                urlDataMap.set(url, {
                    suspicionScore: llmResult.suspicionScore,
                    explanation: llmResult.explanation
                });
            }
            
            highlightUrl(url, tabId);
            updatedUrls = true;
            continue;
        }

        const isVirusTotalPhishing = await checkWithVirusTotal(url);
        if (isVirusTotalPhishing) {
            const typosquattingResult = await detectTyposquatting(url);
            const suspicionScore = calculateSuspicionScore(url, urlFeatures, typosquattingResult);
            const explanation = "This URL has been flagged as malicious by multiple security vendors on VirusTotal.";
            
            detectedUrls.add(url);
            await addUrlToDatabase(url, explanation, Math.max(suspicionScore, 80));
            
            if (!urlDataMap.has(url)) {
                urlDataMap.set(url, {
                    suspicionScore: Math.max(suspicionScore, 80),
                    explanation: explanation
                });
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

// Highlight URL function
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

// Handle unflagging URLs
async function handleUnflagUrl(url) {
    try {
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

        detectedUrls.delete(url);
        urlDataMap.delete(url);

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

        broadcastStatus();
        return true;

    } catch (error) {
        console.error('Error unflagging URL:', error);
        return false;
    }
}