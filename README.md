# Phishing URL Detector

A Chrome extension designed to detect and warn users about potential phishing websites in real-time. It combines VirusTotal API analysis, AI-powered detection, and redirection monitoring to ensure safer browsing.

## 🚀 Features

- **Real-Time URL Scanning**: Detects phishing websites by analyzing URLs directly from the browser.
- **VirusTotal Integration**: Cross-references URLs with VirusTotal’s extensive threat database.
- **AI-Powered Analysis**: Uses a custom Machine Learning model for enhanced phishing detection.
- **Redirection Monitoring**: Tracks and evaluates URL redirections to detect malicious behavior.
- **IP Information Retrieval**: Displays the hostname, IP address, and open ports of a site.
- **User Notifications**: Alerts users when a potentially harmful site is detected.
- **Unflag Option**: Allows users to remove falsely flagged URLs.
- **Suspicious URL Database**: Maintains a record of detected phishing URLs to optimize future scans.
- **Progress Visualization**: Displays suspicion scores using a dynamic progress bar.
- **Enhanced User Interface**: Provides a clear, interactive UI for viewing detected URLs and detailed reports.

## 🛠️ Technologies Used

- **Frontend**: HTML, CSS, JavaScript (Chrome Extension UI)
- **Backend**: Python (Machine Learning Model)
- **API Integration**: VirusTotal API, Groq API
- **Database**: Supabase (For storing phishing URLs)
- **Networking**: WebRequest and WebNavigation permissions for URL tracking


## 📦 Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/phishing-url-detector.git
    ```
2. Navigate to the project directory.
    ```bash
    cd phishing-url-detector
    ```
3. Open Chrome and go to `chrome://extensions/`.
4. Enable **Developer Mode**.
5. Click **Load Unpacked** and select the project folder.

## 🚦 Usage

- Once installed, the extension will monitor active browser tabs.
- It will notify you if it detects a suspicious URL.
- You can view detailed information about flagged URLs using the popup UI.
- The **IP Info** button will display relevant IP and port details.
- If a URL is flagged falsely, use the **Unflag** option to mark it safe.

## 🔐 Permissions Required

- `activeTab`: Access the currently active tab for URL detection.
- `notifications`: Display warnings for phishing attempts.
- `storage`: Store flagged URLs for future reference.
- `scripting`: Inject content scripts for analysis.
- `webRequest` & `webNavigation`: Monitor URL requests for scanning.

## ⚙️ API Configuration

- **VirusTotal API**: Ensure you have an API key from [VirusTotal](https://www.virustotal.com/gui/join-us).
- **Groq API**: Obtain a key for AI-based analysis.
- **Supabase**: Set up a database instance to store and retrieve flagged URLs.
