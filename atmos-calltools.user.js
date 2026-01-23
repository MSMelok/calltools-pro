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
// @resource     rules https://msmelok.github.io/atmos-agent/assets/data/rules.json
// @resource     config https://msmelok.github.io/atmos-agent/assets/data/config.json
// @require      https://unpkg.com/feather-icons@4.29.0/dist/feather.min.js
// @updateURL    https://msmelok.github.io/atmos-agent/atmos-calltools.meta.js
// @downloadURL  https://msmelok.github.io/atmos-agent/atmos-calltools.user.js
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

        console.log(`Atmos CallTools: Resources loaded. Version ${APP_CONFIG.version}`);
    } catch (e) {
        console.warn("Atmos: Failed to load external resources", e);
        RULES = {
            "AL": { type: "BLOCK", msg: "AUTO REJECT: Alabama" },
            "NY": { type: "BLOCK", msg: "AUTO REJECT: New York" }
        };
    }

    const CONFIG = {
        FIRST_NAME_INDEX: 2,
        LAST_NAME_INDEX: 3,
        ADDRESS_INPUT_INDEX: 4,
        BUSINESS_INPUT_INDEX: 5,
        VERSION: APP_CONFIG.version,
        GITHUB_URL: "https://msmelok.github.io/atmos-agent/"
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

    // STYLES
    const STYLES = `
        :root {
            /* Default Dark Mode */
            --ct-primary: #3b82f6;
            --ct-primary-light: #60a5fa;
            --ct-secondary: #8b5cf6;
            --ct-bg: #02040a;
            --ct-bg-hover: rgba(255, 255, 255, 0.08);
            --ct-glass: rgba(2, 4, 10, 0.5);
            --ct-border: rgba(255, 255, 255, 0.08);
            --ct-text: #ffffff;
            --ct-text-muted: #94a3b8;
            --ct-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

            /* Badge Text Colors (Dark Mode) */
            --ct-text-safe: #000000;
            --ct-text-warn: #000000;
            --ct-text-block: #000000;
            --ct-text-time: #000000;

            /* Badge Backgrounds (Dark Mode) */
            --ct-bg-safe: linear-gradient(135deg, rgba(16, 185, 129, 50%), rgba(5, 150, 105, 60%));
            --ct-bg-warn: linear-gradient(135deg, rgba(245, 158, 11, 50%), rgba(217, 119, 6, 60%));
            --ct-bg-block: linear-gradient(135deg, rgba(244, 63, 94, 50%), rgba(220, 38, 38, 60%));
            --ct-bg-time: linear-gradient(135deg, rgba(59, 130, 246, 50%), rgba(37, 99, 235, 60%));

            /* Badge Borders (Dark Mode) */
            --ct-border-safe: rgba(16, 185, 129, 0.4);
            --ct-border-warn: rgba(245, 158, 11, 0.4);
            --ct-border-block: rgba(244, 63, 94, 0.4);
            --ct-border-time: rgba(59, 130, 246, 0.4);
        }

        html.light-mode, body.light-mode {
            --ct-bg: #ffffff;
            --ct-bg-hover: rgba(0, 0, 0, 0.05);
            --ct-glass: rgba(255, 255, 255, 0.7);
            --ct-border: rgba(0, 0, 0, 0.1);
            --ct-text: #1e293b;
            --ct-text-muted: #64748b;
            --ct-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

            /* Badge Text Colors (Light Mode) */
            --ct-text-safe: #064e3b;
            --ct-text-warn: #78350f;
            --ct-text-block: #7f1d1d;
            --ct-text-time: #1e3a8a;

            /* Badge Backgrounds (Light Mode) */
            --ct-bg-safe: #d1fae5;
            --ct-bg-warn: #fef3c7;
            --ct-bg-block: #fee2e2;
            --ct-bg-time: #dbeafe;

            /* Badge Borders (Light Mode) */
            --ct-border-safe: #10b981;
            --ct-border-warn: #f59e0b;
            --ct-border-block: #ef4444;
            --ct-border-time: #3b82f6;
        }

        html.light-mode .ct-badge, body.light-mode .ct-badge {
            font-weight: 700 !important;
        }

        .ct-hidden { display: none !important; }
        .ct-glass {
            background: var(--ct-glass) !important;
            backdrop-filter: blur(12px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
            border: 1px solid var(--ct-border) !important;
            box-shadow: var(--ct-shadow) !important;
        }

        #ct-top-controls {
            display: inline-flex !important;
            align-items: center !important;
            margin-left: 20px !important;
            gap: 12px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
        }

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
            letter-spacing: -0.01em !important;
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

        .ct-badge:hover::before {
            left: 100% !important;
        }

        .ct-badge:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        }

        .ct-safe {
            background: var(--ct-bg-safe) !important;
            border-color: var(--ct-border-safe) !important;
            color: var(--ct-text-safe) !important;
        }

        .ct-warn {
            background: var(--ct-bg-warn) !important;
            border-color: var(--ct-border-warn) !important;
            color: var(--ct-text-warn) !important;
        }

        .ct-block {
            background: var(--ct-bg-block) !important;
            border-color: var(--ct-border-block) !important;
            color: var(--ct-text-block) !important;
        }

        .ct-time {
            background: var(--ct-bg-time) !important;
            border-color: var(--ct-border-time) !important;
            color: var(--ct-text-time) !important;
        }

        .ct-neutral {
            background: var(--ct-bg-hover) !important;
            border-color: var(--ct-border) !important;
            color: var(--ct-text-muted) !important;
        }

        #ct-search-helper-btn {
            position: fixed !important;
            bottom: 30px !important;
            left: 30px !important;
            z-index: 99999 !important;
            padding: 12px 15px !important;
            background: linear-gradient(135deg, var(--ct-primary), var(--ct-secondary)) !important;
            color: white !important;
            border: 1px solid var(--ct-border) !important;
            border-radius: 6px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            cursor: pointer !important;
            letter-spacing: 0.01em !important;
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3) !important;
        }

        #ct-search-helper-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4) !important;
        }

        #ct-nav-settings-btn {
            background: transparent !important;
            border: none !important;
            padding: 0 10px !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
            color: rgba(255,255,255,0.7) !important;
            margin-right: 5px !important;
        }

        #ct-nav-settings-btn:hover {
            color: white !important;
            transform: rotate(45deg);
        }

        #ct-settings-modal {
            position: fixed !important;
            top: 65px !important;
            right: 20px !important;
            width: 320px !important;
            z-index: 100002 !important;
            background: var(--ct-bg) !important;
            backdrop-filter: blur(20px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(200%) !important;
            border: 1px solid var(--ct-border) !important;
            border-radius: 12px !important;
            padding: 24px !important;
            display: none;
            flex-direction: column !important;
            gap: 16px !important;
            box-shadow: var(--ct-shadow) !important;
            color: var(--ct-text) !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
            font-size: 14px !important;
            animation: ct-modal-appear 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        #ct-settings-modal.show {
            display: flex !important;
        }

        @keyframes ct-modal-appear {
            from {
                opacity: 0;
                transform: translateY(-10px) scale(0.98);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .ct-modal-header {
            font-weight: 600 !important;
            font-size: 16px !important;
            margin-bottom: 4px !important;
            border-bottom: 1px solid var(--ct-border) !important;
            padding-bottom: 16px !important;
            color: var(--ct-text) !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
        }

        .ct-setting-row {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 12px 0 !important;
            border-bottom: 1px solid var(--ct-border) !important;
        }

        .ct-setting-row:last-child {
            border-bottom: none !important;
        }

        .ct-switch {
            position: relative !important;
            display: inline-block !important;
            width: 44px !important;
            height: 24px !important;
        }

        .ct-switch input {
            opacity: 0 !important;
            width: 0 !important;
            height: 0 !important;
        }

        .ct-slider {
            position: absolute !important;
            cursor: pointer !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background-color: var(--ct-border) !important;
            transition: .3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            border-radius: 34px !important;
            border: 1px solid var(--ct-border) !important;
        }

        .ct-slider:before {
            position: absolute !important;
            content: "" !important;
            height: 18px !important;
            width: 18px !important;
            left: 2px !important;
            bottom: 2px !important;
            background: white !important;
            transition: .3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            border-radius: 50% !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
        }

        input:checked + .ct-slider {
            background: var(--ct-primary) !important;
            border-color: var(--ct-primary) !important;
        }

        input:checked + .ct-slider:before {
            transform: translateX(20px) !important;
        }

        .ct-hidden-element {
            display: none !important;
        }

        .ct-toast-container {
            position: fixed !important;
            top: 90px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            z-index: 100003 !important;
            pointer-events: none !important;
        }

        .ct-toast {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            background: var(--ct-bg) !important;
            backdrop-filter: blur(8px) !important;
            color: var(--ct-text) !important;
            padding: 12px 16px !important;
            border-radius: 99px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            box-shadow: var(--ct-shadow) !important;
            border: 1px solid var(--ct-border) !important;
            opacity: 0 !important;
            transform: translateY(-10px) scale(0.95) !important;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            min-width: auto !important;
            max-width: 400px !important;
        }

        .ct-toast.show {
            opacity: 1 !important;
            transform: translateY(0) scale(1) !important;
            pointer-events: auto !important;
        }

        .ct-toast.success { border-color: #10b981 !important; }
        .ct-toast.error { border-color: #f43f5e !important; }
        .ct-toast.info { border-color: #3b82f6 !important; }
        .ct-toast.warning { border-color: #f59e0b !important; }

        .ct-toast-icon {
            flex-shrink: 0 !important;
            width: 18px !important;
            height: 18px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .ct-toast-content {
            flex: 1 !important;
            white-space: nowrap !important;
        }
    `;

    GM_addStyle(STYLES);

    // UTILITY FUNCTIONS
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function showPremiumToast(message, type = 'info', duration = 900) {
        const existingToast = document.querySelector('.ct-toast-container');
        if (existingToast) existingToast.remove();

        const toastContainer = document.createElement('div');
        toastContainer.className = 'ct-toast-container';

        const toast = document.createElement('div');
        toast.className = `ct-toast ${type}`;

        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const iconColor = {
            success: '#10b981',
            error: '#f43f5e',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        toast.innerHTML = `
            <div class="ct-toast-icon">
                <i data-feather="${icons[type] || 'info'}" style="color:${iconColor[type] || '#3b82f6'}"></i>
            </div>
            <div class="ct-toast-content">${message}</div>
        `;

        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        });

        feather.replace();

        setTimeout(() => {
            if (toastContainer.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toastContainer.parentNode) {
                        toastContainer.remove();
                    }
                }, 300);
            }
        }, duration);

        return toastContainer;
    }

    function isBusinessHours(timezone) {
        try {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: 'numeric',
                hour12: false
            });
            const hour = parseInt(formatter.format(now));
            return hour >= 9 && hour < 17;
        } catch (e) {
            return true;
        }
    }

    function parseAddressForInfo(address) {
        const info = {
            state: null,
            city: null,
            zip: null,
            timezone: null,
            isBusinessHours: null,
            isValidState: false
        };

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

        const zipMatch = address.match(/\b\d{5}\b/);
        if (zipMatch) info.zip = zipMatch[0];

        if (info.isValidState && STATE_TIMEZONES[info.state]) {
            info.timezone = STATE_TIMEZONES[info.state];

            for (const [key, exceptionTZ] of Object.entries(TZ_EXCEPTIONS)) {
                const [exceptionState, exceptionCity] = key.split('|');
                if (info.state === exceptionState && address.includes(exceptionCity)) {
                    info.timezone = exceptionTZ;
                    break;
                }
            }

            info.isBusinessHours = isBusinessHours(info.timezone);
        }

        return info;
    }

    function formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length === 10) {
            return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11 && cleaned[0] === '1') {
            return `+1 (${cleaned.slice(1,4)}) ${cleaned.slice(4,7)}-${cleaned.slice(7)}`;
        }

        return phone;
    }

    function copyToClipboard(text) {
        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(text);
            return true;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                return true;
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            });
        }

        return false;
    }

    function getStorage(key, defaultValue = null) {
        try {
            return GM_getValue(key, defaultValue);
        } catch (e) {
            console.warn('GM_getValue failed, falling back to defaultValue', e);
            return defaultValue;
        }
    }

    function setStorage(key, value) {
        try {
            GM_setValue(key, value);
        } catch (e) {
            console.error('Failed to save to GM storage:', e);
        }
    }

    // COMPLIANCE ENGINE
    class ComplianceEngine {
        constructor() {
            this.lastProcessedAddress = '';
            this.currentState = null;
            this.currentCity = null;
            this.currentRule = null;
            this.callButton = null;
        }

        processAddress(address) {
            if (!address || address === this.lastProcessedAddress) {
                return this.getComplianceStatus();
            }

            this.lastProcessedAddress = address;
            const addressInfo = parseAddressForInfo(address);

            this.currentState = null;
            this.currentCity = null;
            this.currentRule = null;
            this.addressInfo = addressInfo;

            if (addressInfo.state && !addressInfo.isValidState) {
                this.currentRule = {
                    type: "ERROR",
                    msg: `Invalid state code: ${addressInfo.state}`
                };
                return this.getComplianceStatus();
            }

            if (addressInfo.state && RULES[addressInfo.state]) {
                this.currentState = addressInfo.state;
                this.currentRule = RULES[addressInfo.state];
            }

            if (addressInfo.city) {
                for (const [key, rule] of Object.entries(RULES)) {
                    if (key.length > 2 && address.includes(key)) {
                        this.currentCity = key;
                        this.currentRule = rule;
                        break;
                    }
                }
            }

            return this.getComplianceStatus();
        }

        getComplianceStatus() {
            if (!this.currentRule) {
                if (this.addressInfo && this.addressInfo.state) {
                    if (!this.addressInfo.isValidState) {
                        return {
                            type: 'ERROR',
                            message: `Invalid state code: ${this.addressInfo.state}`,
                            canCall: false,
                            severity: 'high'
                        };
                    }
                }

                return {
                    type: 'SAFE',
                    message: 'No restrictions',
                    canCall: true,
                    severity: 'none'
                };
            }

            return {
                type: this.currentRule.type,
                message: this.currentRule.msg,
                canCall: this.currentRule.type !== 'BLOCK' && this.currentRule.type !== 'ERROR',
                severity: this.currentRule.type === 'BLOCK' || this.currentRule.type === 'ERROR' ? 'high' :
                         this.currentRule.type === 'WARN' ? 'medium' : 'low'
            };
        }

        updateUI(complianceStatus, timeInfo = null) {
            if (!complianceStatus) {
                updateTopBar('NEUTRAL', 'No compliance data', null);
                return;
            }

            updateTopBar(complianceStatus.type, complianceStatus.message, timeInfo);

            const callBtn = document.querySelector(".call-button, button.dial-btn, .start-call, .fa-phone")?.closest('button');
            if (callBtn) {
                if (!complianceStatus.canCall) {
                    callBtn.style.opacity = "0.3";
                    callBtn.style.pointerEvents = "none";
                    callBtn.title = "Call blocked due to compliance restrictions";
                } else {
                    callBtn.style.opacity = "1";
                    callBtn.style.pointerEvents = "auto";
                    callBtn.title = "";
                }
            }
        }

        getTimeString() {
            const inputs = document.querySelectorAll('input[type="text"]');
            const inputAddr = inputs[CONFIG.ADDRESS_INPUT_INDEX] ? inputs[CONFIG.ADDRESS_INPUT_INDEX].value.trim().toUpperCase() : "";

            if (!inputAddr || inputAddr.length < 5) {
                return null;
            }

            const addressInfo = parseAddressForInfo(inputAddr);

            if (!addressInfo.state || !addressInfo.isValidState || !addressInfo.timezone) {
                return null;
            }

            try {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: addressInfo.timezone,
                    hour: 'numeric',
                    minute: 'numeric',
                    second: '2-digit',
                    hour12: true
                });

                const timeIcon = addressInfo.isBusinessHours ? 'sun' : 'moon';
                const formattedTime = formatter.format(now);

                if (!formattedTime || formattedTime === 'Invalid Date') {
                    return null;
                }

                const timeText = `${formattedTime} (${addressInfo.state})`;

                return {
                    time: timeText,
                    icon: timeIcon,
                    isBusinessHours: addressInfo.isBusinessHours,
                    isValid: true
                };
            } catch (e) {
                console.warn('Failed to format time for timezone:', addressInfo.timezone, e);
                return null;
            }
        }
    }

    // SEARCH HELPER
    class SearchHelper {
        constructor() {
            this.button = null;
            this.isInitialized = false;
        }

        init() {
            if (this.isInitialized) return;

            this.createButton();
            this.setupEventListeners();
            this.isInitialized = true;
        }

        createButton() {
            if (document.getElementById('ct-search-helper-btn')) return;

            this.button = document.createElement('button');
            this.button.id = 'ct-search-helper-btn';
            this.button.innerHTML = `<i data-feather="copy" style="width:20px;height:20px;"></i>`;
            this.button.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 24px;
                z-index: 99999;
                padding: 14px 20px;
                background: linear-gradient(135deg, var(--ct-primary), var(--ct-secondary));
                color: white;
                border: 1px solid var(--ct-border);
                border-radius: 6px;
                font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
                cursor: pointer;
            `;

            document.body.appendChild(this.button);
            feather.replace();
        }

        setupEventListeners() {
            if (!this.button) return;

            this.button.addEventListener('click', () => this.handleSearch());

            this.button.addEventListener('mouseenter', () => {
                this.button.style.transform = 'translateY(-2px)';
                this.button.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
            });

            this.button.addEventListener('mouseleave', () => {
                this.button.style.transform = 'translateY(0)';
                this.button.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
            });
        }

        handleSearch() {
            const inputs = document.querySelectorAll('input[type="text"]');
            const useSplitName = getStorage('ct_use_split_name', false);
            const addrInput = inputs[CONFIG.ADDRESS_INPUT_INDEX];

            if (!addrInput) {
                showPremiumToast("Address input not found", "error");
                return;
            }

            const addr = addrInput.value.trim();

            if (!addr) {
                showPremiumToast("No address entered", "error");
                return;
            }

            let namePart = "";

            if (useSplitName) {
                const fName = inputs[CONFIG.FIRST_NAME_INDEX] ? inputs[CONFIG.FIRST_NAME_INDEX].value.trim() : "";
                const lName = inputs[CONFIG.LAST_NAME_INDEX] ? inputs[CONFIG.LAST_NAME_INDEX].value.trim() : "";
                namePart = `${fName} ${lName}`.trim();
            } else {
                namePart = inputs[CONFIG.BUSINESS_INPUT_INDEX] ? inputs[CONFIG.BUSINESS_INPUT_INDEX].value.trim() : "";
            }

            const text = namePart ? `${namePart} - ${addr}` : addr;

            if (copyToClipboard(text)) {
                showPremiumToast("Address copied to clipboard!", "success");
            } else {
                showPremiumToast("Failed to copy address", "error");
            }
        }
    }

    // SETTINGS MANAGER
    class SettingsManager {
        constructor() {
            this.settings = {
                useSplitName: getStorage('ct_use_split_name', false),
                hideActions: getStorage('ct_hide_actions', false),
                hideConnections: getStorage('ct_hide_connections', false)
            };
            this.modal = null;
            this.settingsBtn = null;
            this.navObserver = null;
            this.bodyObserver = null;
        }

        init() {
            console.log('SettingsManager: Initializing...');
            this.createSettingsModal();
            this.applyVisibilityRules();

            this.observeNavBar();
        }

        observeNavBar() {
            const findAndInject = () => {
                const navBar = document.querySelector('.agent-top-nav, .top-nav');
                const userIcon = document.querySelector('.user-icon');

                if (navBar && userIcon && !document.getElementById('ct-nav-settings-btn')) {
                    this.injectSettingsButton(userIcon);
                }
            };

            findAndInject();

            this.navObserver = new MutationObserver((mutations) => {
                findAndInject();
            });

            this.navObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        injectSettingsButton(userIconElement) {
            if (document.getElementById('ct-nav-settings-btn')) return;

            const parent = userIconElement.parentElement;
            if (!parent) return;

            parent.style.display = 'flex';
            parent.style.alignItems = 'center';

            this.settingsBtn = document.createElement('button');
            this.settingsBtn.id = 'ct-nav-settings-btn';
            this.settingsBtn.title = 'CT Pro Settings';
            this.settingsBtn.innerHTML = `<i data-feather="settings" style="width:18px;height:18px;"></i>`;

            parent.insertBefore(this.settingsBtn, userIconElement);

            feather.replace();
            this.setupEventListeners();

            console.log('Settings button injected into nav');
        }

        createSettingsModal() {
            if (this.modal || document.getElementById('ct-settings-modal')) return;

            this.modal = document.createElement('div');
            this.modal.id = 'ct-settings-modal';
            this.modal.innerHTML = `
                <div class="ct-modal-header">
                    <i data-feather="settings" style="width:18px;height:18px;"></i>
                    Atmos CallTools Settings
                </div>

                <div class="ct-setting-row">
                    <span style="display:flex; align-items:center; gap:8px;">
                        <i data-feather="user" style="width:16px;height:16px;color:var(--ct-text-muted)"></i>
                        Use First/Last Name
                    </span>
                    <label class="ct-switch">
                        <input type="checkbox" id="ct-opt-split-name" ${this.settings.useSplitName ? 'checked' : ''}>
                        <span class="ct-slider"></span>
                    </label>
                </div>

                <div class="ct-setting-row">
                    <span style="display:flex; align-items:center; gap:8px;">
                        <i data-feather="layout" style="width:16px;height:16px;color:var(--ct-text-muted)"></i>
                        Hide Action Buttons (SMS/Email)
                    </span>
                    <label class="ct-switch">
                        <input type="checkbox" id="ct-opt-hide-actions" ${this.settings.hideActions ? 'checked' : ''}>
                        <span class="ct-slider"></span>
                    </label>
                </div>

                <div class="ct-setting-row">
                    <span style="display:flex; align-items:center; gap:8px;">
                        <i data-feather="grid" style="width:16px;height:16px;color:var(--ct-text-muted)"></i>
                        Hide Connections Card
                    </span>
                    <label class="ct-switch">
                        <input type="checkbox" id="ct-opt-hide-connections" ${this.settings.hideConnections ? 'checked' : ''}>
                        <span class="ct-slider"></span>
                    </label>
                </div>

                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--ct-border);">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
                        <span style="font-size:12px; color:var(--ct-text-muted);">About</span>
                        <span style="font-size:12px; color:var(--ct-primary-light);">v${CONFIG.VERSION}</span>
                    </div>
                </div>
            `;

            document.body.appendChild(this.modal);
            feather.replace();
        }

        applyVisibilityRules() {
            if (this.settings.hideActions) {
                document.body.classList.add('ct-hide-actions');
            } else {
                document.body.classList.remove('ct-hide-actions');
            }

            if (this.settings.hideConnections) {
                document.body.classList.add('ct-hide-connections');
            } else {
                document.body.classList.remove('ct-hide-connections');
            }

            this.hideActionButtonsManual();
            this.hideConnectionsCardManual();
        }

        hideActionButtonsManual() {
            const buttons = document.querySelectorAll('button.mat-primary');
            buttons.forEach(btn => {
                const text = btn.textContent.trim();
                if (text === 'SMS' || text === 'Email' || text === 'Agent Script') {
                    if (this.settings.hideActions) {
                        btn.classList.add('ct-hidden-element');
                    } else {
                        btn.classList.remove('ct-hidden-element');
                    }
                }
            });
        }

        hideConnectionsCardManual() {
            const cards = document.querySelectorAll('.dyn-card');
            cards.forEach(card => {
                if (card.textContent.includes('Zillow') || card.textContent.includes('Google Maps')) {
                    if (this.settings.hideConnections) {
                        card.classList.add('ct-hidden-element');
                    } else {
                        card.classList.remove('ct-hidden-element');
                    }
                }
            });
        }

        setupEventListeners() {
            if (!this.settingsBtn || !this.modal) return;

            const newBtn = this.settingsBtn.cloneNode(true);
            this.settingsBtn.parentNode.replaceChild(newBtn, this.settingsBtn);
            this.settingsBtn = newBtn;

            this.settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();

                const isShowing = this.modal.classList.contains('show');
                this.modal.classList.toggle('show');

                if (!isShowing) {
                    const rect = this.settingsBtn.getBoundingClientRect();
                    this.modal.style.top = `${rect.bottom + 8}px`;
                    this.modal.style.right = `${window.innerWidth - rect.right}px`;
                }
            });

            document.addEventListener('click', (e) => {
                if (this.modal.classList.contains('show') &&
                    !this.modal.contains(e.target) &&
                    !this.settingsBtn.contains(e.target)) {
                    this.modal.classList.remove('show');
                }
            });

            if (this.bodyObserver) {
                this.bodyObserver.disconnect();
            }
            this.bodyObserver = new MutationObserver(() => {
                this.hideActionButtonsManual();
                this.hideConnectionsCardManual();
            });
            this.bodyObserver.observe(document.body, { childList: true, subtree: true });

            const handleSettingChange = (e) => {
                if (!this.modal.contains(e.target)) return;
                const target = e.target;

                if (target.id === 'ct-opt-split-name') {
                    this.settings.useSplitName = target.checked;
                    setStorage('ct_use_split_name', target.checked);
                    showPremiumToast(`First/Last Name: ${target.checked ? 'ON' : 'OFF'}`, 'success');
                }

                if (target.id === 'ct-opt-hide-actions') {
                    this.settings.hideActions = target.checked;
                    setStorage('ct_hide_actions', target.checked);
                    this.applyVisibilityRules();
                    showPremiumToast(`Action Buttons: ${target.checked ? 'HIDDEN' : 'VISIBLE'}`, 'success');
                }

                if (target.id === 'ct-opt-hide-connections') {
                    this.settings.hideConnections = target.checked;
                    setStorage('ct_hide_connections', target.checked);
                    this.applyVisibilityRules();
                    showPremiumToast(`Connections Card: ${target.checked ? 'HIDDEN' : 'VISIBLE'}`, 'success');
                }
            };

            document.addEventListener('change', handleSettingChange);
        }
    }

    // TOP BAR CONTROLLER
    function updateTopBar(complianceStatus, complianceText, timeInfo) {
        const navBar = document.getElementById('dashboard-nav-tabs');
        if (!navBar) return;

        let container = document.getElementById('ct-top-controls');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ct-top-controls';
            container.style.cssText = `
                display: inline-flex;
                align-items: center;
                margin-left: 15px;
                gap: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            `;
            navBar.appendChild(container);
        }

        let compBadge = document.getElementById('ct-comp-badge');
        if (!compBadge) {
            compBadge = document.createElement('div');
            compBadge.id = 'ct-comp-badge';
            compBadge.className = 'ct-badge';
            container.appendChild(compBadge);
        }

        let timeBadge = document.getElementById('ct-time-badge');
        if (!timeBadge) {
            timeBadge = document.createElement('div');
            timeBadge.id = 'ct-time-badge';
            timeBadge.className = 'ct-badge ct-time';
            container.appendChild(timeBadge);
        }

        const compClass = complianceStatus === 'SAFE' ? 'ct-safe' :
                         complianceStatus === 'WARN' ? 'ct-warn' :
                         complianceStatus === 'BLOCK' ? 'ct-block' :
                         complianceStatus === 'ERROR' ? 'ct-block' : 'ct-neutral';

        const compIcon = complianceStatus === 'SAFE' ? 'check-circle' :
                        complianceStatus === 'WARN' ? 'alert-triangle' :
                        complianceStatus === 'BLOCK' ? 'alert-octagon' :
                        complianceStatus === 'ERROR' ? 'alert-circle' : 'loader';

        compBadge.className = `ct-badge ${compClass}`;
        compBadge.innerHTML = `<i data-feather="${compIcon}" style="width:14px;height:14px;margin-right:6px;"></i> ${complianceText}`;

        if (timeInfo && timeInfo.time) {
            timeBadge.style.display = 'inline-flex';
            timeBadge.style.visibility = 'visible';
            timeBadge.style.opacity = '1';
            const timeIcon = timeInfo.isBusinessHours ? 'sun' : 'moon';
            timeBadge.innerHTML = `<i data-feather="${timeIcon}" style="width:14px;height:14px;margin-right:6px;"></i> ${timeInfo.time}`;
        } else {
            timeBadge.style.display = 'none';
            timeBadge.style.visibility = 'hidden';
            timeBadge.style.opacity = '0';
            timeBadge.innerHTML = '';
        }

        feather.replace();
    }

    // MAIN APPLICATION
    class CallToolsPro {
        constructor() {
            this.complianceEngine = new ComplianceEngine();
            this.searchHelper = new SearchHelper();
            this.settingsManager = new SettingsManager();
            this.isInitialized = false;
            this.checkInterval = null;
        }

        init() {
            if (this.isInitialized) return;

            try {
                this.searchHelper.init();
                this.settingsManager.init();
                this.startComplianceCheck();

            } catch (error) {
                console.error('Failed to initialize CallTools Pro:', error);
                showPremiumToast('Failed to initialize: ' + error.message, 'error');
            }
        }

        startComplianceCheck() {
            this.checkCompliance();
            this.checkInterval = setInterval(() => this.checkCompliance(), 1000);
            const addressInput = document.querySelectorAll('input[type="text"]')[CONFIG.ADDRESS_INPUT_INDEX];
            if (addressInput) {
                addressInput.addEventListener('input', debounce(() => this.checkCompliance(), 500));
            }
        }

        checkCompliance() {
            const inputs = document.querySelectorAll('input[type="text"]');
            const addressInput = inputs[CONFIG.ADDRESS_INPUT_INDEX];

            if (!addressInput) {
                updateTopBar('NEUTRAL', 'Waiting for address...', null);
                return;
            }

            const address = addressInput.value.trim();
            if (!address) {
                updateTopBar('NEUTRAL', 'Enter address to check compliance', null);
                return;
            }

            const addressInfo = parseAddressForInfo(address.toUpperCase());

            if (addressInfo.state && !addressInfo.isValidState) {
                updateTopBar('ERROR', `Invalid state code: ${addressInfo.state}`, null);
                return;
            }

            if (!addressInfo.state) {
                updateTopBar('NEUTRAL', 'No state found in address', null);
                return;
            }

            const complianceStatus = this.complianceEngine.processAddress(address.toUpperCase());

            if (!complianceStatus) {
                updateTopBar('ERROR', 'Failed to process address', null);
                return;
            }

            let timeInfo = null;
            if (addressInfo.isValidState) {
                timeInfo = this.complianceEngine.getTimeString();
            }

            this.complianceEngine.updateUI(complianceStatus, timeInfo);
        }

        destroy() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
            }

            document.getElementById('ct-search-helper-btn')?.remove();
            document.getElementById('ct-nav-settings-btn')?.remove();
            document.getElementById('ct-settings-modal')?.remove();
            document.getElementById('ct-top-controls')?.remove();
            this.isInitialized = false;
        }
    }

    // INITIALIZATION
    function initialize() {
        if (!window.location.hostname.includes('calltools')) {
            console.log('CallTools Pro: Not on CallTools domain, skipping initialization');
            return;
        }

        let app = null;
        let observer = null;
        let timeoutId = null;

        function initApp() {
            if (app && app.isInitialized) return;

            if (!app) {
                app = new CallToolsPro();
            }

            app.init();

            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        }

        observer = new MutationObserver((mutations) => {
            const hasNavBar = document.getElementById('dashboard-nav-tabs');
            const hasUserIcon = document.querySelector('.user-icon');

            if (hasNavBar && hasUserIcon) {
                initApp();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        timeoutId = setTimeout(() => {
            const hasNavBar = document.getElementById('dashboard-nav-tabs');
            const hasUserIcon = document.querySelector('.user-icon');

            if (hasNavBar && hasUserIcon) {
                initApp();
            } else {
                console.log('CallTools Pro: Elements not found after 5 seconds, still observing...');
            }
        }, 5000);

        window.addEventListener('unload', () => {
            if (app) {
                app.destroy();
            }
            if (observer) {
                observer.disconnect();
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
