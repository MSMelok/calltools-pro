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
        #atmos-toggle { position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; background: var(--ct-primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9998; }
    `;
    GM_addStyle(STYLES);

    function detectRule(address) {
        if (!address) return { type: "NEUTRAL", msg: "Enter address" };
        const cleanAddr = address.replace(/\s+/g, ' ').trim().toUpperCase();

        for (const key in RULES) {
            if (key.length > 2 && cleanAddr.includes(key)) return RULES[key];
        }
        for (const key in RULES) {
            if (key.length === 2) {
                if (new RegExp(`[\\s,]${key}([\\s,]|$|\\.)`).test(cleanAddr)) return RULES[key];
            }
        }
        return { type: "NEUTRAL", msg: "State not recognized" };
    }

    function generateEmailBody(dm, biz, addr, type) {
        const option1 = `- <u>Flat fee $150.00 + bonus</u>`;
        const option2 = `- <u>Rev share 15%</u>`;
        const offers = (type === "WARN") ? option2 : `${option1}<br>${option2}`;

        return `Hello ${dm},<br><br>I’m looking at your location on ${addr}. Perfect fit for a Bitcoin ATM.<br><br>${offers}<br><br>Let's chat?`;
    }

    function createUI() {
        const div = document.createElement('div');
        div.id = 'atmos-panel';
        div.innerHTML = safeHTML(`
            <div class="at-header"><span>Atmos Lead Filler</span><span id="at-close">✕</span></div>
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
        toggle.innerHTML = '⚡';
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
            if (rule.type === 'BLOCK' && !confirm('Blocked location. Send anyway?')) return;

            const dm = div.querySelector('#at-dm').value || 'Owner';
            const biz = div.querySelector('#at-biz').value || 'Business';
            const body = generateEmailBody(dm, biz, addrInput.value, rule.type);

            const box = document.querySelector('div[role="textbox"]');
            if (box) {
                box.focus();
                document.execCommand('insertHTML', false, safeHTML(body));
            } else alert('Open Compose window first');
        };
    }

    setTimeout(createUI, 2000); // Simple wait for Gmail
})();
