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
// @resource     rules https://msmelok.github.io/calltools-pro/assets/data/rules.json
// @resource     config https://msmelok.github.io/calltools-pro/assets/data/config.json
// @require      https://unpkg.com/feather-icons@4.29.0/dist/feather.min.js
// @updateURL    https://msmelok.github.io/calltools-pro/atmos-gmail.meta.js
// @downloadURL  https://msmelok.github.io/calltools-pro/atmos-gmail.user.js
// ==/UserScript==

(function() {
'use strict';

    // ============================================
    // LOAD RESOURCES
    // ============================================
    let RULES = {};
    let APP_CONFIG = { version: "5.0.0" };

    try {
        const rulesText = GM_getResourceText("rules");
        if (rulesText) RULES = JSON.parse(rulesText);

        const configText = GM_getResourceText("config");
        if (configText) APP_CONFIG = JSON.parse(configText);

        console.log(`Atmos Gmail: Resources loaded. Version ${APP_CONFIG.version}`);
    } catch (e) {
        console.warn("Atmos: Failed to load external resources", e);
    }

    // Trusted Types
    let policy = null;
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        try {
            policy = window.trustedTypes.createPolicy('atmosPolicy', { createHTML: (s) => s });
        } catch (e) { if (window.trustedTypes.defaultPolicy) policy = window.trustedTypes.defaultPolicy; }
    }
    const safeHTML = (html) => policy ? policy.createHTML(html) : html;

    // Smart Poller: Waits for Gmail to be ready
    function waitForGmail(callback) {
        const check = setInterval(() => {
            if (document.body && document.querySelector('div[role="main"]')) {
                clearInterval(check);
                callback();
            }
        }, 500);
    }

    // Styles
    const STYLES = `
        :root {
            --ct-primary: #06b6d4;
            --ct-secondary: #3b82f6;
            --ct-bg: rgba(15, 23, 42, 0.95);
            --ct-border: rgba(255, 255, 255, 0.1);
            --ct-text: #f1f5f9;
        }
        #atmos-panel {
            position: fixed; bottom: 80px; right: 20px; width: 360px;
            background: var(--ct-bg); backdrop-filter: blur(16px);
            border: 1px solid var(--ct-border); border-radius: 16px;
            z-index: 9999; font-family: -apple-system, sans-serif;
            display: none; flex-direction: column; color: var(--ct-text);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .at-header { padding: 16px; border-bottom: 1px solid var(--ct-border); display: flex; justify-content: space-between; }
        .at-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .at-input { width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--ct-border); color: white; border-radius: 8px; margin-top: 4px; }
        .at-status { padding: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; text-align: center; font-size: 13px; }
        .at-status.block { background: rgba(244, 63, 94, 0.2); color: #f43f5e; }
        .at-btn { padding: 10px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; margin-top: 8px; }
        .at-btn-primary { background: var(--ct-primary); color: white; }
        #atmos-toggle {
            position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px;
            background: var(--ct-primary); color: white; border-radius: 16px;
            display: flex; justify-content: center; align-items: center;
            cursor: pointer; z-index: 9998; box-shadow: 0 4px 8px 3px rgba(0,0,0,0.15);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        #atmos-toggle:hover { box-shadow: 0 6px 10px 4px rgba(0,0,0,0.2); transform: scale(1.02); }
    `;
    GM_addStyle(STYLES);

    function detectRule(address) {
        if (!address) return { type: "NEUTRAL", msg: "Enter address" };
        const cleanAddr = address.replace(/\s+/g, ' ').trim();
        // Case insensitive for cities
        const upperAddr = cleanAddr.toUpperCase();

        for (const key in RULES) {
            if (key.length > 2 && upperAddr.includes(key)) return RULES[key];
        }
        // Strict Case-Sensitive for State Codes (e.g. match " MT " but not " Mt ")
        for (const key in RULES) {
            if (key.length === 2) {
                if (new RegExp(`[\\s,]${key}([\\s,]|$|\\.)`).test(cleanAddr)) return RULES[key];
            }
        }
        return { type: "NEUTRAL", msg: "State not recognized" };
    }

    function generateEmailBody(dm, biz, addr, type) {
        const isPercentageOnly = (type === "WARN");
        const cleanAddress = addr.trim();

        // Template Fragments
        const option1 = `- <u>A flat monthly fee of $150.00 + a $1.50 bonus for every transaction over the 100-transaction mark.</u>`;
        const option2 = `- <u>A revenue share of 15% of total kiosk earnings, with a $900.00 guarantee over the first three months (split into three monthly payments of $300.00).</u>`;

        let offerSection = "";
        if (isPercentageOnly) {
            offerSection = `We offer a straightforward payment structure:<br>${option2}<br><br>`;
        } else {
            offerSection = `We offer two straightforward payment structures:<br>${option1}<br>${option2}<br><br>`;
        }

        return `Hello ${dm},<br><br>
I’m Adam from Bitcoin Depot. I’ve been looking at your location on ${cleanAddress}, and I think it’s a perfect fit for a partnership that could bring an easy stream of revenue to your business.

We’re looking for a small 3x3-foot space in your store to host one of our Bitcoin machines. Here is the part most owners like: It is 100% hands-off for you. We handle the installation, maintenance, and customer support. You simply provide the space and a power outlet.

${offerSection} Beyond the rent, we are a NASDAQ-listed company (Ticker Symbol: BTM) with over 8,000 locations.

We use our app (100k+ users) to drive new foot traffic directly to your business. Furthermore, we strictly abide by all relevant laws and regulations, including anti-money laundering (AML) and know-your-customer (KYC) requirements, so you can host with total peace of mind.

Do you have five minutes this week for a quick chat? I’d love to see if we can get this set up for you.


Location Master Agreement: https://get.bitcoindepot.com/lma/
NASDAQ Listing: https://www.nasdaq.com/market-activity/stocks/btm

`;
    }

    function createUI() {
        if (document.getElementById('atmos-panel')) return;

        const div = document.createElement('div');
        div.id = 'atmos-panel';
        div.innerHTML = safeHTML(`
            <div class="at-header"><span>Atmos Lead Filler</span><span id="at-close" style="cursor:pointer">✕</span></div>
            <div class="at-body">
                <input id="at-dm" class="at-input" placeholder="Decision Maker">
                <input id="at-biz" class="at-input" placeholder="Business Name">
                <textarea id="at-addr" class="at-input" rows="2" placeholder="Address"></textarea>
                <div id="at-status" class="at-status">Check Address</div>
                <button id="at-fill" class="at-btn at-btn-primary">Fill Email</button>
            </div>
            <div style="padding:10px;font-size:10px;opacity:0.5;text-align:center">v${APP_CONFIG.version}</div>
        `);
        document.body.appendChild(div);

        const toggle = document.createElement('div');
        toggle.id = 'atmos-toggle';
        toggle.innerHTML = safeHTML('<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#FFFFFF"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>');
        document.body.appendChild(toggle);

        // Logic
        const close = div.querySelector('#at-close');
        const addrInput = div.querySelector('#at-addr');
        const status = div.querySelector('#at-status');

        toggle.onclick = () => { div.style.display = 'flex'; toggle.style.display = 'none'; };
        close.onclick = () => { div.style.display = 'none'; toggle.style.display = 'flex'; };

        addrInput.oninput = () => {
            const rule = detectRule(addrInput.value);
            status.textContent = rule.msg;
            status.className = `at-status ${rule.type === 'BLOCK' ? 'block' : ''}`;
        };

        div.querySelector('#at-fill').onclick = () => {
            const rule = detectRule(addrInput.value);
            if (rule.type === 'BLOCK' && !confirm(`WARNING: ${rule.msg}\n\nDo you really want to send an email to this blocked location?`)) return;

            const dm = div.querySelector('#at-dm').value.trim() || "[Name]";
            const biz = div.querySelector('#at-biz').value.trim() || "[Business]";
            const addr = addrInput.value;

            const subject = `Turning 3 square feet of ${biz} into guaranteed revenue`;
            const bodyHtml = generateEmailBody(dm, biz, addr, rule.type);

            fillGmail(subject, bodyHtml);
        };
    }

    function fillGmail(subj, body) {
        // Selector strategy: Try standard name, then aria-label (fallbacks)
        const subjectBox = document.querySelector('input[name="subjectbox"]') ||
                           document.querySelector('input[placeholder="Subject"]');

        const messageBody = document.querySelector('div[role="textbox"][aria-label*="Body"]') ||
                            document.querySelector('div[contenteditable="true"][aria-label*="Message Body"]');

        if (subjectBox && messageBody) {
            subjectBox.value = subj;
            subjectBox.dispatchEvent(new Event('input', { bubbles: true }));

            messageBody.focus();
            document.execCommand('insertHTML', false, safeHTML(body));
        } else {
            alert("Could not find an open Compose window. Please click 'Compose' first!");
        }
    }

    waitForGmail(createUI);
})();
