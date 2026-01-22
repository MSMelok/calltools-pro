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
// @require      https://unpkg.com/feather-icons@4.29.0/dist/feather.min.js
// @updateURL    https://msmelok.github.io/calltools-pro/atmos-gmail.meta.js
// @downloadURL  https://msmelok.github.io/calltools-pro/atmos-gmail.user.js
// ==/UserScript==

(function() {
'use strict';

    // Trusted Types (Security Bypass)
    let policy = null;
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        try {
            policy = window.trustedTypes.createPolicy('atmosPolicy', {
                createHTML: (string) => string
            });
        } catch (e) {
            if (window.trustedTypes.defaultPolicy) policy = window.trustedTypes.defaultPolicy;
        }
    }
    const safeHTML = (html) => policy ? policy.createHTML(html) : html;

    // Load Rules
    let RULES = {
        // Fallback Rules
        "AL": { type: "BLOCK", msg: "AUTO REJECT: Alabama" },
        "IA": { type: "BLOCK", msg: "AUTO REJECT: Iowa" },
        "MA": { type: "BLOCK", msg: "AUTO REJECT: Massachusetts" },
        "ME": { type: "BLOCK", msg: "AUTO REJECT: Maine" },
        "NY": { type: "BLOCK", msg: "AUTO REJECT: New York" },
        "VT": { type: "BLOCK", msg: "AUTO REJECT: Vermont" },
        "PR": { type: "BLOCK", msg: "AUTO REJECT: Puerto Rico" }
    };
    try {
        const rulesText = GM_getResourceText("rules");
        if (rulesText) {
            const parsed = JSON.parse(rulesText);
            if (parsed && Object.keys(parsed).length > 0) {
                RULES = parsed;
                console.log("Atmos: Rules loaded from external resource.");
            }
        }
    } catch (e) { console.warn("Atmos: Failed to load rules", e); }

    // Styles (Dark/Glass Theme)
    const STYLES = `
        :root {
            --ct-primary: #3b82f6;
            --ct-primary-hover: #2563eb;
            --ct-secondary: #8b5cf6;
            --ct-bg: #02040a;
            --ct-glass: rgba(2, 4, 10, 0.85);
            --ct-border: rgba(255, 255, 255, 0.1);
            --ct-text: #ffffff;
            --ct-text-muted: #94a3b8;
            --ct-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

            /* Status Colors */
            --ct-safe-bg: rgba(16, 185, 129, 0.2); --ct-safe-text: #34d399;
            --ct-warn-bg: rgba(245, 158, 11, 0.2); --ct-warn-text: #fbbf24;
            --ct-block-bg: rgba(244, 63, 94, 0.2); --ct-block-text: #f43f5e;
        }

        #atmos-panel {
            position: fixed; bottom: 80px; right: 20px; width: 360px;
            background: var(--ct-glass);
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px) saturate(180%);
            border: 1px solid var(--ct-border);
            border-radius: 16px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            display: none; flex-direction: column;
            box-shadow: var(--ct-shadow);
            color: var(--ct-text);
            animation: atmos-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes atmos-slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .at-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--ct-border);
            display: flex; justify-content: space-between; align-items: center;
        }
        .at-title { font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 8px; }
        .at-close { cursor: pointer; color: var(--ct-text-muted); transition: color 0.2s; }
        .at-close:hover { color: white; }

        .at-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

        .at-input-group label {
            display: block; font-size: 12px; font-weight: 500; color: var(--ct-text-muted);
            margin-bottom: 6px;
        }
        .at-input {
            width: 100%; padding: 10px 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--ct-border);
            border-radius: 8px;
            color: white; font-size: 14px;
            outline: none; transition: all 0.2s;
            box-sizing: border-box;
        }
        .at-input:focus {
            border-color: var(--ct-primary);
            background: rgba(255, 255, 255, 0.1);
        }

        .at-status {
            padding: 12px; border-radius: 8px;
            font-size: 13px; font-weight: 500; text-align: center;
            background: rgba(255, 255, 255, 0.05); color: var(--ct-text-muted);
            border: 1px solid transparent;
        }
        .at-status.safe { background: var(--ct-safe-bg); color: var(--ct-safe-text); border-color: rgba(16, 185, 129, 0.3); }
        .at-status.warn { background: var(--ct-warn-bg); color: var(--ct-warn-text); border-color: rgba(245, 158, 11, 0.3); }
        .at-status.block { background: var(--ct-block-bg); color: var(--ct-block-text); border-color: rgba(244, 63, 94, 0.3); }

        .at-btn-row { display: flex; gap: 10px; margin-top: 8px; }

        .at-btn {
            padding: 10px 16px; border-radius: 8px; border: none;
            font-weight: 600; font-size: 14px; cursor: pointer;
            transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .at-btn-primary {
            background: var(--ct-primary); color: white; flex: 2;
        }
        .at-btn-primary:hover { background: var(--ct-primary-hover); transform: translateY(-1px); }

        .at-btn-secondary {
            background: transparent; border: 1px solid var(--ct-border); color: var(--ct-text-muted); flex: 1;
        }
        .at-btn-secondary:hover { border-color: var(--ct-text); color: var(--ct-text); }

        #atmos-toggle {
            position: fixed; bottom: 20px; right: 20px;
            width: 56px; height: 56px;
            background: linear-gradient(135deg, var(--ct-primary), var(--ct-secondary));
            color: white; border-radius: 16px;
            display: flex; justify-content: center; align-items: center;
            cursor: pointer; z-index: 9998;
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        #atmos-toggle:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 8px 30px rgba(59, 130, 246, 0.5); }
    `;
    GM_addStyle(STYLES);

    // Rule Detection Logic
    function detectRule(address) {
        if (!address) return { type: "NEUTRAL", msg: "Enter an address to check rules." };
        const cleanAddr = address.replace(/\s+/g, ' ').trim();
        const upperAddr = cleanAddr.toUpperCase();

        // 1. City Check
        for (const key in RULES) {
            if (key.length > 2 && upperAddr.includes(key)) return RULES[key];
        }
        // 2. State Check
        for (const key in RULES) {
            if (key.length === 2) {
                const regex = new RegExp(`[\\s,]${key}([\\s,]|$|\\.)`);
                if (regex.test(cleanAddr)) return RULES[key];
            }
        }
        return { type: "NEUTRAL", msg: "State not recognized. Please verify manually." };
    }

    // Template Engine
    function generateEmailBody(dmName, businessName, address, ruleType) {
        const isPercentageOnly = (ruleType === "WARN");
        const cleanAddress = address.trim();
        let offerSection = "";

        const option1 = `- <u>A flat monthly fee of $150.00 + a $1.50 bonus for every transaction over the 100-transaction mark.</u>`;
        const option2 = `- <u>A revenue share of 15% of total kiosk earnings, with a $900.00 guarantee over the first three months (split into three monthly payments of $300.00).</u>`;

        if (isPercentageOnly) {
            offerSection = `We offer a straightforward payment structure:<br>${option2}<br><br>`;
        } else {
            offerSection = `We offer two straightforward payment structures:<br>${option1}<br>${option2}<br><br>`;
        }

        return `Hello ${dmName},<br><br>
I’m Adam from Bitcoin Depot. I’ve been looking at your location on ${cleanAddress}, and I think it’s a perfect fit for a partnership that could bring an easy stream of revenue to your business.

We’re looking for a small 3x3-foot space in your store to host one of our Bitcoin machines. Here is the part most owners like: It is 100% hands-off for you. We handle the installation, maintenance, and customer support. You simply provide the space and a power outlet.

${offerSection} Beyond the rent, we are a NASDAQ-listed company (Ticker Symbol: BTM) with over 8,000 locations.

We use our app (100k+ users) to drive new foot traffic directly to your business. Furthermore, we strictly abide by all relevant laws and regulations, including anti-money laundering (AML) and know-your-customer (KYC) requirements, so you can host with total peace of mind.

Do you have five minutes this week for a quick chat? I’d love to see if we can get this set up for you.


Location Master Agreement: https://get.bitcoindepot.com/lma/
NASDAQ Listing: https://www.nasdaq.com/market-activity/stocks/btm
`;
    }

    // UI Logic
    function createUI() {
        if (document.getElementById('atmos-panel')) return;

        const container = document.createElement('div');
        container.id = 'atmos-panel';
        container.innerHTML = safeHTML(`
            <div class="at-header">
                <span class="at-title"><i data-feather="mail"></i> Atmos Lead Filler</span>
                <span id="at-close-btn" class="at-close"><i data-feather="x"></i></span>
            </div>
            <div class="at-body">
                <div class="at-input-group">
                    <label>Decision Maker</label>
                    <input type="text" id="at-dm" placeholder="John Doe" class="at-input">
                </div>
                <div class="at-input-group">
                    <label>Business Name</label>
                    <input type="text" id="at-biz" placeholder="Acme Corp" class="at-input">
                </div>
                <div class="at-input-group">
                    <label>Address (Paste full string)</label>
                    <textarea id="at-addr" rows="2" placeholder="123 Main St, City, State Zip" class="at-input" style="resize:none;"></textarea>
                </div>

                <div id="at-status" class="at-status">
                    <i data-feather="map-pin" style="width:14px;height:14px;vertical-align:text-bottom;"></i> Enter address to check
                </div>

                <div class="at-btn-row">
                    <button id="at-fill-btn" class="at-btn at-btn-primary"><i data-feather="send" style="width:14px;"></i> Fill Email</button>
                    <button id="at-reset-btn" class="at-btn at-btn-secondary">Reset</button>
                </div>
            </div>
        `);
        document.body.appendChild(container);

        const toggle = document.createElement('div');
        toggle.id = 'atmos-toggle';
        toggle.innerHTML = safeHTML('<i data-feather="zap"></i>');
        document.body.appendChild(toggle);

        feather.replace();
        attachListeners(container, toggle);
    }

    function attachListeners(panel, toggle) {
        const addrInput = document.getElementById('at-addr');
        const statusDiv = document.getElementById('at-status');
        const closeBtn = document.getElementById('at-close-btn');

        toggle.onclick = () => { panel.style.display = 'flex'; toggle.style.display = 'none'; };
        closeBtn.onclick = () => { panel.style.display = 'none'; toggle.style.display = 'flex'; };

        addrInput.addEventListener('input', () => {
            const rule = detectRule(addrInput.value);
            statusDiv.className = 'at-status';
            statusDiv.innerText = rule.msg;
            if (rule.type === "SAFE") statusDiv.classList.add('safe');
            else if (rule.type === "WARN") statusDiv.classList.add('warn');
            else if (rule.type === "BLOCK") statusDiv.classList.add('block');
        });

        document.getElementById('at-fill-btn').onclick = () => {
            const dm = document.getElementById('at-dm').value.trim() || "[Name]";
            const biz = document.getElementById('at-biz').value.trim() || "[Business]";
            const addr = document.getElementById('at-addr').value;
            const rule = detectRule(addr);

            if (rule.type === "BLOCK") {
                 if (!confirm(`WARNING: ${rule.msg}\n\nDo you really want to send an email to this blocked location?`)) return;
            }

            const subject = `Turning 3 square feet of ${biz} into guaranteed revenue`;
            const bodyHtml = generateEmailBody(dm, biz, addr, rule.type);

            fillGmail(subject, bodyHtml);
        };

        document.getElementById('at-reset-btn').onclick = () => {
            document.getElementById('at-dm').value = '';
            document.getElementById('at-biz').value = '';
            document.getElementById('at-addr').value = '';
            statusDiv.className = 'at-status';
            statusDiv.innerText = '📍 Enter address to check';
        };
    }

    function fillGmail(subj, body) {
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

    // Init
    function init() {
        if (document.querySelector('div[role="main"]')) {
            createUI();
        } else {
            const observer = new MutationObserver((mutations, obs) => {
                if (document.querySelector('div[role="main"]')) {
                    createUI();
                    obs.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
