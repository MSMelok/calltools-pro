# Atmos Agent

![Version](https://img.shields.io/badge/version-5.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tampermonkey](https://img.shields.io/badge/tampermonkey-compatible-orange)
![Privacy](https://img.shields.io/badge/privacy-100%25_private-brightgreen)

Atmos Agent is a professional enhancement suite for **CallTools.io** and **Gmail**. It automates compliance checks, streamlines lead filling, and boosts sales productivity directly within your browser.

---

## ✨ Features

### 🛡️ Smart Compliance (CallTools & Gmail)
- **Real-time Protection**: Automatically detects state and city-level compliance restrictions based on phone numbers or addresses.
- **Visual Alerts**: Clear badges indicating Safe, Warning, or Blocked status.
- **Call Blocking**: Prevents accidental dials to restricted areas in CallTools.
- **Shared Intelligence**: Uses a centralized rule set across both agents.

### 📞 Atmos for CallTools
- **Timezone Intelligence**: Displays local time for prospects with business hour indicators (Sun/Moon icons).
- **Search Helper**: One-click address copying with smart formatting for research.
- **Dark Mode UI**: Integrated "Glass" theme that matches the Atmos design system.
- **Customizable**: Toggle specific features via the settings menu.

### 📧 Atmos for Gmail
- **Lead Filler Panel**: A dedicated side-panel for managing sales leads.
- **Smart Templates**: Auto-fill emails with "Decision Maker", "Business Name", and "Address" placeholders.
- **Compliance Integration**: Checks address compliance before you send emails.
- **Safe Injection**: Uses DOM-based injection to ensure email formatting is preserved.

---

## 🚀 Installation

### Prerequisites
- **Browser**: Chrome, Edge, Firefox, or Safari.
- **Extension**: [Tampermonkey](https://www.tampermonkey.net/) is required to run the agents.

### Step 1: Install Tampermonkey
Download and install Tampermonkey for your specific browser.

### Step 2: Configure Permissions (Crucial!)
For the agents to load local resources or communicate correctly, you **must** enable file access.
1. Open your browser's **Extension Management** page (e.g., `chrome://extensions`).
2. Find **Tampermonkey** and click **Details**.
3. Toggle **"Allow access to file URLs"** to **ON**.

### Step 3: Install Agents
Click the links below to install the scripts directly into Tampermonkey:

- **[Install Atmos CallTools Agent](https://msmelok.github.io/atmos-agent/atmos-calltools.user.js)**
- **[Install Atmos Gmail Agent](https://msmelok.github.io/atmos-agent/atmos-gmail.user.js)**

Click **Install** when prompted by Tampermonkey.

---

## ⚙️ Usage

### CallTools
1. Log in to your CallTools agent dashboard.
2. The Atmos controls will appear in the top navigation bar.
3. **Compliance**: Enter a phone number or address to see real-time status.
4. **Settings**: Click the gear icon next to your user profile to toggle features like "Split Name" or "Hide Action Buttons".

### Gmail
1. Open Gmail.
2. A lightning bolt icon (⚡) will appear in the bottom-right corner.
3. Click it to open the **Lead Filler Panel**.
4. Enter lead details and click **Fill Email** to populate the compose window with a compliant template.

---

## 🛠️ Development

### File Structure
```
atmos-agent/
├── assets/
│   ├── data/
│   │   ├── config.json    # Shared configuration (version, changelog)
│   │   └── rules.json     # Compliance rules definition
│   ├── js/                # Website scripts
│   └── css/               # Website styles
├── atmos-calltools.user.js  # Main CallTools script
├── atmos-gmail.user.js      # Main Gmail script
├── index.html               # Landing page / Dashboard
└── README.md                # Documentation
```

### Local Testing
To test changes locally:
1. Edit the `.user.js` files.
2. Update the `@require` or `@resource` paths in the UserScript header to point to your local file system (e.g., `file:///path/to/repo/...`) if testing completely offline, or push to a fork.
3. Ensure `config.json` version matches the script version.

---

## ❓ Troubleshooting

**Q: The script isn't loading.**
A: Ensure Tampermonkey is installed and enabled. Check if "Allow access to file URLs" is enabled in extension settings.

**Q: Compliance rules aren't updating.**
A: The scripts cache rules. Try refreshing the page or checking for script updates in Tampermonkey.

**Q: I see "Error loading resources".**
A: This usually happens if the script cannot fetch `config.json` or `rules.json`. Ensure you have an active internet connection or that the GitHub Pages URL is accessible.

---

**Privacy Note**: Atmos Agent runs locally in your browser. No personal data or lead information is sent to external servers.
