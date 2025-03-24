//Main CODE
// popup.js

// let port = null;
// let lastDetectedUrls = new Set();

// document.addEventListener('DOMContentLoaded', () => {
//   const normalState = document.getElementById('normal-state');
//   const alertContainer = document.getElementById('alert-container');
//   const alertTitle = document.getElementById('alert-title');
//   const urlsList = document.getElementById('urls-list');
//   const viewDetailsBtn = document.getElementById('view-details-btn');
//   const exitBtn = document.getElementById('exit-btn');

//   // Connect to background script
//   port = chrome.runtime.connect({ name: 'popup' });

//   // Handle messages from background script
//   port.onMessage.addListener((msg) => {
//     if (msg.type === 'scanningStatus') {
//       updateStatus(msg.detectedUrls || []);
//     }
//   });

//   function updateStatus(detectedUrls) {
//     if (detectedUrls.length > 0) {
//       normalState.classList.add('hidden');
//       alertContainer.classList.remove('hidden');

//       // Update alert message with current count
//       const alertMessage = `${detectedUrls.length} Phishing URL${detectedUrls.length > 1 ? 's' : ''} Detected!`;
//       document.getElementById('alert-message').textContent = alertMessage;

//       // Update URLs list with unflag buttons
//       urlsList.innerHTML = Array.from(detectedUrls)
//         .map(url => `
//           <div class="url-item flex justify-between items-center p-2">
//             <span class="url-text flex-grow">${url}</span>
//             <button class="unflag-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-2"
//                     data-url="${url}">
//               Unflag
//             </button>
//           </div>
//         `).join('');

//       // Add event listeners to unflag buttons
//       document.querySelectorAll('.unflag-btn').forEach(btn => {
//         btn.addEventListener('click', async (e) => {
//           const url = e.target.dataset.url;
//           const success = await unflagUrl(url);
//           if (success) {
//             // Remove URL from list and update UI
//             const urlItem = e.target.closest('.url-item');
//             urlItem.remove();
            
//             // Update detectedUrls count
//             if (urlsList.children.length === 0) {
//               normalState.classList.remove('hidden');
//               alertContainer.classList.add('hidden');
//             }
//           }
//         });
//       });

//       // Update notification
//       const notificationId = 'phishing-detector';
//       chrome.notifications.clear(notificationId, () => {
//         chrome.notifications.create(notificationId, {
//           type: 'basic',
//           iconUrl: 'icon.png',
//           title: 'Phishing Alert!!',
//           message: `Total of ${detectedUrls.length} suspicious URL${detectedUrls.length > 1 ? 's' : ''} found.`,
//           priority: 2,
//           requireInteraction: true // Keep notification visible
//         });
//       });
//     } else {
//       normalState.classList.remove('hidden');
//       alertContainer.classList.add('hidden');
//     }

//     lastDetectedUrls = new Set(detectedUrls);
//   }

//   // Update the unflagUrl function in popup.js
//   async function unflagUrl(url) {
//     try {
//         // Send unflag request to background script
//         const response = await chrome.runtime.sendMessage({
//             action: 'unflagUrl',
//             url: url
//         });

//         if (response.success) {
//             // Remove URL from local list
//             const urlItem = document.querySelector(`[data-url="${url}"]`).closest('.url-item');
//             if (urlItem) {
//                 urlItem.remove();
//             }

//             // Update UI if no URLs left
//             if (document.querySelectorAll('.url-item').length === 0) {
//                 normalState.classList.remove('hidden');
//                 alertContainer.classList.add('hidden');
//             }

//             // Update the alert message count
//             const remainingUrls = document.querySelectorAll('.url-item').length;
//             if (remainingUrls > 0) {
//                 const alertMessage = `${remainingUrls} Phishing URL${remainingUrls > 1 ? 's' : ''} Detected!`;
//                 document.getElementById('alert-message').textContent = alertMessage;
//             }
//         }
//         return response.success;
//     } catch (error) {
//         console.error('Error unflagging URL:', error);
//         return false;
//     }
//   }

//   // Toggle URL list visibility
//   viewDetailsBtn.addEventListener('click', () => {
//     urlsList.classList.toggle('visible');
//     viewDetailsBtn.textContent = urlsList.classList.contains('visible') ? 'Hide Details' : 'View Details';
//   });

//   exitBtn.addEventListener('click', () => {
//     window.close() ;
//   });

//   // Initial status request
//   port.postMessage({ action: 'getStatus' });

//   port.onDisconnect.addListener(() => {
//     console.log('Port disconnected');
//     port = null;
//   });
// });













let port = null;
let lastDetectedUrls = new Set();

document.addEventListener('DOMContentLoaded', () => {
  const normalState = document.getElementById('normal-state');
  const alertContainer = document.getElementById('alert-container');
  const alertTitle = document.getElementById('alert-title');
  const urlsList = document.getElementById('urls-list');
  const viewDetailsBtn = document.getElementById('view-details-btn');
  const exitBtn = document.getElementById('exit-btn');
  const scanNowBtn = document.getElementById('scan-now-btn');
  
  // Connect to background script
  port = chrome.runtime.connect({ name: 'popup' });

  // Handle messages from background script
  port.onMessage.addListener((msg) => {
    if (msg.type === 'scanningStatus') {
      updateStatus(msg.detectedUrls || [], msg.urlDataMap || {});
    } else if (msg.type === 'ipData') {
      // Handle IP data response
      const container = document.getElementById(`ip-data-${encodeURIComponent(msg.url)}`);
      if (container) {
        displayIpDataForUrl(msg.url, msg.data);
      }
    }
  });

  function updateStatus(detectedUrls, urlDataMap) {
    if (detectedUrls.length > 0) {
      normalState.classList.add('hidden');
      alertContainer.classList.remove('hidden');

      // Update alert message with current count
      const alertMessage = `${detectedUrls.length} Phishing URL${detectedUrls.length > 1 ? 's' : ''} Detected!`;
      document.getElementById('alert-message').textContent = alertMessage;

      // Update URLs list with unflag buttons and IP info button
      urlsList.innerHTML = Array.from(detectedUrls)
        .map(url => `
          <div class="url-item flex flex-col p-2 mb-2 border-b border-gray-300">
            <div class="flex justify-between items-center w-full">
              <span class="url-text flex-grow truncate">${url}</span>
              <div class="flex">
                <button class="ip-info-btn bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                        data-url="${url}">
                  IP Info
                </button>
                <button class="unflag-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                        data-url="${url}">
                  Unflag
                </button>
              </div>
            </div>
            <div class="ip-data hidden mt-2 p-2 bg-gray-100 rounded" id="ip-data-${encodeURIComponent(url)}"></div>
          </div>
        `).join('');

      // Add event listeners to unflag buttons
      document.querySelectorAll('.unflag-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const url = e.target.dataset.url;
          const success = await unflagUrl(url);
          if (success) {
            // Remove URL from list and update UI
            const urlItem = e.target.closest('.url-item');
            urlItem.remove();
            
            // Update detectedUrls count
            if (urlsList.children.length === 0) {
              normalState.classList.remove('hidden');
              alertContainer.classList.add('hidden');
            } else {
              // Update the alert message count
              const remainingUrls = document.querySelectorAll('.url-item').length;
              const alertMessage = `${remainingUrls} Phishing URL${remainingUrls > 1 ? 's' : ''} Detected!`;
              document.getElementById('alert-message').textContent = alertMessage;
            }
          }
        });
      });

      // Add event listeners to IP info buttons
      document.querySelectorAll('.ip-info-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const url = e.target.dataset.url;
          const ipDataContainer = document.getElementById(`ip-data-${encodeURIComponent(url)}`);
          
          if (ipDataContainer.classList.contains('hidden')) {
            ipDataContainer.classList.remove('hidden');
            ipDataContainer.innerHTML = '<p class="text-center">Loading IP data...</p>';
            
            // Check if we already have data in urlDataMap
            if (urlDataMap[url] && urlDataMap[url].ipInfo) {
              displayIpDataForUrl(url, urlDataMap[url].ipInfo);
            } else {
              // Request IP data through port connection
              port.postMessage({
                action: 'getIpData',
                url: url
              });
            }
          } else {
            ipDataContainer.classList.add('hidden');
          }
        });
      });

      // Update notification
      const notificationId = 'phishing-detector';
      chrome.notifications.clear(notificationId, () => {
        chrome.notifications.create(notificationId, {
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Phishing Alert!!',
          message: `Total of ${detectedUrls.length} suspicious URL${detectedUrls.length > 1 ? 's' : ''} found.`,
          priority: 2,
          requireInteraction: true // Keep notification visible
        });
      });
    } else {
      normalState.classList.remove('hidden');
      alertContainer.classList.add('hidden');
    }

    lastDetectedUrls = new Set(detectedUrls);
  }

  function displayIpDataForUrl(url, data) {
    console.log("Displaying IP data:", data);
    const ipDataContainer = document.getElementById(`ip-data-${encodeURIComponent(url)}`);
    
    if (!data || Object.keys(data).length === 0) {
        ipDataContainer.innerHTML = '<p class="text-center">No IP data available for this URL</p>';
        return;
    }

    let htmlContent = '<div class="text-sm space-y-2">';
    
    // Display hostname and IP information with box styling
    htmlContent += `<p><strong>Hostname:</strong> ${data.hostname || 'N/A'}</p>`;
    if (data.ip) {
        htmlContent += `
            <p>
                <strong>IP:</strong> 
                <span class="ip-box">${data.ip}</span>
            </p>`;
    }
    
    // Display only ports in blue boxes with more spacing
    if (data.ports && data.ports.length > 0) {
        htmlContent += `
            <div>
                <strong>Open Ports:</strong> 
                <div class="port-container">
                    ${data.ports.map(port => 
                        `<span class="port-box">${port}</span>`
                    ).join('')}
                </div>
            </div>`;
    }
    
    htmlContent += '</div>';
    ipDataContainer.innerHTML = htmlContent;
  }

  // Function to unflag URL
  async function unflagUrl(url) {
    try {
        // Send unflag request to background script
        const response = await chrome.runtime.sendMessage({
            action: 'unflagUrl',
            url: url
        });

        if (response.success) {
            // Remove URL from local list
            const urlItem = document.querySelector(`[data-url="${url}"]`).closest('.url-item');
            if (urlItem) {
                urlItem.remove();
            }

            // Update UI if no URLs left
            if (document.querySelectorAll('.url-item').length === 0) {
                normalState.classList.remove('hidden');
                alertContainer.classList.add('hidden');
            }

            // Update the alert message count
            const remainingUrls = document.querySelectorAll('.url-item').length;
            if (remainingUrls > 0) {
                const alertMessage = `${remainingUrls} Phishing URL${remainingUrls > 1 ? 's' : ''} Detected!`;
                document.getElementById('alert-message').textContent = alertMessage;
            }
        }
        return response.success;
    } catch (error) {
        console.error('Error unflagging URL:', error);
        return false;
    }
  }

  // Add functionality for manual scanning
  if (scanNowBtn) {
    scanNowBtn.addEventListener('click', async () => {
      // Get current tab
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      if (tabs.length > 0) {
        const currentTab = tabs[0];
        
        // Show scanning indicator
        scanNowBtn.textContent = 'Scanning...';
        scanNowBtn.disabled = true;
        
        // Request scan of current page
        chrome.runtime.sendMessage({
          action: 'scanCurrentPage',
          tabId: currentTab.id
        }, (response) => {
          // Reset button
          scanNowBtn.textContent = 'Scan Now';
          scanNowBtn.disabled = false;
          
          // Handle response if needed
          if (response && response.message) {
            const statusDiv = document.getElementById('scan-status') || document.createElement('div');
            statusDiv.id = 'scan-status';
            statusDiv.className = 'mt-2 text-sm text-center';
            statusDiv.textContent = response.message;
            if (!document.getElementById('scan-status')) {
              normalState.appendChild(statusDiv);
            }
          }
        });
      }
    });
  }

  // Toggle URL list visibility
  viewDetailsBtn.addEventListener('click', () => {
    urlsList.classList.toggle('visible');
    viewDetailsBtn.textContent = urlsList.classList.contains('visible') ? 'Hide Details' : 'View Details';
  });

  exitBtn.addEventListener('click', () => {
    window.close();
  });

  // Initial status request
  port.postMessage({ action: 'getStatus' });

  port.onDisconnect.addListener(() => {
    console.log('Port disconnected');
    port = null;
  });
});