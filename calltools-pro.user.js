// ==UserScript==
// @name         CallTools Pro
// @namespace    https://west-2.calltools.io/agent
// @version      4.4.0
// @description  Apple UI, Smart Clock, Strict Compliance, Header Settings
// @author       MuhammadMeluk
// @match        https://*.calltools.io/*
// @match        https://*.calltools.com/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @require      https://unpkg.com/feather-icons@4.29.0/dist/feather.min.js
// @updateURL    https://msmelok.github.io/calltools-pro/calltools-pro.meta.js
// @downloadURL  https://msmelok.github.io/calltools-pro/calltools-pro.user.js
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        // Indices based on User Request
        FIRST_NAME_INDEX: 2,
        LAST_NAME_INDEX: 3,
        ADDRESS_INPUT_INDEX: 4,
        BUSINESS_INPUT_INDEX: 5
    };

    const STATE_TIMEZONES = {
        "AL": "America/Chicago", "AK": "America/Anchorage", "AZ": "America/Phoenix", "AR": "America/Chicago",
        "CA": "America/Los_Angeles", "CO": "America/Denver", "CT": "America/New_York", "DE": "America/New_York",
        "FL": "America/New_York", "GA": "America/New_York", "HI": "Pacific/Honolulu", "ID": "America/Denver",
        "IL": "America/Chicago", "IN": "America/Indiana/Indianapolis", "IA": "America/Chicago", "KS": "America/Chicago",
        "KY": "America/New_York", "LA": "America/Chicago", "ME": "America/New_York", "MD": "America/New_York",
        "MA": "America/New_York", "MI": "America/Detroit", "MN": "America/Chicago", "MS": "America/Chicago",
        "MO": "America/Chicago", "MT": "America/Denver", "NE": "America/Chicago", "NV": "America/Los_Angeles",
        "NH": "America/New_York", "NJ": "America/New_York", "NM": "America/Denver", "NY": "America/New_York",
        "NC": "America/New_York", "ND": "America/Chicago", "OH": "America/New_York", "OK": "America/Chicago",
        "OR": "America/Los_Angeles", "PA": "America/New_York", "RI": "America/New_York", "SC": "America/New_York",
        "SD": "America/Chicago", "TN": "America/Chicago", "TX": "America/Chicago", "UT": "America/Denver",
        "VT": "America/New_York", "VA": "America/New_York", "WA": "America/Los_Angeles", "WV": "America/New_York",
        "WI": "America/Chicago", "WY": "America/Denver", "PR": "America/Puerto_Rico", "DC": "America/New_York"
    };

    const TZ_EXCEPTIONS = {
        "TX|EL PASO": "America/Denver", "TX|HUDSPETH": "America/Denver",
        "FL|PENSACOLA": "America/Chicago", "FL|PANAMA CITY": "America/Chicago",
        "TN|NASHVILLE": "America/Chicago", "TN|MEMPHIS": "America/Chicago",
        "IN|GARY": "America/Chicago", "KY|BOWLING GREEN": "America/Chicago"
    };

    const RULES = {
        // --- BLOCKED STATES (Auto Reject) ---
        "AL": { type: "BLOCK", msg: "AUTO REJECT: Alabama" },
        "IA": { type: "BLOCK", msg: "AUTO REJECT: Iowa" },
        "NY": { type: "BLOCK", msg: "AUTO REJECT: New York" },
        "ME": { type: "BLOCK", msg: "AUTO REJECT: Maine" },
        "VT": { type: "BLOCK", msg: "AUTO REJECT: Vermont" },
        "PR": { type: "BLOCK", msg: "AUTO REJECT: Puerto Rico" },

        // --- RESTRICTED STATES (10-15% or Caps) ---
        "AK": { type: "WARN", msg: "Alaska: Flat and % Deals (Flat Up to $500/mo - Both Tiers)" },
        "AR": { type: "WARN", msg: "Arkansas: 10-15% Deals Only" },
        "CA": { type: "WARN", msg: "California: 10-15% Deals Only" },
        "CO": { type: "WARN", msg: "Colorado: Flat and % Deals (Flat Up to $200/mo - Both Tiers)" },
        "CT": { type: "WARN", msg: "Connecticut: 10-15% Deals Only" },
        "DC": { type: "WARN", msg: "District of Columbia: Flat and % Deals (Flat Up to $200/mo - Both Tiers)" },
        "DE": { type: "WARN", msg: "Delaware: 10-15% Deals Only" },
        "FL": { type: "WARN", msg: "Florida: Flat and % Deals (Flat Up to $200/mo - Both Tiers)" },
        "GA": { type: "WARN", msg: "Georgia: Flat and % Deals (Flat Up to $200/mo - Both Tiers)" },
        "IL": { type: "WARN", msg: "Illinois: 10-15% Deals Only" },
        "LA": { type: "WARN", msg: "Louisiana: 10-15% Deals Only" },
        "MA": { type: "WARN", msg: "Massachusetts: 10-15% Deals Only" },
        "MD": { type: "WARN", msg: "Maryland: 10-15% Deals Only" },
        "NE": { type: "WARN", msg: "Nebraska: 10-15% Deals Only" },
        "NJ": { type: "WARN", msg: "New Jersey: 10-15% Deals Only" },
        "OH": { type: "WARN", msg: "Ohio: 10-15% Deals Only" },
        "OK": { type: "WARN", msg: "Oklahoma: 10-15% Deals Only" },
        "RI": { type: "WARN", msg: "Rhode Island: 10-15% Deals Only" },
        "VA": { type: "WARN", msg: "Virginia: 10-15% Deals Only" },
        "WA": { type: "WARN", msg: "Washington: 10-15% Deals Only" },
        "WI": { type: "WARN", msg: "Wisconsin: 10-15% Deals Only" },

        // --- SAFE STATES (Normal Rates) ---
        "AZ": { type: "SAFE", msg: "Arizona: Normal Rates" },
        "HI": { type: "SAFE", msg: "Hawaii: Normal Rates" },
        "ID": { type: "SAFE", msg: "Idaho: Normal Rates" },
        "IN": { type: "SAFE", msg: "Indiana: Normal Rates" },
        "KS": { type: "SAFE", msg: "Kansas: Normal Rates" },
        "KY": { type: "SAFE", msg: "Kentucky: Normal Rates" },
        "MI": { type: "SAFE", msg: "Michigan: Normal Rates" },
        "MN": { type: "SAFE", msg: "Minnesota: Normal Rates" },
        "MO": { type: "SAFE", msg: "Missouri: Normal Rates" },
        "MS": { type: "SAFE", msg: "Mississippi: Normal Rates" },
        "MT": { type: "SAFE", msg: "Montana: Normal Rates" },
        "NC": { type: "SAFE", msg: "North Carolina: Normal Rates" },
        "ND": { type: "SAFE", msg: "North Dakota: Normal Rates" },
        "NH": { type: "SAFE", msg: "New Hampshire: Normal Rates" },
        "NM": { type: "SAFE", msg: "New Mexico: Normal Rates" },
        "NV": { type: "SAFE", msg: "Nevada: Normal Rates" },
        "OR": { type: "SAFE", msg: "Oregon: Normal Rates" },
        "PA": { type: "SAFE", msg: "Pennsylvania: Normal Rates" },
        "SC": { type: "SAFE", msg: "South Carolina: Normal Rates" },
        "SD": { type: "SAFE", msg: "South Dakota: Normal Rates" },
        "TN": { type: "SAFE", msg: "Tennessee: Normal Rates" },
        "TX": { type: "SAFE", msg: "Texas: Normal Rates" },
        "UT": { type: "SAFE", msg: "Utah: Normal Rates" },
        "WY": { type: "SAFE", msg: "Wyoming: Normal Rates" },
        "WV": { type: "SAFE", msg: "West Virginia: Normal Rates" },

        // --- CITY SPECIFIC BLOCKS (Legacy/Local Ordinances) ---
        "BATTLE CREEK": { type: "BLOCK", msg: "AUTO REJECT: Battle Creek, MI" },
        "GROSSE POINTE FARMS": { type: "BLOCK", msg: "AUTO REJECT: Grosse Pointe Farms, MI" },
        "SPOKANE": { type: "BLOCK", msg: "AUTO REJECT: Spokane, WA" },
        "STILLWATER": { type: "BLOCK", msg: "AUTO REJECT: Stillwater, MN" },
        "ABILENE":      { type: "BLOCK", msg: "AUTO REJECT: Abilene, TX" },
        "GARLAND":      { type: "BLOCK", msg: "AUTO REJECT: Garland, TX" },
        "MIDLAND":      { type: "BLOCK", msg: "AUTO REJECT: Midland, TX" },
        "WICHITA FALLS":{ type: "BLOCK", msg: "AUTO REJECT: Wichita Falls, TX" }
    };

    const styles = `
        /* General Utils */
        .ct-hidden { display: none !important; }

        /* Top Controls (Compliance Badges) */
        #ct-top-controls { display: inline-flex; align-items: center; margin-left: 15px; gap: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        .ct-badge {
            display: inline-flex; align-items: center; height: 32px; padding: 0 14px;
            border-radius: 20px; font-size: 13px; font-weight: 600; color: white;
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.15);
            cursor: default; white-space: nowrap; transition: all 0.3s ease;
        }
        .ct-safe { background: linear-gradient(135deg, #34c759, #248a3d); }
        .ct-warn { background: linear-gradient(135deg, #ffcc00, #ff9500); color: black !important; }
        .ct-block { background: linear-gradient(135deg, #ff3b30, #d70015); }
        .ct-time { background: linear-gradient(135deg, #5856d6, #3634a3); }
        .ct-neutral { background: linear-gradient(135deg, #8e8e93, #636366); opacity: 0.7; }

        /* Floating Search Button (Bottom Left) */
        #ct-search-helper-btn {
            position: fixed; bottom: 24px; left: 24px; z-index: 99999;
            padding: 12px 20px; background: #0071e3; color: white; border: none; border-radius: 30px;
            font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;
            box-shadow: 0 4px 15px rgba(0, 113, 227, 0.4); display: flex; align-items: center; gap: 8px;
            transition: all 0.2s ease; cursor: pointer;
        }
        #ct-search-helper-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 113, 227, 0.5); }
        #ct-search-helper-btn:active { transform: scale(0.95); }

        /* Header Settings Button (Top Right) */
        #ct-header-settings-btn {
            background: transparent; border: none; cursor: pointer; padding: 8px;
            display: inline-flex; align-items: center; justify-content: center;
            border-radius: 50%; transition: background 0.2s; margin-right: 5px;
            color: rgba(255,255,255,0.9);
        }
        #ct-header-settings-btn:hover { background: rgba(255,255,255,0.1); }

        /* Settings Modal (Top Right) */
        #ct-settings-modal {
            position: fixed; top: 60px; right: 20px; width: 260px; z-index: 100002;
            background: rgba(28, 28, 30, 0.95); backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
            padding: 16px; display: none; flex-direction: column; gap: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5); color: white;
            font-family: -apple-system, sans-serif; font-size: 13px;
        }
        #ct-settings-modal.show { display: flex; animation: fadeDown 0.2s ease-out; }

        .ct-setting-row { display: flex; align-items: center; justify-content: space-between; }
        .ct-switch { position: relative; display: inline-block; width: 40px; height: 22px; }
        .ct-switch input { opacity: 0; width: 0; height: 0; }
        .ct-slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #3a3a3c; transition: .4s; border-radius: 22px;
        }
        .ct-slider:before {
            position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px;
            background-color: white; transition: .4s; border-radius: 50%;
        }
        input:checked + .ct-slider { background-color: #34c759; }
        input:checked + .ct-slider:before { transform: translateX(18px); }
        .ct-modal-header { font-weight: 700; font-size: 14px; margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }

        @keyframes fadeDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Toast */
        .ct-toast-container { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 100003; pointer-events: none; }
        .ct-toast {
            display: flex; align-items: center; gap: 10px; background: rgba(28, 28, 30, 0.85); color: white;
            padding: 12px 24px; border-radius: 50px; font-family: -apple-system, sans-serif;
            font-size: 14px; font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1);
            opacity: 0; transform: translateY(-20px); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .ct-toast.show { opacity: 1; transform: translateY(0); }
        .ct-toast.success { background: rgba(52, 199, 89, 0.9); }
        .ct-toast.error { background: rgba(255, 59, 48, 0.9); }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    function showToast(message, type = 'default') {
        let container = document.getElementById('ct-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ct-toast-container';
            container.className = 'ct-toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `ct-toast ${type}`;
        let icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
        toast.innerHTML = `<i data-feather="${icon}" style="width:18px;"></i> ${message}`;
        container.appendChild(toast);
        feather.replace();
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
    }

    function updateTopBar(complianceStatus, complianceText, timeText) {
        const navBar = document.getElementById('dashboard-nav-tabs');
        if (!navBar) return;

        let container = document.getElementById('ct-top-controls');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ct-top-controls';
            navBar.appendChild(container);
        }

        let compBadge = document.getElementById('ct-comp-badge');
        if (!compBadge) {
            compBadge = document.createElement('div');
            compBadge.id = 'ct-comp-badge';
            compBadge.className = 'ct-badge ct-safe';
            container.appendChild(compBadge);
        }

        let timeBadge = document.getElementById('ct-time-badge');
        if (!timeBadge) {
            timeBadge = document.createElement('div');
            timeBadge.id = 'ct-time-badge';
            timeBadge.className = 'ct-badge ct-time';
            container.appendChild(timeBadge);
        }

        let compClass = complianceStatus === 'SAFE' ? 'ct-safe' : complianceStatus === 'WARN' ? 'ct-warn' : complianceStatus === 'NEUTRAL' ? 'ct-neutral' : 'ct-block';
        let compIcon = complianceStatus === 'SAFE' ? 'check-circle' : complianceStatus === 'WARN' ? 'alert-triangle' : complianceStatus === 'NEUTRAL' ? 'loader' : 'alert-octagon';

        if (compBadge.dataset.state !== complianceStatus + complianceText) {
            compBadge.className = `ct-badge ${compClass}`;
            compBadge.innerHTML = `<i data-feather="${compIcon}" style="width:14px; margin-right:6px;"></i> ${complianceText}`;
            compBadge.dataset.state = complianceStatus + complianceText;
            feather.replace();
        }

        if (timeText) {
            timeBadge.style.display = 'inline-flex';
            if (timeBadge.dataset.time !== timeText) {
                timeBadge.innerHTML = `<i data-feather="clock" style="width:14px; margin-right:6px;"></i> ${timeText}`;
                timeBadge.dataset.time = timeText;
                feather.replace();
            }
        } else {
            timeBadge.style.display = 'none';
        }
    }

    let lastLoggedRule = "";
    function checkComplianceAndClock() {
        const inputs = document.querySelectorAll('input[type="text"]');
        const inputAddr = inputs[CONFIG.ADDRESS_INPUT_INDEX] ? inputs[CONFIG.ADDRESS_INPUT_INDEX].value.trim().toUpperCase() : "";

        let detectedState = null;
        let timeString = "";

        const stateMatch = inputAddr.match(/\b([A-Z]{2})\b\s+\d{5}/);
        if (stateMatch) detectedState = stateMatch[1];
        if (detectedState && STATE_TIMEZONES[detectedState]) {
            let tz = STATE_TIMEZONES[detectedState];
            for (const [key, exceptionTZ] of Object.entries(TZ_EXCEPTIONS)) {
                const cityPart = key.split('|')[1];
                if (inputAddr.includes(cityPart) && detectedState === key.split('|')[0]) {
                    tz = exceptionTZ;
                }
            }
            const now = new Date();
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, hour: 'numeric', minute: 'numeric', second: '2-digit', hour12: true
            });
            timeString = `${fmt.format(now)} (${detectedState})`;
        }

        let activeRule = null;
        if (detectedState && RULES[detectedState]) activeRule = RULES[detectedState];

        if (!activeRule || activeRule.type !== "BLOCK") {
            for (const [key, rule] of Object.entries(RULES)) {
                if (key.length > 2 && inputAddr.includes(key)) {
                    activeRule = rule;
                }
            }
        }

        if (activeRule) {
            updateTopBar(activeRule.type, activeRule.msg, timeString);
            const btn = document.querySelector(".call-button, button.dial-btn, .start-call, .fa-phone")?.closest('button');
            if (btn && activeRule.type === "BLOCK") { 
                btn.style.opacity = "0.3"; 
                btn.style.pointerEvents = "none"; 
            }

        } else {
            if (detectedState || inputAddr) {
                // Default Safe Message if State detected but no Rule
                updateTopBar('SAFE', 'No Restrictions', timeString);
            } else {
                updateTopBar('NEUTRAL', 'Waiting for Address...', timeString);
            }
            const btn = document.querySelector(".call-button, button.dial-btn, .start-call, .fa-phone")?.closest('button');
            if (btn) { 
                btn.style.opacity = "1"; 
                btn.style.pointerEvents = "auto"; 
            }
            lastLoggedRule = "";
        }
    }

    // --- NEW: Header Integration for Cog ---
    function injectHeaderControls() {
        if (document.getElementById('ct-header-settings-btn')) return;
        const userBtn = document.querySelector('.user-icon');
        if (!userBtn) return;

        const container = userBtn.parentElement;
        if (!container) return;

        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'ct-header-settings-btn';
        settingsBtn.setAttribute('title', 'Script Settings');
        settingsBtn.innerHTML = `<i data-feather="settings" style="width:20px; height:20px;"></i>`;
        container.insertBefore(settingsBtn, userBtn);
        feather.replace();

        if (!document.getElementById('ct-settings-modal')) {
            const modal = document.createElement('div');
            modal.id = 'ct-settings-modal';
            modal.innerHTML = `
                <div class="ct-modal-header">Search Options</div>
                <div class="ct-setting-row">
                    <span>Use First/Last Name</span>
                    <label class="ct-switch">
                        <input type="checkbox" id="ct-opt-split-name">
                        <span class="ct-slider"></span>
                    </label>
                </div>
                <div style="font-size:11px; opacity:0.6; margin-top:4px;">
                    Enable to combine Input #2 and #3 instead of using Input #5.
                </div>
            `;
            document.body.appendChild(modal);
            const savedSplitOpt = localStorage.getItem('ct_use_split_name') === 'true';
            document.getElementById('ct-opt-split-name').checked = savedSplitOpt;

            document.getElementById('ct-opt-split-name').addEventListener('change', (e) => {
                localStorage.setItem('ct_use_split_name', e.target.checked);
                showToast("Settings Saved", "success");
            });
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                modal.classList.toggle('show');
            });
            document.addEventListener('click', (e) => {
                if (!modal.contains(e.target) && e.target !== settingsBtn && !settingsBtn.contains(e.target)) {
                    modal.classList.remove('show');
                }
            });
        }
    }

    function createBottomSearch() {
        if (document.getElementById('ct-search-helper-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'ct-search-helper-btn';
        btn.innerHTML = `<i data-feather="search" style="width:20px; height:20px; margin-right:5px;"></i> Search`;
        document.body.appendChild(btn);
        feather.replace();
        btn.addEventListener('click', async () => {
            const inputs = document.querySelectorAll('input[type="text"]');
            const useSplitName = localStorage.getItem('ct_use_split_name') === 'true';
            const addr = inputs[CONFIG.ADDRESS_INPUT_INDEX] ? inputs[CONFIG.ADDRESS_INPUT_INDEX].value : "";
            let namePart = "";

            if (useSplitName) {
                const fName = inputs[CONFIG.FIRST_NAME_INDEX] ? inputs[CONFIG.FIRST_NAME_INDEX].value : "";
                const lName = inputs[CONFIG.LAST_NAME_INDEX] ? inputs[CONFIG.LAST_NAME_INDEX].value : "";
                namePart = `${fName} ${lName}`.trim();
            } else {
                namePart = inputs[CONFIG.BUSINESS_INPUT_INDEX] ? inputs[CONFIG.BUSINESS_INPUT_INDEX].value : "";
            }

            const text = namePart ? `${namePart} - ${addr}` : addr;
            
            if(text) {
                try {
                    if (typeof GM_setClipboard === 'function') {
                        GM_setClipboard(text);
                    } else {
                        await navigator.clipboard.writeText(text);
                    }
                    showToast("Address Copied!", "success");
                } catch (e) {
                    showToast("Failed to copy", "error");
                }
            } else {
                showToast("No Address Found", "error");
            }
        });
    }

    function init() {
        createBottomSearch();
        setInterval(injectHeaderControls, 2000);
        setInterval(checkComplianceAndClock, 1000);
    }

    if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();