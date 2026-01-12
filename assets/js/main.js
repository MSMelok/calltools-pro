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
        <div class="bg-black p-8">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-4">
                <i data-feather="${feature.icon}" class="w-5 h-5 text-black"></i>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">${feature.title}</h3>
            <p class="text-sm text-secondary">${feature.description}</p>
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
        <div class="bg-black p-6 flex items-start">
            <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black text-sm font-semibold mr-4 flex-shrink-0">
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
        <div class="flex items-start text-sm">
            <div class="w-1 h-1 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p class="text-secondary">${item}</p>
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