// ==UserScript==
// @name         Atmos CallTools
// @namespace    https://west-2.calltools.io/agent
// @version      5.0.0
// @description  Atmos Agent for CallTools with dark theme, compliance alerts, and productivity tools
// @author       MuhammadMelk
// @match        https://*.calltools.io/*
// @match        https://*.calltools.com/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @resource     rules https://msmelok.github.io/calltools-pro/assets/data/rules.json
// @resource     config https://msmelok.github.io/calltools-pro/assets/data/config.json
// @require      https://unpkg.com/feather-icons@4.29.0/dist/feather.min.js
// @updateURL    https://msmelok.github.io/calltools-pro/atmos-calltools.meta.js
// @downloadURL  https://msmelok.github.io/calltools-pro/atmos-calltools.user.js
// ==/UserScript==

(function() {
'use strict';

    // ============================================
    // LOAD RESOURCES
    // ============================================
    let RULES = {};
    let APP_CONFIG = { version: "5.0.0", update: { changelog: ["Failed to load changelog"] } };

    try {
        const rulesText = GM_getResourceText("rules");
        if (rulesText) RULES = JSON.parse(rulesText);

        const configText = GM_getResourceText("config");
        if (configText) APP_CONFIG = JSON.parse(configText);

        console.log(`Atmos: Resources loaded. Version ${APP_CONFIG.version}`);
    } catch (e) {
        console.warn("Atmos: Failed to load external resources", e);
    }

    // Configuration Indices
    const CONFIG_INDICES = {
        FIRST_NAME_INDEX: 2,
        LAST_NAME_INDEX: 3,
        ADDRESS_INPUT_INDEX: 4,
        BUSINESS_INPUT_INDEX: 5
    };

    // State timezones mapping
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

    // Timezone exceptions
    const TZ_EXCEPTIONS = {
        "TX|EL PASO": "America/Denver", "TX|HUDSPETH": "America/Denver",
        "FL|PENSACOLA": "America/Chicago", "FL|PANAMA CITY": "America/Chicago",
        "TN|NASHVILLE": "America/Chicago", "TN|MEMPHIS": "America/Chicago",
        "IN|GARY": "America/Chicago", "KY|BOWLING GREEN": "America/Chicago"
    };


    // ============================================
    // PREMIUM STYLES (Enhanced for Website)
    // ============================================
    const STYLES = `
        :root {
            /* Atmos Dark Theme */
            --ct-primary: #06b6d4; /* Cyan 500 */
            --ct-primary-light: #22d3ee;
            --ct-secondary: #3b82f6; /* Blue 500 */
            --ct-bg: #0f172a; /* Slate 900 */
            --ct-bg-hover: rgba(255, 255, 255, 0.08);
            --ct-glass: rgba(15, 23, 42, 0.75);
            --ct-border: rgba(255, 255, 255, 0.1);
            --ct-text: #f1f5f9;
            --ct-text-muted: #94a3b8;
            --ct-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

            /* Badge Text Colors (Dark Mode) */
            --ct-text-safe: #000000;
            --ct-text-warn: #000000;
            --ct-text-block: #000000;
            --ct-text-time: #000000;

            /* Badge Backgrounds (Dark Mode - Subtle) */
            --ct-bg-safe: linear-gradient(135deg, rgba(16, 185, 129, 50%), rgba(5, 150, 105, 60%));
            --ct-bg-warn: linear-gradient(135deg, rgba(245, 158, 11, 50%), rgba(217, 119, 6, 60%));
            --ct-bg-block: linear-gradient(135deg, rgba(244, 63, 94, 50%), rgba(220, 38, 38, 60%));
            --ct-bg-time: linear-gradient(135deg, rgba(6, 182, 212, 50%), rgba(8, 145, 178, 60%));

            /* Badge Borders (Dark Mode) */
            --ct-border-safe: rgba(16, 185, 129, 0.4);
            --ct-border-warn: rgba(245, 158, 11, 0.4);
            --ct-border-block: rgba(244, 63, 94, 0.4);
            --ct-border-time: rgba(6, 182, 212, 0.4);
        }

        html.light-mode, body.light-mode {
            --ct-bg: #ffffff;
            --ct-bg-hover: rgba(0, 0, 0, 0.05);
            --ct-glass: rgba(255, 255, 255, 0.8);
            --ct-border: rgba(0, 0, 0, 0.1);
            --ct-text: #0f172a;
            --ct-text-muted: #475569;
            --ct-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

            --ct-text-safe: #064e3b;
            --ct-text-warn: #78350f;
            --ct-text-block: #7f1d1d;
            --ct-text-time: #0c4a6e;

            --ct-bg-safe: #d1fae5;
            --ct-bg-warn: #fef3c7;
            --ct-bg-block: #fee2e2;
            --ct-bg-time: #cffafe;

            --ct-border-safe: #10b981;
            --ct-border-warn: #f59e0b;
            --ct-border-block: #ef4444;
            --ct-border-time: #06b6d4;
        }

        /* Force Bolder Text in Light Mode */
        html.light-mode .ct-badge, body.light-mode .ct-badge { font-weight: 700 !important; }

        .ct-hidden { display: none !important; }
        .ct-glass {
            background: var(--ct-glass) !important;
            backdrop-filter: blur(12px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
            border: 1px solid var(--ct-border) !important;
            box-shadow: var(--ct-shadow) !important;
        }

        /* Top Controls Bar */
        #ct-top-controls {
            display: inline-flex !important;
            align-items: center !important;
            margin-left: 20px !important;
            gap: 12px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
        }

        /* Badge Design */
        .ct-badge {
            display: inline-flex !important;
            align-items: center !important;
            height: 32px !important;
            padding: 0 14px !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            font-weight: 900 !important;
            color: var(--ct-text) !important;
            backdrop-filter: blur(12px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid var(--ct-border) !important;
            cursor: default !important;
            white-space: nowrap !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            overflow: hidden !important;
            position: relative !important;
        }

        .ct-badge::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: -100% !important;
            width: 100% !important;
            height: 100% !important;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent) !important;
            transition: left 0.7s ease !important;
        }
        .ct-badge:hover::before { left: 100% !important; }
        .ct-badge:hover { transform: translateY(-1px) !important; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important; }

        .ct-safe { background: var(--ct-bg-safe) !important; border-color: var(--ct-border-safe) !important; color: var(--ct-text-safe) !important; }
        .ct-warn { background: var(--ct-bg-warn) !important; border-color: var(--ct-border-warn) !important; color: var(--ct-text-warn) !important; }
        .ct-block { background: var(--ct-bg-block) !important; border-color: var(--ct-border-block) !important; color: var(--ct-text-block) !important; }
        .ct-time { background: var(--ct-bg-time) !important; border-color: var(--ct-border-time) !important; color: var(--ct-text-time) !important; }
        .ct-neutral { background: var(--ct-bg-hover) !important; border-color: var(--ct-border) !important; color: var(--ct-text-muted) !important; }

        /* Search Button */
        #ct-search-helper-btn {
            position: fixed !important; bottom: 30px !important; left: 30px !important; z-index: 99999 !important;
            padding: 12px 15px !important;
            background: linear-gradient(135deg, var(--ct-primary), var(--ct-secondary)) !important;
            color: white !important;
            border: 1px solid var(--ct-border) !important;
            border-radius: 6px !important;
            font-family: -apple-system, sans-serif !important;
            font-size: 14px !important; font-weight: 500 !important;
            display: flex !important; align-items: center !important; gap: 10px !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            cursor: pointer !important;
            box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3) !important;
        }
        #ct-search-helper-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(6, 182, 212, 0.4) !important; }

        /* Settings Modal */
        #ct-settings-modal {
            position: fixed !important; top: 65px !important; right: 20px !important; width: 340px !important; z-index: 100002 !important;
            background: var(--ct-bg) !important;
            backdrop-filter: blur(20px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(200%) !important;
            border: 1px solid var(--ct-border) !important;
            border-radius: 12px !important; padding: 24px !important;
            display: none; flex-direction: column !important; gap: 16px !important;
            box-shadow: var(--ct-shadow) !important; color: var(--ct-text) !important;
            font-family: -apple-system, sans-serif !important; font-size: 14px !important;
            animation: ct-modal-appear 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        #ct-settings-modal.show { display: flex !important; }
        @keyframes ct-modal-appear { from { opacity: 0; transform: translateY(-10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .ct-modal-header { font-weight: 600 !important; font-size: 16px !important; margin-bottom: 4px !important; border-bottom: 1px solid var(--ct-border) !important; padding-bottom: 16px !important; color: var(--ct-text) !important; display: flex !important; align-items: center !important; gap: 10px !important; }
        .ct-setting-row { display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 12px 0 !important; border-bottom: 1px solid var(--ct-border) !important; }
        .ct-setting-row:last-child { border-bottom: none !important; }

        .ct-changelog-box { background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; margin-top: 10px; max-height: 100px; overflow-y: auto; font-size: 12px; color: var(--ct-text-muted); }
        .ct-changelog-item { margin-bottom: 4px; display: flex; gap: 6px; }
        .ct-changelog-item:before { content: "•"; color: var(--ct-primary); }

        .ct-switch { position: relative !important; display: inline-block !important; width: 44px !important; height: 24px !important; }
        .ct-switch input { opacity: 0 !important; width: 0 !important; height: 0 !important; }
        .ct-slider { position: absolute !important; cursor: pointer !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; background-color: var(--ct-border) !important; transition: .3s !important; border-radius: 34px !important; border: 1px solid var(--ct-border) !important; }
        .ct-slider:before { position: absolute !important; content: "" !important; height: 18px !important; width: 18px !important; left: 2px !important; bottom: 2px !important; background: white !important; transition: .3s !important; border-radius: 50% !important; }
        input:checked + .ct-slider { background: var(--ct-primary) !important; border-color: var(--ct-primary) !important; }
        input:checked + .ct-slider:before { transform: translateX(20px) !important; }

        /* Toast */
        .ct-toast-container { position: fixed !important; top: 90px !important; left: 50% !important; transform: translateX(-50%) !important; z-index: 100003 !important; pointer-events: none !important; }
        .ct-toast { display: flex !important; align-items: center !important; gap: 12px !important; background: var(--ct-bg) !important; backdrop-filter: blur(8px) !important; color: var(--ct-text) !important; padding: 12px 16px !important; border-radius: 99px !important; font-family: -apple-system, sans-serif !important; font-size: 14px !important; font-weight: 500 !important; box-shadow: var(--ct-shadow) !important; border: 1px solid var(--ct-border) !important; opacity: 0 !important; transform: translateY(-10px) scale(0.95) !important; transition: all 0.3s !important; }
        .ct-toast.show { opacity: 1 !important; transform: translateY(0) scale(1) !important; pointer-events: auto !important; }
        .ct-toast.success { border-color: #10b981 !important; }
        .ct-toast.error { border-color: #f43f5e !important; }
    `;
    GM_addStyle(STYLES);

    // ============================================
    // UTILITIES
    // ============================================
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    function showPremiumToast(message, type = 'info', duration = 900) {
        const existingToast = document.querySelector('.ct-toast-container');
        if (existingToast) existingToast.remove();

        const toastContainer = document.createElement('div');
        toastContainer.className = 'ct-toast-container';
        const toast = document.createElement('div');
        toast.className = `ct-toast ${type}`;

        const icons = { success: 'check-circle', error: 'alert-circle', warning: 'alert-triangle', info: 'info' };
        const iconColor = { success: '#10b981', error: '#f43f5e', warning: '#f59e0b', info: '#06b6d4' };

        toast.innerHTML = `
            <div class="ct-toast-icon"><i data-feather="${icons[type] || 'info'}" style="color:${iconColor[type] || '#06b6d4'}"></i></div>
            <div class="ct-toast-content">${message}</div>
        `;

        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);

        requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
        feather.replace();

        setTimeout(() => {
            if (toastContainer.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toastContainer.parentNode?.remove(), 300);
            }
        }, duration);
    }

    function isBusinessHours(timezone) {
        try {
            const now = new Date();
            const hour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', hour12: false }).format(now));
            return hour >= 9 && hour < 17;
        } catch (e) { return true; }
    }

    function parseAddressForInfo(address) {
        const info = { state: null, city: null, zip: null, timezone: null, isBusinessHours: null, isValidState: false };
        if (!address) return info;

        const stateMatch = address.match(/\b([A-Z]{2})\b\s+\d{5}/);
        if (stateMatch) {
            info.state = stateMatch[1];
            info.isValidState = !!STATE_TIMEZONES[info.state];
        }

        if (info.state) {
            const cityMatch = address.match(/([A-Z\s]+)\s+[A-Z]{2}\s+\d{5}/);
            if (cityMatch) info.city = cityMatch[1].trim();
        }

        if (info.isValidState) {
            info.timezone = STATE_TIMEZONES[info.state];
            for (const [key, exceptionTZ] of Object.entries(TZ_EXCEPTIONS)) {
                const [exState, exCity] = key.split('|');
                if (info.state === exState && address.includes(exCity)) {
                    info.timezone = exceptionTZ;
                    break;
                }
            }
            info.isBusinessHours = isBusinessHours(info.timezone);
        }
        return info;
    }

    function copyToClipboard(text) {
        if (typeof GM_setClipboard === 'function') { GM_setClipboard(text); return true; }
        if (navigator.clipboard) { navigator.clipboard.writeText(text); return true; }
        return false;
    }

    // ============================================
    // CLASSES
    // ============================================
    class ComplianceEngine {
        constructor() {
            this.lastProcessedAddress = '';
            this.currentRule = null;
        }

        processAddress(address) {
            if (!address || address === this.lastProcessedAddress) return this.getStatus();
            this.lastProcessedAddress = address;
            this.addressInfo = parseAddressForInfo(address);
            this.currentRule = null;

            if (this.addressInfo.state && !this.addressInfo.isValidState) {
                return { type: 'ERROR', message: `Invalid State: ${this.addressInfo.state}`, canCall: false };
            }

            // Check Rules (City Priority)
            if (this.addressInfo.city) {
                for (const [key, rule] of Object.entries(RULES)) {
                    if (key.length > 2 && address.includes(key)) {
                        this.currentRule = rule;
                        break;
                    }
                }
            }
            // Check Rules (State)
            if (!this.currentRule && this.addressInfo.state && RULES[this.addressInfo.state]) {
                this.currentRule = RULES[this.addressInfo.state];
            }

            return this.getStatus();
        }

        getStatus() {
            if (!this.currentRule) {
                if (this.addressInfo?.state && !this.addressInfo.isValidState) return { type: 'ERROR', message: `Invalid State`, canCall: false };
                return { type: 'SAFE', message: 'No restrictions', canCall: true };
            }
            return {
                type: this.currentRule.type,
                message: this.currentRule.msg,
                canCall: this.currentRule.type !== 'BLOCK'
            };
        }

        updateUI(status, timeInfo) {
            if (!status) return;
            updateTopBar(status.type, status.message, timeInfo);
            const callBtn = document.querySelector(".call-button, button.dial-btn, .start-call")?.closest('button');
            if (callBtn) {
                callBtn.style.opacity = status.canCall ? "1" : "0.3";
                callBtn.style.pointerEvents = status.canCall ? "auto" : "none";
            }
        }
    }

    class SettingsManager {
        constructor() {
            this.modal = null;
        }

        init() {
            this.createModal();
            this.injectButton();
        }

        injectButton() {
            const userIcon = document.querySelector('.user-icon');
            if (!userIcon || document.getElementById('ct-nav-settings-btn')) return;

            const parent = userIcon.parentElement;
            parent.style.display = 'flex';
            parent.style.alignItems = 'center';

            const btn = document.createElement('button');
            btn.id = 'ct-nav-settings-btn';
            btn.innerHTML = `<i data-feather="settings" style="width:18px;height:18px;"></i>`;
            btn.onclick = (e) => {
                e.stopPropagation();
                this.modal.classList.toggle('show');
            };
            parent.insertBefore(btn, userIcon);
            feather.replace();
        }

        createModal() {
            this.modal = document.createElement('div');
            this.modal.id = 'ct-settings-modal';

            // Build Changelog HTML
            const changelogHtml = APP_CONFIG.update.changelog.map(item =>
                `<div class="ct-changelog-item">${item}</div>`
            ).join('');

            this.modal.innerHTML = `
                <div class="ct-modal-header"><i data-feather="settings"></i> Atmos Agent Settings</div>
                <div class="ct-setting-row">
                    <span>Use Split Name</span>
                    <label class="ct-switch"><input type="checkbox" id="ct-opt-split"><span class="ct-slider"></span></label>
                </div>

                <div style="margin-top:20px;padding-top:10px;border-top:1px solid var(--ct-border);">
                    <div style="font-size:12px;font-weight:600;margin-bottom:6px;">What's New in v${APP_CONFIG.version}</div>
                    <div class="ct-changelog-box">${changelogHtml}</div>
                </div>
            `;
            document.body.appendChild(this.modal);

            document.getElementById('ct-opt-split').checked = GM_getValue('ct_use_split', false);
            document.getElementById('ct-opt-split').onchange = (e) => {
                GM_setValue('ct_use_split', e.target.checked);
                showPremiumToast('Saved', 'success');
            };

            document.addEventListener('click', (e) => {
                if (!this.modal.contains(e.target) && e.target.id !== 'ct-nav-settings-btn') this.modal.classList.remove('show');
            });
        }
    }

    function updateTopBar(type, msg, timeInfo) {
        let container = document.getElementById('ct-top-controls');
        if (!container) {
            const nav = document.getElementById('dashboard-nav-tabs');
            if (!nav) return;
            container = document.createElement('div');
            container.id = 'ct-top-controls';
            nav.appendChild(container);
        }

        container.innerHTML = `
            <div class="ct-badge ct-${type.toLowerCase()}">
                <i data-feather="${type === 'SAFE' ? 'check-circle' : 'alert-circle'}" style="width:14px;margin-right:6px;"></i> ${msg}
            </div>
        `;

        if (timeInfo && timeInfo.time) {
            container.innerHTML += `
                <div class="ct-badge ct-time" style="margin-left:10px;">
                    <i data-feather="${timeInfo.isBusinessHours ? 'sun' : 'moon'}" style="width:14px;margin-right:6px;"></i> ${timeInfo.time}
                </div>
            `;
        }
        feather.replace();
    }

    // ============================================
    // MAIN
    // ============================================
    class AtmosAgent {
        constructor() {
            this.compliance = new ComplianceEngine();
            this.settings = new SettingsManager();
            this.initialized = false;
        }

        init() {
            if (this.initialized) return;
            this.settings.init();

            // Check Loop
            setInterval(() => this.check(), 1000);

            // Search Helper
            this.addSearchButton();

            this.initialized = true;
        }

        check() {
            const inputs = document.querySelectorAll('input[type="text"]');
            const addrInput = inputs[CONFIG_INDICES.ADDRESS_INPUT_INDEX];
            if (!addrInput) return;

            const addr = addrInput.value.trim().toUpperCase();
            if (!addr) {
                updateTopBar('NEUTRAL', 'Enter address');
                return;
            }

            const status = this.compliance.processAddress(addr);
            const timeInfo = this.compliance.addressInfo?.isValidState ?
                { time: new Date().toLocaleTimeString('en-US', { timeZone: this.compliance.addressInfo.timezone }), isBusinessHours: this.compliance.addressInfo.isBusinessHours } : null;

            this.compliance.updateUI(status, timeInfo);
        }

        addSearchButton() {
            const btn = document.createElement('button');
            btn.id = 'ct-search-helper-btn';
            btn.innerHTML = `<i data-feather="copy"></i>`;
            btn.onclick = () => {
                const inputs = document.querySelectorAll('input[type="text"]');
                const addr = inputs[CONFIG_INDICES.ADDRESS_INPUT_INDEX]?.value;
                if (addr) {
                    copyToClipboard(addr);
                    showPremiumToast('Address Copied', 'success');
                }
            };
            document.body.appendChild(btn);
        }
    }

    // Init Logic
    const observer = new MutationObserver(() => {
        if (document.querySelector('.user-icon')) {
            new AtmosAgent().init();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
