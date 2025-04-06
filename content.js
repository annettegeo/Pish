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
  element.style.backgroundColor = '#ffff00';
  element.style.textDecoration = 'underline wavy red';
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
  }
  else if (request.action === 'removeHighlight') {
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
  }
});

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
