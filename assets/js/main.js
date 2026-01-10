// ============================================
// MAIN APPLICATION LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather Icons
    feather.replace();
    
    // Update version display everywhere
    updateVersionDisplay();
    
    // Render all dynamic content
    renderFeatures();
    renderInstallationSteps();
    renderChangelog();
    renderFooterLinks();
    
    // Setup install buttons
    setupInstallButtons();
    
    console.log(`CallTools Pro v${APP_CONFIG.version} loaded`);
});

// Update version display throughout the page
function updateVersionDisplay() {
    const version = APP_CONFIG.version;
    
    // Update all version displays
    document.querySelectorAll('#version-display, #current-version, #footer-version').forEach(el => {
        el.textContent = version;
    });
}

// Render Features Grid
function renderFeatures() {
    const featuresGrid = document.getElementById('features-grid');
    if (!featuresGrid) return;
    
    const features = [
        {
            icon: 'shield',
            color: 'blue',
            title: 'Smart Compliance',
            description: 'Real-time state & city compliance alerts with automatic call blocking for restricted areas.'
        },
        {
            icon: 'clock',
            color: 'purple',
            title: 'Timezone Intelligence',
            description: 'Automatic local time detection with exception handling. Know your prospect\'s time instantly.'
        },
        {
            icon: 'search',
            color: 'cyan',
            title: 'Search Helper',
            description: 'One-click address copying with configurable name formats. Streamline your research workflow.'
        },
        {
            icon: 'refresh-cw',
            color: 'emerald',
            title: 'Silent Updates',
            description: 'Background updates install automatically. Always have the latest features without interruption.'
        },
        {
            icon: 'eye-off',
            color: 'blue',
            title: 'Privacy First',
            description: 'No analytics, no tracking. All data stays local in your browser for maximum privacy.'
        },
        {
            icon: 'settings',
            color: 'purple',
            title: 'Customizable',
            description: 'Adjust settings to match your workflow. Toggle features and preferences as needed.'
        }
    ];
    
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-400',
        purple: 'bg-purple-500/10 text-purple-400',
        cyan: 'bg-cyan-500/10 text-cyan-400',
        emerald: 'bg-emerald-500/10 text-emerald-400'
    };
    
    featuresGrid.innerHTML = features.map((feature, index) => `
        <div class="glass p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300" style="animation-delay: ${index * 100}ms">
            <div class="w-12 h-12 ${colorClasses[feature.color]} rounded-xl flex items-center justify-center mb-4">
                <i data-feather="${feature.icon}" class="w-6 h-6"></i>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">${feature.title}</h3>
            <p class="text-gray-300">${feature.description}</p>
        </div>
    `).join('');
    
    feather.replace();
}

// Render Installation Steps
function renderInstallationSteps() {
    const installationSteps = document.getElementById('installation-steps');
    if (!installationSteps) return;
    
    const steps = [
        {
            number: '1',
            title: 'Install Browser Extension',
            description: 'Add Tampermonkey (Chrome/Edge) or Greasemonkey (Firefox) from your browser\'s extension store.',
            icon: 'download'
        },
        {
            number: '2',
            title: 'Install the Script',
            description: 'Click the install button. Tampermonkey will open with a confirmation prompt.',
            icon: 'code'
        },
        {
            number: '3',
            title: 'Confirm Installation',
            description: 'Click "Install" in the prompt. The script will be added to your user scripts.',
            icon: 'check-circle'
        },
        {
            number: '4',
            title: 'Start Using',
            description: 'Navigate to CallTools. All features activate automatically. No configuration needed.',
            icon: 'play'
        }
    ];
    
    installationSteps.innerHTML = steps.map((step, index) => `
        <div class="glass p-6 rounded-2xl mb-4 hover:-translate-y-2 transition-transform duration-300">
            <div class="flex items-start">
                <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white font-bold mr-4">
                    ${step.number}
                </div>
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-white mb-2">${step.title}</h3>
                    <p class="text-gray-300">${step.description}</p>
                </div>
                <div class="ml-4 text-primary">
                    <i data-feather="${step.icon}" class="w-6 h-6"></i>
                </div>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

// Render Changelog
function renderChangelog() {
    const changelogList = document.getElementById('changelog-list');
    if (!changelogList) return;
    
    changelogList.innerHTML = APP_CONFIG.update.changelog.map(item => `
        <div class="flex items-start">
            <div class="flex-shrink-0 mt-1">
                <div class="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <i data-feather="check" class="w-3 h-3 text-emerald-400"></i>
                </div>
            </div>
            <div class="ml-4">
                <p class="text-gray-300">${item}</p>
            </div>
        </div>
    `).join('');
    
    feather.replace();
}

// Render Footer Links
function renderFooterLinks() {
    const footerLinks = document.getElementById('footer-links');
    if (!footerLinks) return;
    
    const links = [
        { href: APP_CONFIG.contact.github, text: 'GitHub', icon: 'github' },
        { href: APP_CONFIG.contact.support, text: 'Support', icon: 'help-circle' },
        { href: '#features', text: 'Features', icon: 'grid' },
        { href: '#install', text: 'Install', icon: 'download' }
    ];
    
    footerLinks.innerHTML = links.map(link => `
        <a href="${link.href}" class="text-gray-400 hover:text-white transition-colors flex items-center">
            <i data-feather="${link.icon}" class="w-4 h-4 mr-2"></i>
            ${link.text}
        </a>
    `).join('');
    
    feather.replace();
}

// Setup Install Buttons
function setupInstallButtons() {
    const urls = getScriptURLs();
    
    // Update all install buttons
    document.querySelectorAll('#install-button, #main-install-button').forEach(button => {
        button.href = urls.userScript;
        
        button.addEventListener('click', function(e) {
            console.log('Installation initiated');
            // You could add analytics here
        });
    });
}