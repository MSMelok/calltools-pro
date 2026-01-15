// ==UserScript==
// @name         CallTools Pro
// @namespace    https://west-2.calltools.io/agent
// @version      4.6.0
// @description  Premium enhancement suite for CallTools with dark theme, compliance alerts, and productivity tools
// @author       MuhammadMelk
// @match        https://*.calltools.io/*
// @match        https://*.calltools.com/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @require      https://unpkg.com/feather-icons@4.29.0/dist/feather.min.js
// @updateURL    https://msmelok.github.io/calltools-pro/calltools-pro.meta.js
// @downloadURL  https://msmelok.github.io/calltools-pro/calltools-pro.user.js
// ==/UserScript==

(function() {
'use strict';

    // Configuration
    const CONFIG = {
        // Input indices (zero-based)
        FIRST_NAME_INDEX: 2,
        LAST_NAME_INDEX: 3,
        ADDRESS_INPUT_INDEX: 4,
        BUSINESS_INPUT_INDEX: 5,

        // Update tracking
        VERSION: "4.6.0",
        GITHUB_URL: "https://YOUR_USERNAME.github.io/calltools-pro/"
    };

    // Premium color palette (matching website)
    const COLORS = {
        primary: {
            DEFAULT: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5'
        },
        accent: {
            blue: '#3b82f6',
            purple: '#8b5cf6',
            cyan: '#06b6d4',
            emerald: '#10b981',
            amber: '#f59e0b',
            rose: '#f43f5e'
        },
        background: {
            DEFAULT: '#0a0a0f',
            light: '#13131f',
            card: '#1e1e30',
            hover: '#2a2a40',
            modal: 'rgba(19, 19, 31, 0.98)'
        },
        text: {
            primary: '#ffffff',
            secondary: '#a0a0b0',
            muted: '#707080'
        }
    };

    // State timezones mapping (unchanged)
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

    // Compliance rules (unchanged)
    const RULES = {
        // BLOCKED STATES
        "AL": { type: "BLOCK", msg: "AUTO REJECT: Alabama" },
        "IA": { type: "BLOCK", msg: "AUTO REJECT: Iowa" },
        "NY": { type: "BLOCK", msg: "AUTO REJECT: New York" },
        "ME": { type: "BLOCK", msg: "AUTO REJECT: Maine" },
        "VT": { type: "BLOCK", msg: "AUTO REJECT: Vermont" },
        "PR": { type: "BLOCK", msg: "AUTO REJECT: Puerto Rico" },

        // RESTRICTED STATES
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

        // SAFE STATES
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

        // CITY SPECIFIC BLOCKS
        "BATTLE CREEK": { type: "BLOCK", msg: "AUTO REJECT: Battle Creek, MI" },
        "GROSSE POINTE FARMS": { type: "BLOCK", msg: "AUTO REJECT: Grosse Pointe Farms, MI" },
        "SPOKANE": { type: "BLOCK", msg: "AUTO REJECT: Spokane, WA" },
        "STILLWATER": { type: "BLOCK", msg: "AUTO REJECT: Stillwater, MN" },
        "ABILENE":      { type: "BLOCK", msg: "AUTO REJECT: Abilene, TX" },
        "GARLAND":      { type: "BLOCK", msg: "AUTO REJECT: Garland, TX" },
        "MIDLAND":      { type: "BLOCK", msg: "AUTO REJECT: Midland, TX" },
        "WICHITA FALLS":{ type: "BLOCK", msg: "AUTO REJECT: Wichita Falls, TX" }
    };

    // ============================================
    // PREMIUM STYLES (Enhanced for Website)
    // ============================================

    const STYLES = `
        /* Reset & Base */
        .ct-hidden { display: none !important; }
        .ct-glass {
            background: rgba(30, 30, 48, 0.7) !important;
            backdrop-filter: blur(10px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
        }

        /* Top Controls Bar - Premium Design */
        #ct-top-controls {
            display: inline-flex !important;
            align-items: center !important;
            margin-left: 20px !important;
            gap: 12px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
        }

        /* Premium Badge Design */
        .ct-badge {
            display: inline-flex !important;
            align-items: center !important;
            height: 36px !important;
            padding: 0 16px !important;
            border-radius: 8px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            color: white !important;
            backdrop-filter: blur(12px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
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
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35) !important;
        }

        /* Badge Colors */
        .ct-safe {
            background: linear-gradient(135deg, ${COLORS.accent.emerald}, #059669) !important;
            border-color: rgba(16, 185, 129, 0.3) !important;
        }

        .ct-warn {
            background: linear-gradient(135deg, ${COLORS.accent.amber}, #d97706) !important;
            border-color: rgba(245, 158, 11, 0.3) !important;
        }

        .ct-block {
            background: linear-gradient(135deg, ${COLORS.accent.rose}, #dc2626) !important;
            border-color: rgba(244, 63, 94, 0.3) !important;
        }

        .ct-time {
            background: linear-gradient(135deg, ${COLORS.primary.DEFAULT}, ${COLORS.primary.dark}) !important;
            border-color: rgba(99, 102, 241, 0.3) !important;
        }

        .ct-neutral {
            background: linear-gradient(135deg, ${COLORS.text.muted}, #52525b) !important;
            border-color: rgba(112, 112, 128, 0.3) !important;
            opacity: 0.9 !important;
        }

        /* Premium Search Button */
        #ct-search-helper-btn {
            position: fixed !important;
            bottom: 30px !important;
            left: 30px !important;
            z-index: 99999 !important;
            padding: 15px 17px !important;
            background: linear-gradient(135deg, ${COLORS.primary.DEFAULT}, ${COLORS.primary.dark}) !important;
            color: white !important;
            border: none !important;
            border-radius: 16px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            cursor: pointer !important;
            letter-spacing: -0.01em !important;
            overflow: hidden !important;
        }


        /* FIXED SETTINGS BUTTON - WON'T SCROLL */
        #ct-header-settings-btn {
            position: fixed !important;
            top: 62px !important;
            right: 13px !important;
            z-index: 100001 !important;
            background: rgba(19, 19, 31, 0.8) !important;
            backdrop-filter: blur(10px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 12px !important;
            padding: 10px !important;
            cursor: pointer !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            color: rgba(255, 255, 255, 0.9) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
        }


        /* Premium Settings Modal */
        #ct-settings-modal {
            position: fixed !important;
            top: 65px !important;
            right: 20px !important;
            width: 340px !important;
            z-index: 100002 !important;
            background: ${COLORS.background.modal} !important;
            backdrop-filter: blur(30px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(30px) saturate(200%) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 20px !important;
            padding: 24px !important;
            display: none;
            flex-direction: column !important;
            gap: 18px !important;
            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.6) !important;
            color: ${COLORS.text.primary} !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
            font-size: 14px !important;
            animation: ct-modal-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        #ct-settings-modal.show {
            display: flex !important;
        }

        @keyframes ct-modal-appear {
            from {
                opacity: 0;
                transform: translateY(-15px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .ct-modal-header {
            font-weight: 700 !important;
            font-size: 18px !important;
            margin-bottom: 8px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
            padding-bottom: 16px !important;
            color: ${COLORS.text.primary} !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
        }

        .ct-setting-row {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 12px 0 !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .ct-setting-row:last-child {
            border-bottom: none !important;
        }

        /* Premium Toggle Switch */
        .ct-switch {
            position: relative !important;
            display: inline-block !important;
            width: 50px !important;
            height: 28px !important;
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
            background-color: ${COLORS.background.hover} !important;
            transition: .4s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
            border-radius: 34px !important;
            border: 2px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ct-slider:before {
            position: absolute !important;
            content: "" !important;
            height: 22px !important;
            width: 22px !important;
            left: 2px !important;
            bottom: 1px !important;
            background: white !important;
            transition: .4s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
            border-radius: 50% !important;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
        }

        input:checked + .ct-slider {
            background: linear-gradient(135deg, ${COLORS.accent.emerald}, #059669) !important;
            border-color: rgba(16, 185, 129, 0.4) !important;
        }

        input:checked + .ct-slider:before {
            transform: translateX(22px) !important;
        }

       /* MINIMAL TOAST SYSTEM */
.ct-toast-container {
    position: fixed !important;
    top: 100px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    z-index: 100003 !important;
    pointer-events: none !important;
}

.ct-toast {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    background: ${COLORS.background.card} !important;
    color: ${COLORS.text.primary} !important;
    padding: 14px 20px !important;
    border-radius: 12px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    opacity: 0 !important;
    transform: translateY(-20px) !important;
    transition: all 0.3s ease !important;
    min-width: 250px !important;
    max-width: 400px !important;
    overflow: hidden !important;
}

.ct-toast.show {
    opacity: 1 !important;
    transform: translateY(0) !important;
    pointer-events: auto !important;
}

.ct-toast.success {
    background: ${COLORS.background.card} !important;
    border: 4px solid ${COLORS.accent.emerald} !important;
}

.ct-toast.error {
    background: ${COLORS.background.card} !important;
    border: 4px solid ${COLORS.accent.rose} !important;
}

.ct-toast.info {
    background: ${COLORS.background.card} !important;
    border: 4px solid ${COLORS.primary.DEFAULT} !important;
}

.ct-toast.warning {
    background: ${COLORS.background.card} !important;
    border: 4px solid ${COLORS.accent.amber} !important;
}

.ct-toast-icon {
    flex-shrink: 0 !important;
    width: 20px !important;
    height: 20px !important;
}

.ct-toast-content {
    flex: 1 !important;
    text-align: center !important;
}


        @keyframes toast-shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        /* Premium Input Enhancement */
        .ct-enhanced-input {
            border: 2px solid rgba(99, 102, 241, 0.3) !important;
            border-radius: 12px !important;
            background: ${COLORS.background.light} !important;
            color: ${COLORS.text.primary} !important;
            padding: 12px 16px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
            font-size: 14px !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .ct-enhanced-input:focus {
            border-color: ${COLORS.primary.DEFAULT} !important;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
            outline: none !important;
            transform: translateY(-1px) !important;
        }

        /* Version Badge */
        .ct-version-badge {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            background: rgb(19 19 31 / 7%) !important;
            color: ${COLORS.text.secondary} !important;
            padding: 8px 16px !important;
            border-radius: 20px !important;
            font-size: 11px !important;
            font-family: 'JetBrains Mono', monospace !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            z-index: 99998 !important;
            backdrop-filter: blur(10px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        }

        /* Pulse Animation */
        @keyframes ct-pulse-glow {
            0%, 100% {
                box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
            }
            50% {
                box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
            }
        }

        .ct-pulse {
            animation: ct-pulse-glow 2s ease-in-out infinite !important;
        }

        /* Gradient Text */
        .ct-gradient-text {
            background: linear-gradient(135deg, ${COLORS.primary.DEFAULT}, ${COLORS.accent.purple}) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            font-weight: 700 !important;
        }

        /* Premium Scrollbar */
        ::-webkit-scrollbar {
            width: 10px !important;
        }

        ::-webkit-scrollbar-track {
            background: rgba(30, 30, 48, 0.5) !important;
            border-radius: 10px !important;
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, ${COLORS.primary.DEFAULT}, ${COLORS.primary.dark}) !important;
            border-radius: 10px !important;
            border: 2px solid rgba(19, 19, 31, 0.5) !important;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, ${COLORS.primary.light}, ${COLORS.primary.DEFAULT}) !important;
        }

        /* Loading Animation */
        @keyframes ct-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .ct-spinner {
            display: inline-block !important;
            width: 20px !important;
            height: 20px !important;
            border: 3px solid rgba(255, 255, 255, 0.1) !important;
            border-top: 3px solid ${COLORS.primary.DEFAULT} !important;
            border-radius: 50% !important;
            animation: ct-spin 1s linear infinite !important;
        }
    `;

    // Inject styles
    GM_addStyle(STYLES);

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
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
    // Remove existing toast if any
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
        success: COLORS.accent.emerald,
        error: COLORS.accent.rose,
        warning: COLORS.accent.amber,
        info: COLORS.primary.DEFAULT
    };

    // SIMPLIFIED HTML WITHOUT CLOSE BUTTON:
    toast.innerHTML = `
        <div class="ct-toast-icon">
            <i data-feather="${icons[type] || 'info'}" style="color:${iconColor[type] || COLORS.primary.DEFAULT}"></i>
        </div>
        <div class="ct-toast-content">${message}</div>
    `;

    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    feather.replace();

    // Auto-remove after duration
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
            return hour >= 9 && hour < 17; // 9 AM to 5 PM
        } catch (e) {
            return true; // Default to true if timezone detection fails
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

        // Extract state (2-letter code)
        const stateMatch = address.match(/\b([A-Z]{2})\b\s+\d{5}/);
        if (stateMatch) {
            info.state = stateMatch[1];
            // Check if state is valid (exists in STATE_TIMEZONES)
            info.isValidState = !!STATE_TIMEZONES[info.state];
        }

        // Extract city (before state, after numbers if any)
        if (info.state) {
            const cityMatch = address.match(/([A-Z\s]+)\s+[A-Z]{2}\s+\d{5}/);
            if (cityMatch) info.city = cityMatch[1].trim();
        }

        // Extract ZIP
        const zipMatch = address.match(/\b\d{5}\b/);
        if (zipMatch) info.zip = zipMatch[0];

        // Determine timezone only if state is valid
        if (info.isValidState && STATE_TIMEZONES[info.state]) {
            info.timezone = STATE_TIMEZONES[info.state];

            // Check for exceptions
            for (const [key, exceptionTZ] of Object.entries(TZ_EXCEPTIONS)) {
                const [exceptionState, exceptionCity] = key.split('|');
                if (info.state === exceptionState && address.includes(exceptionCity)) {
                    info.timezone = exceptionTZ;
                    break;
                }
            }

            // Check business hours
            info.isBusinessHours = isBusinessHours(info.timezone);
        }

        return info;
    }

    function formatPhoneNumber(phone) {
        // Clean phone number
        const cleaned = phone.replace(/\D/g, '');

        // Format based on length
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11 && cleaned[0] === '1') {
            return `+1 (${cleaned.slice(1,4)}) ${cleaned.slice(4,7)}-${cleaned.slice(7)}`;
        }

        return phone; // Return original if format doesn't match
    }

    function copyToClipboard(text) {
        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(text);
            return true;
        }

        // Fallback to navigator.clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                return true;
            }).catch(() => {
                // Last resort: old school method
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

    function getLocalStorage(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    function setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }

    // ============================================
    // COMPLIANCE ENGINE
    // ============================================
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

            // Reset previous state
            this.currentState = null;
            this.currentCity = null;
            this.currentRule = null;
            this.addressInfo = addressInfo; // Store address info for later use

            // If state exists but is invalid (like "MQ", "FI")
            if (addressInfo.state && !addressInfo.isValidState) {
                // Special rule for invalid state
                this.currentRule = {
                    type: "ERROR",
                    msg: `Invalid state code: ${addressInfo.state}`
                };
                return this.getComplianceStatus();
            }

            // Check for state-level rules
            if (addressInfo.state && RULES[addressInfo.state]) {
                this.currentState = addressInfo.state;
                this.currentRule = RULES[addressInfo.state];
            }

            // Check for city-level rules (overrides state if more specific)
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
                // If we have address info but no rule, check if state is valid
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
            // Handle undefined/null status
            if (!complianceStatus) {
                updateTopBar('NEUTRAL', 'No compliance data', null);
                return;
            }

            // Update top bar - pass timeInfo regardless of settings
            updateTopBar(complianceStatus.type, complianceStatus.message, timeInfo);

            // Handle call button
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

            // Early return if no address at all
            if (!inputAddr || inputAddr.length < 5) { // At least need something like "NY 12345"
                return null;
            }

            const addressInfo = parseAddressForInfo(inputAddr);

            // Return null if no address, no state, or invalid state
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

                // Validate that we actually got a time string
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

    // ============================================
    // SEARCH HELPER
    // ============================================
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
                padding: 12px 20px;
                background: linear-gradient(135deg, #6366f1, #4f46e5);
                color: white;
                border: none;
                border-radius: 30px;
                font-family: -apple-system, sans-serif;
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

            // Add hover effects
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
            const useSplitName = getLocalStorage('ct_use_split_name', false);
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

    // ============================================
    // SETTINGS MANAGER (FIXED POSITION)
    // ============================================
    class SettingsManager {
        constructor() {
            this.settings = {
                useSplitName: getLocalStorage('ct_use_split_name', false)
            };
            this.modal = null;
            this.settingsBtn = null;
            this.initAttempts = 0;
        }

        init() {
            console.log('SettingsManager: Initializing...');
            this.createSettingsModal();
            this.createFixedSettingsButton();
            this.setupEventListeners();

            // Debug: Log current settings
            console.log('Loaded settings:', this.settings);
        }

        createFixedSettingsButton() {
            if (this.settingsBtn) return;

            this.settingsBtn = document.createElement('button');
            this.settingsBtn.id = 'ct-header-settings-btn';
            this.settingsBtn.title = 'CT Pro Settings';
            this.settingsBtn.innerHTML = `<i data-feather="settings" style="width:20px;height:20px;"></i>`;
            this.settingsBtn.style.cssText = `
                position: fixed !important;
                top: 62px !important;
                right: 13px !important;
                z-index: 100001 !important;
                background: rgb(19 19 31 / 58%) !important;
                backdrop-filter: blur(10px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 12px !important;
                padding: 10px !important;
                cursor: pointer !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                color: rgba(255, 255, 255, 0.9) !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
            `;

            document.body.appendChild(this.settingsBtn);
            feather.replace();

            console.log('Fixed settings button created');
        }

        createSettingsModal() {
            if (this.modal || document.getElementById('ct-settings-modal')) return;

            this.modal = document.createElement('div');
            this.modal.id = 'ct-settings-modal';
            this.modal.innerHTML = `
                <div class="ct-modal-header">
                    <i data-feather="settings" style="width:18px;height:18px;"></i>
                    CallTools Pro Settings
                </div>
                <div class="ct-setting-row">
                    <span style="display:flex; align-items:center; gap:8px;">
                        <i data-feather="user" style="width:16px;height:16px;color:${COLORS.text.secondary}"></i>
                        Use First/Last Name
                    </span>
                    <label class="ct-switch">
                        <input type="checkbox" id="ct-opt-split-name" ${this.settings.useSplitName ? 'checked' : ''}>
                        <span class="ct-slider"></span>
                    </label>
                </div>
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
                        <span style="font-size:12px; color:${COLORS.text.muted};">About</span>
                        <span style="font-size:12px; color:${COLORS.primary.light};">v${CONFIG.VERSION}</span>
                    </div>
                    <div style="font-size:11px; color:${COLORS.text.muted}; text-align:center;">
                        Premium enhancement suite for CallTools
                    </div>
                </div>
            `;

            document.body.appendChild(this.modal);
            feather.replace();

            console.log('Settings modal created');
        }

        setupEventListeners() {
            if (!this.settingsBtn || !this.modal) return;

            // Button click to toggle modal
            this.settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();

                // Toggle modal visibility
                const isShowing = this.modal.classList.contains('show');
                this.modal.classList.toggle('show');

                if (!isShowing) {
                    // Position modal below the button
                    const rect = this.settingsBtn.getBoundingClientRect();
                    this.modal.style.top = `${rect.bottom + 8}px`;
                    this.modal.style.right = `${window.innerWidth - rect.right}px`;
                }
            });

            // Close modal when clicking outside
            document.addEventListener('click', (e) => {
                if (this.modal.classList.contains('show') &&
                    !this.modal.contains(e.target) &&
                    !this.settingsBtn.contains(e.target)) {
                    this.modal.classList.remove('show');
                }
            });

            // Close modal on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                    this.modal.classList.remove('show');
                }
            });

            // Event delegation for checkbox changes
            document.addEventListener('change', (e) => {
                if (!this.modal.contains(e.target)) return;

                const target = e.target;

                if (target.id === 'ct-opt-split-name') {
                    this.settings.useSplitName = target.checked;
                    setLocalStorage('ct_use_split_name', target.checked);
                    showPremiumToast(`First/Last Name: ${target.checked ? 'ON' : 'OFF'}`, 'success');
                    console.log('Split name setting saved:', target.checked);
                }
            });
        }
    }

    // ============================================
    // TOP BAR CONTROLLER
    // ============================================
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

        // Update compliance badge
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

        // Update time badge
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

    // ============================================
    // MAIN APPLICATION
    // ============================================
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
                // Initialize components
                this.searchHelper.init();
                this.settingsManager.init();

                // Start compliance checking
                this.startComplianceCheck();

                // Add version badge
                this.addVersionBadge();

                this.isInitialized = true;
                console.log('CallTools Pro v4.6.0 initialized successfully');
                showPremiumToast('CallTools Pro v4.6.0 loaded', 'info', 2000);

            } catch (error) {
                console.error('Failed to initialize CallTools Pro:', error);
                showPremiumToast('Failed to initialize: ' + error.message, 'error');
            }
        }

        addVersionBadge() {
            if (document.querySelector('.ct-version-badge')) return;

            const badge = document.createElement('div');
            badge.className = 'ct-version-badge';
            badge.textContent = `CT Pro v${CONFIG.VERSION}`;
            document.body.appendChild(badge);
        }

        startComplianceCheck() {
            // Initial check
            this.checkCompliance();

            // Set up interval for continuous checking
            this.checkInterval = setInterval(() => this.checkCompliance(), 1000);

            // Also check on input changes
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

            // Parse address to check if it's valid
            const addressInfo = parseAddressForInfo(address.toUpperCase());

            // Check for invalid state first
            if (addressInfo.state && !addressInfo.isValidState) {
                updateTopBar('ERROR', `Invalid state code: ${addressInfo.state}`, null);
                return;
            }

            // Check if we have a state at all
            if (!addressInfo.state) {
                updateTopBar('NEUTRAL', 'No state found in address', null);
                return;
            }

            // Process address through compliance engine
            const complianceStatus = this.complianceEngine.processAddress(address.toUpperCase());

            if (!complianceStatus) {
                updateTopBar('ERROR', 'Failed to process address', null);
                return;
            }

            // Get time info - only if address is valid
            let timeInfo = null;
            if (addressInfo.isValidState) {
                timeInfo = this.complianceEngine.getTimeString();
            }

            // Update UI with compliance and time info
            this.complianceEngine.updateUI(complianceStatus, timeInfo);
        }

        destroy() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
            }

            // Remove all injected elements
            document.getElementById('ct-search-helper-btn')?.remove();
            document.getElementById('ct-header-settings-btn')?.remove();
            document.getElementById('ct-settings-modal')?.remove();
            document.getElementById('ct-top-controls')?.remove();
            document.querySelector('.ct-version-badge')?.remove();

            this.isInitialized = false;
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function initialize() {
        // Check if we're on CallTools
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

            // Clean up observer and timeout
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        }

        // Use MutationObserver to wait for dynamic content
        observer = new MutationObserver((mutations) => {
            const hasNavBar = document.getElementById('dashboard-nav-tabs');
            const hasUserIcon = document.querySelector('.user-icon');

            if (hasNavBar && hasUserIcon) {
                initApp();
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also try immediate initialization after 5 seconds
        timeoutId = setTimeout(() => {
            const hasNavBar = document.getElementById('dashboard-nav-tabs');
            const hasUserIcon = document.querySelector('.user-icon');

            if (hasNavBar && hasUserIcon) {
                initApp();
            } else {
                console.log('CallTools Pro: Elements not found after 5 seconds, still observing...');
            }
        }, 5000);

        // Clean up on page unload
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

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();