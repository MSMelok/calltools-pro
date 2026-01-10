// ============================================
// CONFIGURATION FILE - SINGLE SOURCE OF TRUTH
// ============================================

const APP_CONFIG = {
    // Version Management (Update this only)
    version: "4.5.0",
    
    // Release Information
    releaseDate: "January 2024",
    releaseType: "major", // major | minor | patch
    
    // URLs (Update these for your GitHub)
    githubUsername: "msmelok", // ← Change this
    repoName: "calltools-pro",
    
    // Feature Flags
    features: {
        autoUpdate: true,
        privacyMode: true,
        complianceDetection: true,
        timezoneDetection: true
    },
    
    // Update Information
    update: {
        enabled: true,
        checkInterval: 24, // hours
        changelog: [
    "v4.5.0 - Major Stability Update",
    " COMPLETELY REMOVED all analytics tracking for 100% privacy",
    "FIXED critical 'Cannot read properties of undefined' crash bug",
    "ADDED invalid state detection (shows error for MQ, FI, etc.)",
    "IMPROVED time badge visibility (hides when no address loaded)",
    "ADDED seconds display to time badge for precise timing",
    "FIXED settings cog visibility and functionality issues",
    "IMPROVED address parsing with better error handling",
    "UPDATED compliance engine to handle edge cases",
    "ENHANCED toast notifications with better styling",
    "FIXED localStorage settings saving/loading",
    "IMPROVED UI with cleaner badge display logic",
    "ADDED better fallback for settings button placement",
    "FIXED domain matching with proper wildcards (*.calltools.io)"
]
    },
    
    // Contact Information
    contact: {
        github: "https://github.com/msmelok/calltools-pro",
        support: "https://github.com/msmelok/calltools-pro/issues",
        email: "muhammadmeluk@gmail.com"
    },
    
    // Legal
    legal: {
        lastUpdated: "December 2025",
        termsFile: "assets/legal/terms.html",
        privacyFile: "assets/legal/privacy.html"
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get GitHub Pages URL
function getGitHubPagesURL() {
    return `https://${APP_CONFIG.githubUsername}.github.io/${APP_CONFIG.repoName}/`;
}

// Get Script URLs
function getScriptURLs() {
    const base = getGitHubPagesURL();
    return {
        userScript: `${base}calltools-pro.user.js`,
        metaFile: `${base}calltools-pro.meta.js`,
        installPage: base
    };
}

// Get Version Display
function getVersionDisplay() {
    return `v${APP_CONFIG.version}`;
}

// Get Update Description
function getUpdateDescription() {
    const type = APP_CONFIG.releaseType;
    const descriptions = {
        major: "Major update with new features and improvements",
        minor: "Feature update with enhancements",
        patch: "Bug fixes and improvements"
    };
    return descriptions[type] || "Update with improvements";
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APP_CONFIG, getGitHubPagesURL, getScriptURLs, getVersionDisplay, getUpdateDescription };
}