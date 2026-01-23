// ==UserScript==
// @name         Atmos Gmail Lead Filler
// @namespace    https://mail.google.com/
// @version      5.0.0
// @description  Atmos Agent for Gmail - Robust side-panel for sales leads.
// @author       MuhammadMelk
// @match        https://mail.google.com/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// @resource     rules https://msmelok.github.io/atmos-agent/assets/data/rules.json
// @resource     config https://msmelok.github.io/atmos-agent/assets/data/config.json
// @updateURL    https://msmelok.github.io/atmos-agent/atmos-gmail.meta.js
// @downloadURL  https://msmelok.github.io/atmos-agent/atmos-gmail.user.js
// ==/UserScript==

(function() {
    'use strict';

    // LOAD RESOURCES
    let RULES = {};
    let APP_CONFIG = { version: "5.0.0" };

    try {
        const rulesText = GM_getResourceText("rules");
        if (rulesText) RULES = JSON.parse(rulesText);

        const configText = GM_getResourceText("config");
        if (configText) APP_CONFIG = JSON.parse(configText);

        console.log(`Atmos Gmail: Resources loaded. Version ${APP_CONFIG.version}`);
    } catch (e) {
        console.warn("Atmos: Failed to load external resources. Using empty rules.", e);
    }

    // STYLES
    const STYLES = `
        :root {
            --ct-primary: #06b6d4;
            --ct-secondary: #3b82f6;
            --ct-bg: rgba(15, 23, 42, 0.95);
            --ct-border: rgba(255, 255, 255, 0.1);
            --ct-text: #f1f5f9;
        }
        #atmos-panel {
            position: fixed; bottom: 80px; right: 20px; width: 420px;
            background: var(--ct-bg); backdrop-filter: blur(16px);
            border: 1px solid var(--ct-border); border-radius: 16px;
            z-index: 9999; font-family: -apple-system, sans-serif;
            display: none; flex-direction: column; color: var(--ct-text);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .at-header { padding: 16px; border-bottom: 1px solid var(--ct-border); display: flex; justify-content: space-between; align-items: center; }
        .at-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .at-input { width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--ct-border); color: white; border-radius: 8px; margin-top: 4px; box-sizing: border-box; }

        /* Status Indicators with Colors */
        .at-status { padding: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; text-align: center; font-size: 13px; font-weight: 500; transition: background 0.3s; }
        .at-status.safe { background: rgba(34, 197, 94, 0.25); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .at-status.warn { background: rgba(250, 204, 21, 0.25); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.3); }
        .at-status.block { background: rgba(244, 63, 94, 0.25); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.3); }

        .at-btn { padding: 10px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; margin-top: 8px; }
        .at-btn-primary { background: var(--ct-primary); color: white; }
        #atmos-toggle { position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; background: var(--ct-primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9998; font-size: 24px; }
    `;
    GM_addStyle(STYLES);

    // UTILITIES
    function detectRule(address) {
        if (!address) return { type: "NEUTRAL", msg: "Enter address" };

        const cleanAddr = address.replace(/\s+/g, ' ').trim();
        const upperAddr = cleanAddr.toUpperCase();

        for (const key in RULES) {
            if (key.length > 2 && upperAddr.includes(key)) return RULES[key];
        }

        for (const key in RULES) {
            if (key.length === 2) {
                const regex = new RegExp(`[\\s,]${key}([\\s,]|$|\\.)`);
                if (regex.test(cleanAddr)) return RULES[key];
            }
        }
        return { type: "NEUTRAL", msg: "State not recognized" };
    }

    function mkEl(tag, className, text) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.textContent = text;
        return el;
    }

    // UI CREATION
    function createUI() {
        if (document.getElementById('atmos-panel')) return;

        const panel = mkEl('div', '');
        panel.id = 'atmos-panel';

        const header = mkEl('div', 'at-header');
        header.appendChild(mkEl('span', '', 'Atmos Lead Filler'));
        const closeBtn = mkEl('span', '', '✕');
        closeBtn.style.cursor = 'pointer';
        closeBtn.id = 'at-close';
        header.appendChild(closeBtn);
        panel.appendChild(header);

        const body = mkEl('div', 'at-body');

        const dmInput = mkEl('input', 'at-input');
        dmInput.id = 'at-dm'; dmInput.placeholder = 'Decision Maker';
        dmInput.setAttribute('autocomplete', 'off');
        body.appendChild(dmInput);

        const bizInput = mkEl('input', 'at-input');
        bizInput.id = 'at-biz'; bizInput.placeholder = 'Business Name';
        bizInput.setAttribute('autocomplete', 'off');
        body.appendChild(bizInput);

        const addrInput = mkEl('textarea', 'at-input');
        addrInput.id = 'at-addr'; addrInput.rows = 2; addrInput.placeholder = 'Address';
        addrInput.setAttribute('autocomplete', 'off');
        body.appendChild(addrInput);

        const statusDiv = mkEl('div', 'at-status', 'Check Address');
        statusDiv.id = 'at-status';
        body.appendChild(statusDiv);

        const fillBtn = mkEl('button', 'at-btn at-btn-primary', 'Fill Email');
        fillBtn.id = 'at-fill';
        body.appendChild(fillBtn);

        const versionLabel = mkEl('div', '', `v${APP_CONFIG.version}`);
        versionLabel.style.cssText = "padding:10px;font-size:10px;opacity:0.5;text-align:center";
        panel.appendChild(body);
        panel.appendChild(versionLabel);

        document.body.appendChild(panel);

        const toggle = mkEl('div', '', '⚡');
        toggle.id = 'atmos-toggle';
        document.body.appendChild(toggle);

        toggle.onclick = () => { panel.style.display = 'flex'; toggle.style.display = 'none'; };
        closeBtn.onclick = () => { panel.style.display = 'none'; toggle.style.display = 'flex'; };

        addrInput.oninput = () => {
            const rule = detectRule(addrInput.value);
            statusDiv.textContent = rule.msg;

            statusDiv.className = 'at-status';
            if (rule.type === 'SAFE') statusDiv.classList.add('safe');
            else if (rule.type === 'WARN') statusDiv.classList.add('warn');
            else if (rule.type === 'BLOCK') statusDiv.classList.add('block');
        };

        fillBtn.onclick = () => {
            const rule = detectRule(addrInput.value);
            if (rule.type === 'BLOCK' && !confirm('Blocked location. Send anyway?')) return;

            const dm = dmInput.value.trim() || 'Owner';
            const biz = bizInput.value.trim() || 'Business';
            const addr = addrInput.value.trim();

            const success = insertEmailSafely(dm, biz, addr, rule.type);

            if (success) {
                dmInput.value = '';
                bizInput.value = '';
                addrInput.value = '';
                statusDiv.textContent = 'Check Address';
                statusDiv.className = 'at-status';
            }
        };
    }

    // EMAIL INJECTION
    function insertEmailSafely(dm, biz, addr, type) {
        const composeBox = document.querySelector('div[role="textbox"][contenteditable="true"]');
        const subjectBox = document.querySelector('input[name="subjectbox"]') ||
                           document.querySelector('input[placeholder="Subject"]');

        if (!composeBox) {
            alert('Please open a Compose window first!');
            return false;
        }

        if (subjectBox) {
            subjectBox.value = `Turning 3 square feet of ${biz} into guaranteed revenue`;
            subjectBox.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const frag = document.createDocumentFragment();
        const br = () => document.createElement('br');

        const div1 = document.createElement('div');
        div1.textContent = `Hello ${dm},`;
        frag.appendChild(div1);
        frag.appendChild(br());

        const div2 = document.createElement('div');
        div2.textContent = "I’m Adam from Bitcoin Depot. I’ve been looking at your location on ";
        const uAddr = document.createElement('u');
        uAddr.textContent = addr || "[Address]";
        div2.appendChild(uAddr);
        div2.appendChild(document.createTextNode(", and I think it’s a perfect fit for a partnership that could bring an easy stream of revenue to your business."));
        frag.appendChild(div2);
        frag.appendChild(br());

        const div3 = document.createElement('div');
        div3.textContent = "We’re looking for a small 3x3-foot space in your store to host one of our Bitcoin machines. Here is the part most owners like: It is 100% hands-off for you. We handle the installation, maintenance, and customer support. You simply provide the space and a power outlet.";
        frag.appendChild(div3);
        frag.appendChild(br());

        const div4 = document.createElement('div');
        if (type === "WARN") {
            div4.textContent = "We offer a straightforward payment structure:";
        } else {
            div4.textContent = "We offer two straightforward payment structures:";
        }
        frag.appendChild(div4);

        const divOffers = document.createElement('div');

        if (type !== "WARN") {
            const row1 = document.createElement('div');
            row1.textContent = "- ";
            const u1 = document.createElement('u');
            u1.textContent = "A flat monthly fee of $150.00 + a $1.50 bonus for every transaction over the 100-transaction mark.";
            row1.appendChild(u1);
            divOffers.appendChild(row1);
        }

        const row2 = document.createElement('div');
        row2.textContent = "- ";
        const u2 = document.createElement('u');
        u2.textContent = "A revenue share of 15% of total kiosk earnings, with a $900.00 guarantee over the first three months (split into three monthly payments of $300.00).";
        row2.appendChild(u2);
        divOffers.appendChild(row2);

        frag.appendChild(divOffers);
        frag.appendChild(br());

        const div5 = document.createElement('div');
        div5.textContent = "Beyond the rent, we are a NASDAQ-listed company (Ticker Symbol: BTM) with over 8,000 locations.";
        frag.appendChild(div5);
        frag.appendChild(br());

        const div6 = document.createElement('div');
        div6.textContent = "We use our app (100k+ users) to drive new foot traffic directly to your business. Furthermore, we strictly abide by all relevant laws and regulations, including anti-money laundering (AML) and know-your-customer (KYC) requirements, so you can host with total peace of mind.";
        frag.appendChild(div6);
        frag.appendChild(br());

        const div7 = document.createElement('div');
        div7.textContent = "Do you have five minutes this week for a quick chat? I’d love to see if we can get this set up for you.";
        frag.appendChild(div7);
        frag.appendChild(br());

        const divLinks = document.createElement('div');
        const b = document.createElement('b');
        b.textContent = "Documents:";
        divLinks.appendChild(b);
        frag.appendChild(divLinks);

        const divL1 = document.createElement('div');
        divL1.textContent = "Location Master Agreement: ";
        const a1 = document.createElement('a');
        a1.href = "https://get.bitcoindepot.com/lma/";
        a1.textContent = "https://get.bitcoindepot.com/lma/";
        divL1.appendChild(a1);
        frag.appendChild(divL1);

        const divL2 = document.createElement('div');
        divL2.textContent = "NASDAQ Listing: ";
        const a2 = document.createElement('a');
        a2.href = "https://www.nasdaq.com/market-activity/stocks/btm";
        a2.textContent = "https://www.nasdaq.com/market-activity/stocks/btm";
        divL2.appendChild(a2);
        frag.appendChild(divL2);

        frag.appendChild(br());

        composeBox.focus();
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            sel.getRangeAt(0).insertNode(frag);
        } else {
            composeBox.appendChild(frag);
        }

        return true;
    }

    // INIT
    setTimeout(createUI, 2000);

})();
