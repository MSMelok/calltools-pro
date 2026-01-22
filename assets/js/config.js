// ============================================
// CONFIGURATION LOADER (WEB)
// ============================================

const ConfigLoader = {
    async load() {
        try {
            const response = await fetch('assets/data/config.json');
            if (!response.ok) throw new Error('Failed to load config');
            const config = await response.json();
            return this.process(config);
        } catch (e) {
            console.error('Atmos: Config load error', e);
            // Fallback (Minimal)
            return {
                version: "5.0.0",
                githubUsername: "msmelok",
                repoName: "atmos-agent",
                update: { changelog: ["Error loading changelog"] },
                contact: { github: "#" }
            };
        }
    },

    process(config) {
        // Add helper methods/properties dynamically
        config.getGitHubPagesURL = () => `https://${config.githubUsername}.github.io/${config.repoName}/`;

        config.getScriptURLs = () => {
            const base = config.getGitHubPagesURL();
            return {
                atmosCallTools: `${base}atmos-calltools.user.js`,
                atmosGmail: `${base}atmos-gmail.user.js`,
                installPage: base
            };
        };

        return config;
    }
};

// Global accessor for the app
var APP_CONFIG = null;

// Initialize on load
async function initConfig() {
    const config = await ConfigLoader.load();
    // Assign to window to ensure visibility
    window.APP_CONFIG = config;
    APP_CONFIG = config; // Update local reference just in case

    // Dispatch event so main.js knows config is ready
    document.dispatchEvent(new CustomEvent('AtmosConfigReady'));
}

initConfig();
