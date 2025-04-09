//content.js
//MAIN WORKING CODE IG THE HIGHLIGHT ALL URLS ISNT THERE 


// let isScanning = true;

// // Function to extract all the URLs on the page
// function getUrlsFromPage() {
//   let urls = [];
  
//   // Access the DOM to get all anchor tags (<a>) on the page
//   let links = document.querySelectorAll('a');

//   // Iterate through each link and extract the 'href' attribute (URL)
//   links.forEach(link => {
//     if (link.href) {
//       urls.push(link.href);
//     }
//   });

//   // Also check for buttons or elements with click events and data attributes containing URLs
//   let elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
//   elements.forEach(element => {
//     if (element.getAttribute('onclick')) {
//       const match = element.getAttribute('onclick').match(/https?:\/\/[^"'\s]+/);
//       if (match) {
//         urls.push(match[0]);
//       }
//     }
//     if (element.dataset.href) {
//       urls.push(element.dataset.href);
//     }
//     if (element.dataset.url) {
//       urls.push(element.dataset.url);
//     }
//   });

//   return urls;
// }

// // Function to scan for URLs on the page and send them for checking
// function scanForUrls() {
//   // Get all URLs from the page using `getUrlsFromPage`
//   const urls = getUrlsFromPage();

//   // Send URLs to the background script for checking
//   if (urls.length > 0) {
//     chrome.runtime.sendMessage({
//       action: 'checkUrls',
//       urls: urls
//     });
//   }

//   // Highlight all URLs
//   //highlightAllUrls();
// }

// // Function to highlight a specific URL element
// function highlightUrl(element) {
//   element.style.backgroundColor = '#ffff00';
//   element.style.textDecoration = 'underline wavy red';
// }

// // Function to highlight all URLs on the screen with neon yellow
// /*function highlightAllUrls() {
//   const links = document.querySelectorAll('a');
//   links.forEach(link => {
//     link.style.backgroundColor = 'neonyellow';
//     link.style.color = 'yellow';
//     link.style.border = '1px solid black';
//     link.style.padding = '2px';
//   });

//   const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
//   elements.forEach(element => {
//     element.style.backgroundColor = 'neonyellow';
//     element.style.color = 'yellow';
//     element.style.border = '1px solid black';
//     element.style.padding = '2px';
//   });
// }*/

// // Function to remove all highlights
// function removeHighlights() {
//   const links = document.querySelectorAll('a');
//   links.forEach(link => {
//     link.style.removeProperty('background-color');
//     link.style.removeProperty('color');
//     link.style.removeProperty('border');
//     link.style.removeProperty('padding');
//   });

//   const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
//   elements.forEach(element => {
//     element.style.removeProperty('background-color');
//     element.style.removeProperty('color');
//     element.style.removeProperty('border');
//     element.style.removeProperty('padding');
//   });
// }

// // Listen for messages from the background script
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === 'highlightPhishingUrl') {
//     const links = document.getElementsByTagName('a');
//     for (let link of links) {
//       if (link.href === request.url) {
//         highlightUrl(link);
        
//         // Add a click event listener to show a warning page
//         link.addEventListener('click', (e) => {
//           e.preventDefault();
//           // Create custom notification
//           const notification = document.createElement('div');
//           notification.style.position = 'fixed';
//           notification.style.top = '20%';
//           notification.style.left = '50%';
//           notification.style.transform = 'translate(-50%, -50%)';
//           notification.style.backgroundColor = '#fff';
//           notification.style.border = '2px solid red';
//           notification.style.padding = '20px';
//           notification.style.borderRadius = '5px';
//           notification.style.zIndex = '9999';
//           notification.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
//           notification.style.minWidth = '300px';
//           notification.style.textAlign = 'center';
          
//           notification.innerHTML = `
//             <h3 style="color: red; margin-top: 0;">⚠️ Phishing Alert!</h3>
//             <p>This URL appears to be suspicious and may be a phishing attempt.</p>
//             <p style="font-weight: bold;">${link.href}</p>
//             <div style="display: flex; justify-content: space-around; margin-top: 15px;">
//               <button id="proceed-btn" style="padding: 8px 15px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Proceed Anyway</button>
//               <button id="cancel-btn" style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Cancel</button>
//             </div>
//           `;
          
//           document.body.appendChild(notification);
          
//           // Add event listeners to buttons
//           document.getElementById('proceed-btn').addEventListener('click', () => {
//             document.body.removeChild(notification);
//             window.location.href = link.href;
//           });
          
//           document.getElementById('cancel-btn').addEventListener('click', () => {
//             document.body.removeChild(notification);
//           });
//         });
//       }
//     }
//   }
//   else if (request.action === 'removeHighlight') {
//     const links = document.getElementsByTagName('a');
//     for (let link of links) {
//       if (link.href === request.url) {
//         // Remove highlighting styles
//         link.style.backgroundColor = '';
//         link.style.border = '';
//         link.style.padding = '';
//         link.style.borderRadius = '';
//         link.style.textDecoration = '';
//         link.style.color = '';
//         // Remove click event listener by cloning and replacing the element
//         const newLink = link.cloneNode(true);
//         link.parentNode.replaceChild(newLink, link);
//       }
//     }
//   }
// });

// // Start initial scan when the page loads
// scanForUrls();

// // Set up periodic scanning
// //setInterval(scanForUrls, 5000); // Scan every 5 seconds changed this to try for better cpu usage 
// let lastScanTime = 0;
// document.addEventListener('scroll', () => {
//     let now = Date.now();
//     if (now - lastScanTime > 30000) { // Scan every 30 seconds max
//         scanForUrls();
//         lastScanTime = now;
//     }
// });








// let isScanning = true;

// // Function to extract all the URLs on the page
// function getUrlsFromPage() {
//   let urls = [];
  
//   // Access the DOM to get all anchor tags (<a>) on the page
//   let links = document.querySelectorAll('a');

//   // Iterate through each link and extract the 'href' attribute (URL)
//   links.forEach(link => {
//     if (link.href) {
//       urls.push(link.href);
//     }
//   });

//   // Also check for buttons or elements with click events and data attributes containing URLs
//   let elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
//   elements.forEach(element => {
//     if (element.getAttribute('onclick')) {
//       const match = element.getAttribute('onclick').match(/https?:\/\/[^"'\s]+/);
//       if (match) {
//         urls.push(match[0]);
//       }
//     }
//     if (element.dataset.href) {
//       urls.push(element.dataset.href);
//     }
//     if (element.dataset.url) {
//       urls.push(element.dataset.url);
//     }
//   });

//   return urls;
// }

// // Function to scan for URLs on the page and send them for checking
// function scanForUrls() {
//   // Get all URLs from the page using `getUrlsFromPage`
//   const urls = getUrlsFromPage();

//   // Send URLs to the background script for checking
//   if (urls.length > 0) {
//     chrome.runtime.sendMessage({
//       action: 'checkUrls',
//       urls: urls
//     });
//   }

//   // Highlight all URLs
//   //highlightAllUrls();
// }

// // Function to highlight a specific URL element
// function highlightUrl(element) {
//   element.style.backgroundColor = '#ffff00';
//   element.style.textDecoration = 'underline wavy red';
// }

// // Function to highlight all URLs on the screen with neon yellow
// /*function highlightAllUrls() {
//   const links = document.querySelectorAll('a');
//   links.forEach(link => {
//     link.style.backgroundColor = 'neonyellow';
//     link.style.color = 'yellow';
//     link.style.border = '1px solid black';
//     link.style.padding = '2px';
//   });

//   const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
//   elements.forEach(element => {
//     element.style.backgroundColor = 'neonyellow';
//     element.style.color = 'yellow';
//     element.style.border = '1px solid black';
//     element.style.padding = '2px';
//   });
// }*/

// // Function to remove all highlights
// function removeHighlights() {
//   const links = document.querySelectorAll('a');
//   links.forEach(link => {
//     link.style.removeProperty('background-color');
//     link.style.removeProperty('color');
//     link.style.removeProperty('border');
//     link.style.removeProperty('padding');
//   });

//   const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
//   elements.forEach(element => {
//     element.style.removeProperty('background-color');
//     element.style.removeProperty('color');
//     element.style.removeProperty('border');
//     element.style.removeProperty('padding');
//   });
// }

// // Listen for messages from the background script
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === 'highlightPhishingUrl') {
//     const links = document.getElementsByTagName('a');
//     for (let link of links) {
//       if (link.href === request.url) {
//         highlightUrl(link);
        
//         // Add a click event listener to show a warning page
//         link.addEventListener('click', (e) => {
//           e.preventDefault();
//           // Create custom notification
//           const notification = document.createElement('div');
//           notification.style.position = 'fixed';
//           notification.style.top = '20%';
//           notification.style.left = '50%';
//           notification.style.transform = 'translate(-50%, -50%)';
//           notification.style.backgroundColor = '#fff';
//           notification.style.border = '2px solid red';
//           notification.style.padding = '20px';
//           notification.style.borderRadius = '5px';
//           notification.style.zIndex = '9999';
//           notification.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
//           notification.style.minWidth = '300px';
//           notification.style.textAlign = 'center';
          
//           notification.innerHTML = `
//             <h3 style="color: red; margin-top: 0;">⚠️ Phishing Alert!</h3>
//             <p>This URL appears to be suspicious and may be a phishing attempt.</p>
//             <p style="font-weight: bold;">${link.href}</p>
//             <div style="display: flex; justify-content: space-around; margin-top: 15px;">
//               <button id="proceed-btn" style="padding: 8px 15px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Proceed Anyway</button>
//               <button id="cancel-btn" style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Cancel</button>
//             </div>
//           `;
          
//           document.body.appendChild(notification);
          
//           // Add event listeners to buttons
//           document.getElementById('proceed-btn').addEventListener('click', () => {
//             document.body.removeChild(notification);
//             window.location.href = link.href;
//           });
          
//           document.getElementById('cancel-btn').addEventListener('click', () => {
//             document.body.removeChild(notification);
//           });
//         });
//       }
//     }
//   }
//   else if (request.action === 'removeHighlight') {
//     const links = document.getElementsByTagName('a');
//     for (let link of links) {
//       if (link.href === request.url) {
//         // Remove highlighting styles
//         link.style.backgroundColor = '';
//         link.style.border = '';
//         link.style.padding = '';
//         link.style.borderRadius = '';
//         link.style.textDecoration = '';
//         link.style.color = '';
//         // Remove click event listener by cloning and replacing the element
//         const newLink = link.cloneNode(true);
//         link.parentNode.replaceChild(newLink, link);
//       }
//     }
//   }
// });

// // Start initial scan when the page loads
// scanForUrls();

// // Set up periodic scanning
// //setInterval(scanForUrls, 5000); // Scan every 5 seconds changed this to try for better cpu usage 
// let lastScanTime = 0;
// document.addEventListener('scroll', () => {
//     let now = Date.now();
//     if (now - lastScanTime > 30000) { // Scan every 30 seconds max
//         scanForUrls();
//         lastScanTime = now;
//     }
// });






let isScanning = true;

// Function to extract all the URLs on the page
function getUrlsFromPage() {
  let urls = [];
  
  // Access the DOM to get all anchor tags (<a>) on the page
  let links = document.querySelectorAll('a');

  // Iterate through each link and extract the 'href' attribute (URL)
  links.forEach(link => {
    if (link.href) {
      urls.push(link.href);
    }
  });

  // Also check for buttons or elements with click events and data attributes containing URLs
  let elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
  elements.forEach(element => {
    if (element.getAttribute('onclick')) {
      const match = element.getAttribute('onclick').match(/https?:\/\/[^"'\s]+/);
      if (match) {
        urls.push(match[0]);
      }
    }
    if (element.dataset.href) {
      urls.push(element.dataset.href);
    }
    if (element.dataset.url) {
      urls.push(element.dataset.url);
    }
  });

  return urls;
}

// Function to scan for URLs on the page and send them for checking
function scanForUrls() {
  // Get all URLs from the page using `getUrlsFromPage`
  const urls = getUrlsFromPage();

  // Send URLs to the background script for checking
  if (urls.length > 0) {
    chrome.runtime.sendMessage({
      action: 'checkUrls',
      urls: urls
    });
  }

  // Highlight all URLs
  //highlightAllUrls();
}

// Function to highlight a specific URL element
function highlightUrl(element) {
  // Apply consistent highlighting style
  element.style.cssText = `
    background-color: #ffff00 !important;
    text-decoration: wavy underline red !important;
    text-decoration-thickness: 2px !important;
    padding: 2px 4px !important;
    border-radius: 2px !important;
    display: inline-block !important;
  `;

  // Add warning icon
  if (!element.querySelector('.warning-icon')) {
    const warningIcon = document.createElement('span');
    warningIcon.className = 'warning-icon';
    warningIcon.textContent = '⚠️';
    warningIcon.style.cssText = 'margin-left: 5px !important; font-size: 14px !important;';
    element.appendChild(warningIcon);
  }
}

// Function to highlight all URLs on the screen with neon yellow
/*function highlightAllUrls() {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.style.backgroundColor = 'neonyellow';
    link.style.color = 'yellow';
    link.style.border = '1px solid black';
    link.style.padding = '2px';
  });

  const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
  elements.forEach(element => {
    element.style.backgroundColor = 'neonyellow';
    element.style.color = 'yellow';
    element.style.border = '1px solid black';
    element.style.padding = '2px';
  });
}*/

// Function to remove all highlights
function removeHighlights() {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    link.style.removeProperty('background-color');
    link.style.removeProperty('color');
    link.style.removeProperty('border');
    link.style.removeProperty('padding');
  });

  const elements = document.querySelectorAll('[onclick], [data-href], [data-url]');
  elements.forEach(element => {
    element.style.removeProperty('background-color');
    element.style.removeProperty('color');
    element.style.removeProperty('border');
    element.style.removeProperty('padding');
  });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'highlightPhishingUrl') {
    // Use querySelectorAll for better compatibility
    const links = document.querySelectorAll(`a[href="${request.url}"]`);
    links.forEach(link => {
      highlightUrl(link);
      
      // Add click event listener for warning
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showWarningPopup(link.href);
      });
    });
    sendResponse({ success: true });
  }
  else if (request.action === 'removeHighlight') {
    // Fix unflag functionality
    const links = document.querySelectorAll(`a[href="${request.url}"]`);
    links.forEach(link => {
      // Remove all styling
      link.style.cssText = '';
      
      // Remove warning icon if present
      const warningIcon = link.querySelector('.warning-icon');
      if (warningIcon) {
        warningIcon.remove();
      }
      
      // Remove click event listeners by cloning
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
    });

    // Notify background script that unflag was successful
    chrome.runtime.sendMessage({
      action: 'unflagComplete',
      url: request.url
    });
    
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});

// Helper function to show warning popup with fixed button handling
function showWarningPopup(url) {
    // Remove any existing popup first
    const existingPopup = document.getElementById('phishing-warning-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'phishing-warning-popup';
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        border: 2px solid red;
        padding: 20px;
        border-radius: 5px;
        z-index: 2147483647;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        min-width: 300px;
        text-align: center;
    `;
    
    notification.innerHTML = `
        <h3 style="color: red; margin-top: 0;">⚠️ Phishing Alert!</h3>
        <p>This URL appears to be suspicious and may be a phishing attempt.</p>
        <p style="font-weight: bold; word-break: break-all;">${url}</p>
        <div style="display: flex; justify-content: space-around; margin-top: 15px;">
            <button id="proceed-anyway-btn" style="padding: 8px 15px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer; margin: 0 5px;">Proceed Anyway</button>
            <button id="cancel-warning-btn" style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer; margin: 0 5px;">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(notification);

    // Add event listeners with proper cleanup
    const handleProceed = () => {
        notification.remove();
        window.location.href = url;
    };

    const handleCancel = () => {
        notification.remove();
    };

    // Use unique IDs and add listeners after DOM insertion
    const proceedBtn = document.getElementById('proceed-anyway-btn');
    const cancelBtn = document.getElementById('cancel-warning-btn');
    
    if (proceedBtn) proceedBtn.addEventListener('click', handleProceed);
    if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);

    // Add escape key handler
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            notification.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Start initial scan when the page loads
scanForUrls();

// Set up periodic scanning
//setInterval(scanForUrls, 5000); // Scan every 5 seconds changed this to try for better cpu usage 
let lastScanTime = 0;
document.addEventListener('scroll', () => {
    let now = Date.now();
    if (now - lastScanTime > 30000) { // Scan every 30 seconds max
        scanForUrls();
        lastScanTime = now;
    }
});

// ============= START OF EMAIL MESSENGER SCANNER ===============
console.log("Email and messaging scanner loaded");

// Configuration for different platforms
const platformConfig = {
    'mail.google.com': {
        urlContainers: [
            'a[href]',                  // Regular links
            'span[data-email-link]',    // Gmail-specific link containers
            '.ii.gt'                    // Email content containers
        ],
        textContainers: ['.gs', '.ii.gt', '.a3s']
    },
    'outlook.com': {
        urlContainers: ['a[href]', '.x_link'],
        textContainers: ['.rps_9509', '.x_content']
    },
    'yahoo.com': {
        urlContainers: ['a[href]'],
        textContainers: ['.msg-body']
    },
    'web.whatsapp.com': {
        urlContainers: ['a[href]', '[data-pre-plain-text]'],
        textContainers: ['.selectable-text', '.copyable-text']
    },
    'facebook.com': {
        urlContainers: ['a[href]'],
        textContainers: ['.xzsf02u', '.x11i5rnm']
    },
    'slack.com': {
        urlContainers: ['a[href]', '.c-link'],
        textContainers: ['.p-rich_text_section']
    }
};

// Determine current platform
function getCurrentPlatform() {
    const hostname = window.location.hostname;
    for (const platform in platformConfig) {
        if (hostname.includes(platform)) {
            return platform;
        }
    }
    return null;
}

// Extract URLs from text
function extractUrlsFromText(text) {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    return text.match(urlRegex) || [];
}

// Scan the page for URLs
function scanPageForUrls() {
    const platform = getCurrentPlatform();
    if (!platform) return [];
    
    const config = platformConfig[platform];
    const urlsFound = new Set();
    
    // Get URLs from link elements
    if (config.urlContainers) {
        config.urlContainers.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                const href = element.getAttribute('href');
                if (href && href.startsWith('http')) {
                    urlsFound.add(href);
                }
            });
        });
    }
    
    // Extract URLs from text content
    if (config.textContainers) {
        config.textContainers.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                const textContent = element.textContent || '';
                const extractedUrls = extractUrlsFromText(textContent);
                extractedUrls.forEach(url => urlsFound.add(url));
            });
        });
    }
    
    return Array.from(urlsFound);
}

// Process and send URLs to background script
function processFoundUrls() {
    const urls = scanPageForUrls();
    if (urls.length > 0) {
        chrome.runtime.sendMessage({
            action: 'checkUrls',
            urls: urls
        }, response => {
            console.log('URLs sent for checking:', urls.length);
        });
    }
}

// Run initial scan for email platforms
processFoundUrls();

// Add mutation observer to detect content changes
const emailObserver = new MutationObserver((() => {
    let timeout;
    return (mutations) => {
        // Clear existing timeout
        if (timeout) {
            clearTimeout(timeout);
        }
        
        // Set new timeout to debounce processing
        timeout = setTimeout(() => {
            const hasRelevantChanges = mutations.some(mutation => 
                mutation.type === 'childList' || 
                mutation.type === 'characterData'
            );
            
            if (hasRelevantChanges) {
                processFoundUrls();
            }
        }, 500);
    };
})());

// Start observing the document for email platforms
emailObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: false,
    characterDataOldValue: false
});

// Add custom highlighting for phishing URLs in email platforms
function highlightPhishingUrlInEmail(url) {
    // Find all links, including those in iframes
    const frames = Array.from(document.getElementsByTagName('iframe'));
    const docs = [document, ...frames.map(f => {
        try {
            return f.contentDocument;
        } catch(e) {
            return null;
        }
    })].filter(Boolean);

    docs.forEach(doc => {
        // Find exact URL matches
        const allLinks = doc.querySelectorAll('a[href]');
        allLinks.forEach(link => {
            if (link.href === url || isURLSimilar(link.href, url)) {
                applyHighlighting(link, url);
            }
        });

        // Find text occurrences of the URL
        const walker = doc.createTreeWalker(
            doc.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.includes(url)) {
                const span = doc.createElement('span');
                span.innerHTML = node.textContent.replace(
                    url,
                    `<span style="background-color:#ffff00; text-decoration:wavy underline red;">${url}</span>`
                );
                node.parentNode.replaceChild(span, node);
            }
        }
    });
}

// Add URL similarity check
function isURLSimilar(url1, url2) {
    try {
        const u1 = new URL(url1);
        const u2 = new URL(url2);
        return u1.hostname === u2.hostname || 
               levenshteinDistance(u1.hostname, u2.hostname) <= 2;
    } catch(e) {
        return false;
    }
}

// Apply highlighting consistently
function applyHighlighting(link, url) {
    // Remove any existing highlighting first
    link.style.removeProperty('background-color');
    link.style.removeProperty('text-decoration');
    
    // Apply new highlighting
    link.style.cssText = `
        background-color: #ffff00 !important;
        text-decoration: wavy underline red !important;
        text-decoration-thickness: 2px !important;
        padding: 2px 4px !important;
        border-radius: 2px !important;
        display: inline-block !important;
    `;
    
    // Add warning icon if not already present
    if (!link.querySelector('.warning-icon')) {
        const warningIcon = document.createElement('span');
        warningIcon.className = 'warning-icon';
        warningIcon.textContent = '⚠️';
        warningIcon.style.cssText = `
            margin-left: 5px !important;
            font-size: 14px !important;
            vertical-align: middle !important;
        `;
        link.appendChild(warningIcon);
    }

    // Update click handler
    link.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showWarningPopup(url);
    };
}

// Optimize the unflag function
function handleUnflagUrl(url) {
    return new Promise((resolve) => {
        const removeHighlights = (doc) => {
            const links = doc.querySelectorAll(`a[href="${url}"]`);
            links.forEach(link => {
                link.style.cssText = '';
                const warningIcon = link.querySelector('.warning-icon');
                if (warningIcon) {
                    warningIcon.remove();
                }
                link.onclick = null;
            });
        };

        // Remove from main document
        removeHighlights(document);

        // Remove from iframes
        const frames = document.getElementsByTagName('iframe');
        Array.from(frames).forEach(frame => {
            try {
                removeHighlights(frame.contentDocument);
            } catch(e) {
                console.log('Could not access iframe content');
            }
        });

        resolve(true);
    });
}

// Update the message listener to handle Gmail-specific cases
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlightPhishingUrl') {
        const links = document.getElementsByTagName('a');
        for (let link of links) {
            if (link.href === request.url) {
                highlightUrl(link);
                
                // Add a click event listener to show a warning page
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Create custom notification
                    const notification = document.createElement('div');
                    notification.style.position = 'fixed';
                    notification.style.top = '20%';
                    notification.style.left = '50%';
                    notification.style.transform = 'translate(-50%, -50%)';
                    notification.style.backgroundColor = '#fff';
                    notification.style.border = '2px solid red';
                    notification.style.padding = '20px';
                    notification.style.borderRadius = '5px';
                    notification.style.zIndex = '9999';
                    notification.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
                    notification.style.minWidth = '300px';
                    notification.style.textAlign = 'center';
                    
                    notification.innerHTML = `
                      <h3 style="color: red; margin-top: 0;">⚠️ Phishing Alert!</h3>
                      <p>This URL appears to be suspicious and may be a phishing attempt.</p>
                      <p style="font-weight: bold;">${link.href}</p>
                      <div style="display: flex; justify-content: space-around; margin-top: 15px;">
                        <button id="proceed-btn" style="padding: 8px 15px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Proceed Anyway</button>
                        <button id="cancel-btn" style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Cancel</button>
                      </div>
                    `;
                    
                    document.body.appendChild(notification);
                    
                    // Add event listeners to buttons
                    document.getElementById('proceed-btn').addEventListener('click', () => {
                      document.body.removeChild(notification);
                      window.location.href = link.href;
                    });
                    
                    document.getElementById('cancel-btn').addEventListener('click', () => {
                      document.body.removeChild(notification);
                    });
                });
            }
        }
    } else if (request.action === 'removeHighlight') {
        const links = document.getElementsByTagName('a');
        for (let link of links) {
            if (link.href === request.url) {
                // Remove highlighting styles
                link.style.backgroundColor = '';
                link.style.border = '';
                link.style.padding = '';
                link.style.borderRadius = '';
                link.style.textDecoration = '';
                link.style.color = '';
                // Remove click event listener by cloning and replacing the element
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);
            }
        }
    } else if (request.action === 'highlightPhishingUrl' && getCurrentPlatform()) {
        // If we're on a recognized email platform, use the email-specific highlighter
        highlightPhishingUrlInEmail(request.url);
        sendResponse({ success: true });
    }
    return true;
});
// ============= END OF EMAIL MESSENGER SCANNER ===============