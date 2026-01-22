document.addEventListener('DOMContentLoaded', function() {
    feather.replace();

    // Check if config is already loaded, otherwise wait for event
    if (window.APP_CONFIG) {
        initApp();
    } else {
        document.addEventListener('AtmosConfigReady', initApp);
    }
});

function initApp() {
    console.log(`Atmos Agent v${APP_CONFIG.version} loaded`);

    updateVersionDisplay();
    renderFeatures();
    renderChangelog();
    renderFooterLinks();
    setupInstallButtons();

    // Re-run feather replace for dynamically added content
    feather.replace();
}

function updateVersionDisplay() {
    if (!APP_CONFIG) return;
    const version = APP_CONFIG.version;

    document.querySelectorAll('#version-display, #current-version, #footer-version').forEach(el => {
        el.textContent = version;
    });
}

function renderFeatures() {
    const featuresGrid = document.getElementById('features-grid');
    if (!featuresGrid) return;

    // Use features from config if available, otherwise fallback
    // For now we hardcode the display logic but we could pull from config if we wanted dynamic features
    // The current index.html layout might rely on specific HTML structure.

    // Note: The new index.html already has some hardcoded cards.
    // If 'features-grid' exists (it does in the new HTML?? No, the new HTML has 'features' section with hardcoded cards).
    // Let's check the new index.html content I wrote.

    /*
       In the new index.html:
       <section id="features" class="container mx-auto px-6 py-20">
            <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <!-- Cards are Hardcoded -->
            </div>
       </section>

       There is NO element with id 'features-grid' in the NEW index.html I just wrote.
       So this function might be redundant for the main features, OR I should add the ID back if I want them dynamic.
       The new HTML has hardcoded content for "Atmos for CallTools" and "Atmos for Gmail".

       However, the previous step's `main.js` tried to render generic features into `features-grid`.
       The new design is specific to the two products.
       I will leave this function empty or remove it if the HTML handles it.
       The new HTML is better hardcoded for the specific marketing layout.
    */
}

function renderChangelog() {
    const changelogList = document.getElementById('changelog-list');
    if (!changelogList || !APP_CONFIG.update.changelog) return;

    changelogList.innerHTML = APP_CONFIG.update.changelog.map(item => `
        <div class="flex items-start text-sm group">
            <div class="w-1.5 h-1.5 bg-cyan-400/50 group-hover:bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0 transition-colors"></div>
            <p class="text-slate-400 group-hover:text-slate-200 transition-colors">${item}</p>
        </div>
    `).join('');
}

function renderFooterLinks() {
    // Footer in new HTML is hardcoded mostly, but let's see if we can enhance it
    // The new HTML has:
    /*
        <div class="flex justify-center gap-8 mb-8 text-sm text-slate-400">
            <a href="#" data-modal="terms" ...>Terms</a>
            <a href="#" data-modal="privacy" ...>Privacy</a>
            <a href="https://github.com..." ...>GitHub</a>
        </div>
    */
   // So we might not need this unless we want to dynamically update URLs from config
}

function setupInstallButtons() {
    if (!APP_CONFIG || !APP_CONFIG.getScriptURLs) return;

    const urls = APP_CONFIG.getScriptURLs();

    // The new index.html uses specific IDs or hrefs
    // <a href="atmos-calltools.user.js" ...>

    // We can update them to ensure they point to the correct absolute URL if needed,
    // or just rely on relative relative paths which work for GH pages.
    // But let's update them just in case.

    // CallTools
    document.querySelectorAll('a[href$="atmos-calltools.user.js"]').forEach(btn => {
        btn.href = urls.atmosCallTools;
    });

    // Gmail
    document.querySelectorAll('a[href$="atmos-gmail.user.js"]').forEach(btn => {
        btn.href = urls.atmosGmail;
    });
}
