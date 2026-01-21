// ============================================
// CONFIGURATION FILE - SINGLE SOURCE OF TRUTH
// ============================================

const APP_CONFIG = {
    // Version Management (Update this only)
    version: "4.6.2",
    
    // Release Information
    releaseDate: "January 2026",
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
            "v4.6.2 - Enterprise Experience",
            "• New Look: A modern, cleaner design for better focus.",
            "• Improved Settings: Your preferences now stay saved securely, even if you clear your browser cache.",
            "• Customization: You can now hide distracting buttons (like SMS or Email) and cards (like Zillow).",
            "• Better Visibility: Critical badges are now easier to read in Light Mode.",
            "• Fixes: The settings menu is now easier to access and works reliably."
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
        lastUpdated: "January 2026",
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
