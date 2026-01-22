// ============================================
// CONFIGURATION FILE - SINGLE SOURCE OF TRUTH
// ============================================

const APP_CONFIG = {
    // Version Management (Update this only)
    version: "5.0.0",
    
    // Release Information
    releaseDate: "February 2026",
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
            "v5.0.0 - Welcome to Atmos",
            "• Rebranding: CallTools Pro is now Atmos Agent.",
            "• New Suite: Added Atmos for Gmail (Lead Filler).",
            "• Unified Design: Enterprise Glass design across all tools.",
            "• Shared Intelligence: Centralized compliance rules."
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
        lastUpdated: "February 2026",
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
        atmosCallTools: `${base}atmos-calltools.user.js`,
        atmosGmail: `${base}atmos-gmail.user.js`,
        metaCallTools: `${base}atmos-calltools.meta.js`,
        metaGmail: `${base}atmos-gmail.meta.js`,
        rules: `${base}assets/data/rules.json`,
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
