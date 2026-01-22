// ==UserScript==
// @name         Atmos Mail
// @namespace    https://mail.google.com/
// @version      5.0.0
// @description  Atmos Suite integration for Gmail. Smart lead filler and compliance checker.
// @author       MuhammadMeluk
// @match        https://mail.google.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://msmelok.github.io/calltools-pro/atmos-mail.user.js
// @downloadURL  https://msmelok.github.io/calltools-pro/atmos-mail.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 0. CONFIG & STYLES
    // ==========================================

    const CONFIG = {
        VERSION: "5.0.0",
        RULES_URL: "https://msmelok.github.io/calltools-pro/rules.json"
    };

    // Shared "Atmos Glass" Design System
    const STYLES = `
        :root {
            /* Dark Mode (Default for Atmos) */
            --at-bg: #02040a;
            --at-panel: rgba(2, 4, 10, 0.8);
            --at-border: rgba(255, 255, 255, 0.1);
            --at-primary: #3b82f6;
            --at-primary-hover: #2563eb;
            --at-text: #ffffff;
            --at-text-muted: #94a3b8;
            --at-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            --at-input-bg: rgba(255, 255, 255, 0.05);

            /* Status Colors */
            --at-safe: #34d399;
            --at-warn: #fbbf24;
            --at-block: #f87171;
        }

        #at-mail-panel {
            position: fixed;
            bottom: 20px;
            right: 80px;
            width: 360px;
            background: var(--at-panel);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: var(--at-shadow);
            border: 1px solid var(--at-border);
            border-radius: 12px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            display: none;
            flex-direction: column;
            overflow: hidden;
            animation: at-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes at-slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .at-header {
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--at-border);
            background: rgba(255, 255, 255, 0.02);
        }

        .at-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--at-text);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .at-close {
            cursor: pointer;
            opacity: 0.7;
            transition: 0.2s;
            color: var(--at-text);
        }
        .at-close:hover { opacity: 1; }

        .at-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

        .at-label {
            display: block;
            font-size: 11px;
            font-weight: 500;
            margin-bottom: 4px;
            color: var(--at-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .at-input {
            width: 100%;
            padding: 10px 12px;
            background: var(--at-input-bg);
            border: 1px solid var(--at-border);
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 13px;
            color: var(--at-text);
            outline: none;
            transition: 0.2s;
        }

        .at-input:focus {
            border-color: var(--at-primary);
            background: rgba(59, 130, 246, 0.1);
        }

        .at-status {
            padding: 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            text-align: center;
            background: var(--at-input-bg);
            color: var(--at-text-muted);
            border: 1px solid var(--at-border);
            min-height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .at-btn-row { display: flex; gap: 10px; margin-top: 8px; }

        .at-btn {
            padding: 10px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .at-btn-primary {
            flex: 2;
            background: var(--at-primary);
            color: white;
            box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
        }
        .at-btn-primary:hover {
            background: var(--at-primary-hover);
            transform: translateY(-1px);
        }

        .at-btn-secondary {
            flex: 1;
            background: transparent;
            color: var(--at-text-muted);
            border: 1px solid var(--at-border);
        }
        .at-btn-secondary:hover {
            background: var(--at-input-bg);
            color: var(--at-text);
        }

        #at-toggle-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
            background: var(--at-primary);
            color: white;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 9998;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            border: 1px solid rgba(255,255,255,0.1);
        }
        #at-toggle-btn:hover {
            transform: scale(1.05) translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
        }

        /* Status Modifiers */
        .at-safe { background: rgba(16, 185, 129, 0.15) !important; color: var(--at-safe) !important; border-color: rgba(16, 185, 129, 0.3) !important; }
        .at-warn { background: rgba(245, 158, 11, 0.15) !important; color: var(--at-warn) !important; border-color: rgba(245, 158, 11, 0.3) !important; }
        .at-block { background: rgba(244, 63, 94, 0.15) !important; color: var(--at-block) !important; border-color: rgba(244, 63, 94, 0.3) !important; }
    `;

    GM_addStyle(STYLES);

    // ==========================================
    // 1. DATA & RULES ENGINE (Embedded for Speed)
    // ==========================================
    // We embed a copy for reliability, but could fetch rules.json in v5.1
    const RULES = [
        { "key": "AL", "type": "BLOCK", "msg": "AUTO REJECT: Alabama" },
        { "key": "IA", "type": "BLOCK", "msg": "AUTO REJECT: Iowa" },
        { "key": "MA", "type": "BLOCK", "msg": "AUTO REJECT: Massachusetts" },
        { "key": "ME", "type": "BLOCK", "msg": "AUTO REJECT: Maine" },
        { "key": "NY", "type": "BLOCK", "msg": "AUTO REJECT: New York" },
        { "key": "VT", "type": "BLOCK", "msg": "AUTO REJECT: Vermont" },
        { "key": "PR", "type": "BLOCK", "msg": "AUTO REJECT: Puerto Rico" },
        { "key": "AK", "type": "WARN", "msg": "Alaska: 10-15% Deals Only" },
        { "key": "AR", "type": "WARN", "msg": "Arkansas: 10-15% Deals Only" },
        { "key": "AZ", "type": "WARN", "msg": "Arizona: 10-15% Deals Only" },
        { "key": "CA", "type": "WARN", "msg": "California: 10-15% Deals Only" },
        { "key": "CO", "type": "WARN", "msg": "Colorado: 10-15% Deals Only" },
        { "key": "CT", "type": "WARN", "msg": "Connecticut: 10-15% Deals Only" },
        { "key": "DC", "type": "WARN", "msg": "Washington D.C: 10-15% Deals Only" },
        { "key": "DE", "type": "WARN", "msg": "Delaware: 10-15% Deals Only" },
        { "key": "FL", "type": "WARN", "msg": "Florida: 10-15% Deals Only" },
        { "key": "GA", "type": "WARN", "msg": "Georgia: 10-15% Deals Only" },
        { "key": "HI", "type": "WARN", "msg": "Hawaii: 10-15% Deals Only" },
        { "key": "ID", "type": "WARN", "msg": "Idaho: 10-15% Deals Only" },
        { "key": "IL", "type": "WARN", "msg": "Illinois: 10-15% Deals Only" },
        { "key": "LA", "type": "WARN", "msg": "Louisiana: 10-15% Deals Only" },
        { "key": "MD", "type": "WARN", "msg": "Maryland: 10-15% Deals Only" },
        { "key": "NE", "type": "WARN", "msg": "Nebraska: 10-15% Deals Only" },
        { "key": "NJ", "type": "WARN", "msg": "New Jersey: 10-15% Deals Only" },
        { "key": "OH", "type": "WARN", "msg": "Ohio: 10-15% Deals Only" },
        { "key": "OK", "type": "WARN", "msg": "Oklahoma: 10-15% Deals Only" },
        { "key": "RI", "type": "WARN", "msg": "Rhode Island: 10-15% Deals Only" },
        { "key": "WI", "type": "WARN", "msg": "Wisconsin: 10-15% Deals Only" },
        { "key": "IN", "type": "SAFE", "msg": "Indiana: Flat and % Deals" },
        { "key": "KS", "type": "SAFE", "msg": "Kansas: Flat and % Deals" },
        { "key": "KY", "type": "SAFE", "msg": "Kentucky: Flat and % Deals" },
        { "key": "MI", "type": "SAFE", "msg": "Michigan: Flat and % Deals" },
        { "key": "MN", "type": "SAFE", "msg": "Minnesota: Flat and % Deals" },
        { "key": "MO", "type": "SAFE", "msg": "Missouri: Flat and % Deals" },
        { "key": "MS", "type": "SAFE", "msg": "Mississippi: Flat and % Deals" },
        { "key": "MT", "type": "SAFE", "msg": "Montana: Flat and % Deals" },
        { "key": "NC", "type": "SAFE", "msg": "North Carolina: Flat and % Deals" },
        { "key": "ND", "type": "SAFE", "msg": "North Dakota: Flat and % Deals" },
        { "key": "NH", "type": "SAFE", "msg": "New Hampshire: Flat and % Deals" },
        { "key": "NM", "type": "SAFE", "msg": "New Mexico: Flat and % Deals" },
        { "key": "NV", "type": "SAFE", "msg": "Nevada: Flat and % Deals" },
        { "key": "OR", "type": "SAFE", "msg": "Oregon: Flat and % Deals" },
        { "key": "PA", "type": "SAFE", "msg": "Pennsylvania: Flat and % Deals" },
        { "key": "SC", "type": "SAFE", "msg": "South Carolina: Flat and % Deals" },
        { "key": "SD", "type": "SAFE", "msg": "South Dakota: Flat and % Deals" },
        { "key": "TN", "type": "SAFE", "msg": "Tennessee: Flat and % Deals" },
        { "key": "TX", "type": "SAFE", "msg": "Texas: Flat and % Deals" },
        { "key": "UT", "type": "SAFE", "msg": "Utah: Flat and % Deals" },
        { "key": "VA", "type": "SAFE", "msg": "Virginia: Flat and % Deals" },
        { "key": "WA", "type": "SAFE", "msg": "Washington: Flat and % Deals" },
        { "key": "WY", "type": "SAFE", "msg": "Wyoming: Flat and % Deals" },
        { "key": "WV", "type": "SAFE", "msg": "West Virginia: Flat and % Deals" },
        { "key": "BATTLE CREEK", "type": "BLOCK", "msg": "AUTO REJECT: Battle Creek, MI" },
        { "key": "GROSSE POINTE FARMS", "type": "BLOCK", "msg": "AUTO REJECT: Grosse Pointe Farms, MI" },
        "SPOKANE": { "key": "SPOKANE", "type": "BLOCK", "msg": "AUTO REJECT: Spokane, WA" },
        "STILLWATER": { "key": "STILLWATER", "type": "BLOCK", "msg": "AUTO REJECT: Stillwater, MN" },
        "ABILENE": { "key": "ABILENE", "type": "BLOCK", "msg": "AUTO REJECT: Abilene, TX" },
        "GARLAND": { "key": "GARLAND", "type": "BLOCK", "msg": "AUTO REJECT: Garland, TX" },
        "MIDLAND": { "key": "MIDLAND", "type": "BLOCK", "msg": "AUTO REJECT: Midland, TX" },
        "WICHITA FALLS": { "key": "WICHITA FALLS", "type": "BLOCK", "msg": "AUTO REJECT: Wichita Falls, TX" }
    ];

    function detectRule(address) {
        if (!address) return { type: "NEUTRAL", msg: "Enter an address to check" };

        const cleanAddr = address.replace(/\s+/g, ' ').trim();
        const upperAddr = cleanAddr.toUpperCase();

        // 1. Check Specific Cities/Strings (Priority)
        const specificRules = RULES.filter(r => r.key.length > 2);
        for (const rule of specificRules) {
            if (upperAddr.includes(rule.key)) return rule;
        }

        // 2. Check States
        const stateRules = RULES.filter(r => r.key.length === 2);
        for (const rule of stateRules) {
            const regex = new RegExp(`[\\s,]${rule.key}([\\s,]|$|\\.)`);
            if (regex.test(cleanAddr)) return rule;
        }

        return { type: "NEUTRAL", msg: "State not recognized" };
    }

    // ==========================================
    // 2. EMAIL GENERATOR
    // ==========================================
    function generateEmailBody(dmName, businessName, address, ruleType) {
        const isPercentageOnly = (ruleType === "WARN");
        const cleanAddress = address.trim();

        // Template Fragments
        const option1 = `<li><strong>Option 1:</strong> Flat monthly rent of <strong>$150.00</strong> + <strong>$1.50 bonus</strong> for every transaction over 100/mo.</li>`;
        const option2 = `<li><strong>Option 2:</strong> <strong>15% revenue share</strong> of kiosk earnings, with a <strong>$900.00 guarantee</strong> for the first 3 months ($300/mo).</li>`;

        let offerList = "";
        if (isPercentageOnly) {
            offerList = `<ul>${option2}</ul>`;
        } else {
            offerList = `<ul>${option1}${option2}</ul>`;
        }

        return `Hello ${dmName},<br><br>
        I’m Adam from Bitcoin Depot. I’ve been analyzing your location at <strong>${cleanAddress}</strong>, and it looks like an excellent fit for a partnership that generates passive revenue for your business.<br><br>
        We are looking for a small 3x3-foot space to host one of our Bitcoin ATMs. The best part? It’s 100% hands-off. We handle installation, cash management, and support. You just provide power.<br><br>
        <strong>Payment Structure:</strong><br>
        ${offerList}<br>
        As a NASDAQ-listed company (Ticker: BTM) with over 8,000 locations, we drive significant foot traffic through our app (100k+ users). We also handle all AML/KYC compliance, so you have zero legal liability.<br><br>
        Do you have 5 minutes this week to discuss getting this set up?<br><br>
        Best regards,<br><br>
        <strong>Reference:</strong><br>
        Location Agreement: <a href="https://get.bitcoindepot.com/lma/">View Agreement</a><br>
        NASDAQ Listing: <a href="https://www.nasdaq.com/market-activity/stocks/btm">View BTM Stock</a>`;
    }

    // ==========================================
    // 3. UI BUILDER
    // ==========================================
    function createUI() {
        if (document.getElementById('at-mail-panel')) return;

        const container = document.createElement('div');
        container.id = 'at-mail-panel';

        container.innerHTML = `
            <div class="at-header">
                <span class="at-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                    Atmos Mail
                </span>
                <span id="at-close-btn" class="at-close">&times;</span>
            </div>
            <div class="at-body">
                <div>
                    <label class="at-label">Decision Maker</label>
                    <input type="text" id="at-dm" placeholder="John Doe" class="at-input">
                </div>
                <div>
                    <label class="at-label">Business Name</label>
                    <input type="text" id="at-biz" placeholder="Acme Corp" class="at-input">
                </div>
                <div>
                    <label class="at-label">Address</label>
                    <textarea id="at-addr" rows="2" placeholder="123 Main St, City, State Zip" class="at-input" style="resize:none;"></textarea>
                </div>

                <div id="at-status" class="at-status">
                    Enter address to check compliance
                </div>

                <div class="at-btn-row">
                    <button id="at-fill-btn" class="at-btn at-btn-primary">Fill Email</button>
                    <button id="at-reset-btn" class="at-btn at-btn-secondary">Reset</button>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Floating Toggle Button
        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'at-toggle-btn';
        toggleBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
        document.body.appendChild(toggleBtn);

        attachListeners(container, toggleBtn);
    }

    // ==========================================
    // 4. LOGIC & INTERACTION
    // ==========================================
    function attachListeners(panel, toggleBtn) {
        const addrInput = document.getElementById('at-addr');
        const statusDiv = document.getElementById('at-status');
        const closeBtn = document.getElementById('at-close-btn');

        // Toggle Logic
        toggleBtn.onclick = () => {
            panel.style.display = 'flex';
            toggleBtn.style.display = 'none';
        };
        closeBtn.onclick = () => {
            panel.style.display = 'none';
            toggleBtn.style.display = 'flex';
        };

        // Live Compliance Check
        addrInput.addEventListener('input', () => {
            const rule = detectRule(addrInput.value);
            statusDiv.className = 'at-status'; // Reset
            statusDiv.textContent = rule.msg;

            if (rule.type === "SAFE") statusDiv.classList.add('at-safe');
            else if (rule.type === "WARN") statusDiv.classList.add('at-warn');
            else if (rule.type === "BLOCK") statusDiv.classList.add('at-block');
        });

        // Fill Button
        document.getElementById('at-fill-btn').onclick = () => {
            const dm = document.getElementById('at-dm').value.trim() || "[Name]";
            const biz = document.getElementById('at-biz').value.trim() || "[Business]";
            const addr = document.getElementById('at-addr').value;

            const rule = detectRule(addr);

            if (rule.type === "BLOCK") {
                if (!confirm(`⚠️ COMPLIANCE ALERT: ${rule.msg}\n\nAre you sure you want to proceed?`)) return;
            }

            const subject = `Turning 3 square feet of ${biz} into guaranteed revenue`;
            const bodyHtml = generateEmailBody(dm, biz, addr, rule.type);

            fillGmail(subject, bodyHtml);
        };

        // Reset Button
        document.getElementById('at-reset-btn').onclick = () => {
            document.getElementById('at-dm').value = '';
            document.getElementById('at-biz').value = '';
            document.getElementById('at-addr').value = '';
            statusDiv.className = 'at-status';
            statusDiv.textContent = 'Enter address to check compliance';
        };
    }

    // Modern Gmail Injection Logic
    function fillGmail(subj, body) {
        // Find Gmail Compose Window
        const subjectBox = document.querySelector('input[name="subjectbox"]');
        const messageBody = document.querySelector('div[aria-label="Message Body"], div[aria-label="Body"]');

        if (subjectBox && messageBody) {
            // Set Subject
            subjectBox.value = subj;
            subjectBox.dispatchEvent(new Event('input', { bubbles: true }));

            // Insert Body (Modern Approach)
            messageBody.focus();

            // Try execCommand first (Standard for contentEditable)
            // It is deprecated but still the most reliable for Gmail's rich text editor
            const success = document.execCommand('insertHTML', false, body);

            if (!success) {
                // Fallback: Direct HTML injection (Might break some formatting but works)
                messageBody.innerHTML = body;
                messageBody.dispatchEvent(new Event('input', { bubbles: true }));
            }
        } else {
            alert("Please open a 'Compose' window first!");
        }
    }

    // Wait for Gmail to load
    const interval = setInterval(() => {
        if (document.body) {
            clearInterval(interval);
            createUI();
        }
    }, 1000);

})();