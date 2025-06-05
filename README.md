# SafeLink: Phishing URL Detector

A cross-platform Chrome extension built to detect and flag phishing websites in real-time. It uses a combination of VirusTotal and Groq API (Mistral SABA 24B), DNS analysis, and Shodan InternetDB to provide advanced threat detection for safer browsing.

---

## 🚀 Features

* **Real-Time URL Scanning**: Instantly analyzes URLs visited in the browser.
* **VirusTotal Integration**: Checks URLs against VirusTotal's threat database.
* **AI-Powered Detection**: Uses Groq API with Mistral SABA 24B for intelligent threat classification.
* **Redirection Tracking**: Monitors and evaluates redirection patterns for phishing signs.
* **IP & Host Info**: Displays IP address, open ports, and hostname using DNS and Shodan InternetDB.
* **User Notifications**: Alerts users if a phishing attempt is detected.
* **Unflag URLs**: Option to remove false positives.
* **Suspicious URL Storage**: Maintains a list of flagged URLs using Supabase.
* **Suspicion Score Bar**: Visual indicator showing phishing probability.
* **Simple UI**: Clean interface for quick information access.

---

## 💻 OS Compatibility

* **Windows**
* **macOS**
* **Linux**

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js

### APIs & Tools

* [VirusTotal API](https://www.virustotal.com/gui/join-us)
* [Groq API (Mistral SABA 24B)](https://groq.com)
* [Google DNS](https://dns.google/)
* [Shodan InternetDB](https://internetdb.shodan.io)
* Supabase (Database)

### Extension Architecture

* `manifest.json`
* `content script`
* `background script`
* `popup script`

### Development Tools

* Visual Studio Code
* GitHub

---

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/safelink-url-detector.git
```

2. Navigate to the project directory:

```bash
cd safelink-url-detector
```

3. Open Chrome and go to `chrome://extensions/`
4. Enable **Developer Mode**
5. Click **Load Unpacked** and select the project folder

---

## 🚦 Usage

* The extension monitors your browser in real-time.
* If a phishing URL is detected, a warning alert is displayed.
* View full URL info including redirections, IP, and suspicion score in the popup.
* Use the **Unflag** button to mark safe URLs.

---

## 🔐 Permissions

* `activeTab`
* `notifications`
* `storage`
* `scripting`
* `webRequest`
* `webNavigation`

---

## ⚙️ API Keys Setup

* **VirusTotal**: Get an API key from [VirusTotal](https://www.virustotal.com/gui/join-us).
* **Groq (Mistral SABA 24B)**: Get an API key from [Groq](https://groq.com).
* **Supabase**: Set up a Supabase project and configure the database.

---

> Stay safe while browsing with SafeLink: Your phishing detection companion 🚨
