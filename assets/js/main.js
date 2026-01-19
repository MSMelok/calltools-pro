document.addEventListener('DOMContentLoaded', function() {
    feather.replace();

    updateVersionDisplay();
    renderFeatures();
    renderInstallationSteps();
    renderChangelog();
    renderFooterLinks();
    setupInstallButtons();

    console.log(`CallTools Pro v${APP_CONFIG.version} loaded`);
});

function updateVersionDisplay() {
    const version = APP_CONFIG.version;

    document.querySelectorAll('#version-display, #current-version, #footer-version').forEach(el => {
        el.textContent = version;
    });
}

function renderFeatures() {
    const featuresGrid = document.getElementById('features-grid');
    if (!featuresGrid) return;

    const features = [
        {
            icon: 'shield',
            title: 'Smart Compliance',
            description: 'Real-time state and city compliance alerts with automatic call blocking.'
        },
        {
            icon: 'clock',
            title: 'Timezone Intelligence',
            description: 'Automatic local time detection with exception handling for all US states.'
        },
        {
            icon: 'search',
            title: 'Search Helper',
            description: 'One-click address copying with configurable formats for quick research.'
        },
        {
            icon: 'refresh-cw',
            title: 'Silent Updates',
            description: 'Background updates install automatically without interrupting your work.'
        },
        {
            icon: 'eye-off',
            title: 'Privacy First',
            description: 'No analytics or tracking. All data stays local in your browser.'
        },
        {
            icon: 'settings',
            title: 'Customizable',
            description: 'Adjust settings and preferences to match your specific workflow.'
        }
    ];

    featuresGrid.innerHTML = features.map(feature => `
        <div class="glass-panel p-8 rounded-xl hover:bg-white/5 transition-colors group">
            <div class="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <i data-feather="${feature.icon}" class="w-6 h-6 text-accent group-hover:text-white transition-colors"></i>
            </div>
            <h3 class="text-lg font-semibold text-white mb-3 group-hover:text-accent transition-colors">${feature.title}</h3>
            <p class="text-sm text-secondary leading-relaxed">${feature.description}</p>
        </div>
    `).join('');

    feather.replace();
}

function renderInstallationSteps() {
    const installationSteps = document.getElementById('installation-steps');
    if (!installationSteps) return;

    const steps = [
        {
            number: '1',
            title: 'Install Browser Extension',
            description: 'Add Tampermonkey (Chrome/Edge) or Greasemonkey (Firefox) from your browser extension store.'
        },
        {
            number: '2',
            title: 'Install the Script',
            description: 'Click the install button. Tampermonkey will open with a confirmation prompt.'
        },
        {
            number: '3',
            title: 'Confirm Installation',
            description: 'Click "Install" in the prompt. The script will be added to your user scripts.'
        },
        {
            number: '4',
            title: 'Start Using',
            description: 'Navigate to CallTools. All features activate automatically with no configuration needed.'
        }
    ];

    installationSteps.innerHTML = steps.map(step => `
        <div class="glass-panel p-6 flex items-start hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
            <div class="w-8 h-8 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center text-accent text-sm font-bold mr-5 flex-shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                ${step.number}
            </div>
            <div class="flex-1">
                <h3 class="text-base font-semibold text-white mb-1">${step.title}</h3>
                <p class="text-sm text-secondary">${step.description}</p>
            </div>
        </div>
    `).join('');

    feather.replace();
}

function renderChangelog() {
    const changelogList = document.getElementById('changelog-list');
    if (!changelogList) return;

    changelogList.innerHTML = APP_CONFIG.update.changelog.map(item => `
        <div class="flex items-start text-sm group">
            <div class="w-1.5 h-1.5 bg-accent/50 group-hover:bg-accent rounded-full mt-2 mr-3 flex-shrink-0 transition-colors"></div>
            <p class="text-secondary group-hover:text-gray-300 transition-colors">${item}</p>
        </div>
    `).join('');

    feather.replace();
}

function renderFooterLinks() {
    const footerLinks = document.getElementById('footer-links');
    if (!footerLinks) return;

    const links = [
        { href: APP_CONFIG.contact.github, text: 'GitHub' },
        { href: APP_CONFIG.contact.support, text: 'Support' },
        { href: '#features', text: 'Features' }
    ];

    footerLinks.innerHTML = links.map(link => `
        <a href="${link.href}" class="text-xs text-secondary hover:text-white transition-colors">
            ${link.text}
        </a>
    `).join('');

    feather.replace();
}

function setupInstallButtons() {
    const urls = getScriptURLs();

    document.querySelectorAll('#install-button, #main-install-button').forEach(button => {
        button.href = urls.userScript;

        button.addEventListener('click', function(e) {
            console.log('Installation initiated');
        });
    });
}
