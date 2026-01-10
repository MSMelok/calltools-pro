// ============================================
// MODAL MANAGER
// ============================================

class ModalManager {
    constructor() {
        this.isOpen = false;
        this.init();
    }
    
    async init() {
        await this.loadModalTemplates();
        this.setupEventListeners();
    }
    
    async loadModalTemplates() {
        try {
            // Load Privacy Policy
            const privacyResponse = await fetch(APP_CONFIG.legal.privacyFile);
            const privacyHTML = await privacyResponse.text();
            
            // Load Terms of Service
            const termsResponse = await fetch(APP_CONFIG.legal.termsFile);
            const termsHTML = await termsResponse.text();
            
            // Store templates
            this.modals = {
                privacy: this.wrapModalContent('Privacy Policy', privacyHTML),
                terms: this.wrapModalContent('Terms of Service', termsHTML)
            };
            
            console.log('Modal templates loaded successfully');
        } catch (error) {
            console.error('Error loading modal templates:', error);
            this.modals = {
                privacy: this.getFallbackContent('privacy'),
                terms: this.getFallbackContent('terms')
            };
        }
    }
    
    wrapModalContent(title, content) {
        return `
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300" id="modal-overlay">
                <div class="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300" id="modal-content">
                    <div class="flex items-center justify-between p-6 border-b border-gray-800">
                        <h2 class="text-2xl font-bold text-white">${title}</h2>
                        <button class="p-2 hover:bg-gray-800 rounded-lg transition-colors" id="modal-close">
                            <i data-feather="x" class="w-6 h-6 text-gray-400"></i>
                        </button>
                    </div>
                    <div class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        ${content}
                    </div>
                    <div class="p-6 border-t border-gray-800">
                        <button class="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors" id="modal-close-btn">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getFallbackContent(type) {
        const title = type === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
        return `
            <div class="p-6">
                <h3 class="text-xl font-bold text-white mb-4">${title}</h3>
                <p class="text-gray-300">Content could not be loaded. Please try again later.</p>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Delegate modal opening to document
        document.addEventListener('click', (e) => {
            const modalTrigger = e.target.closest('[data-modal]');
            if (modalTrigger) {
                e.preventDefault();
                const modalType = modalTrigger.getAttribute('data-modal');
                this.openModal(modalType);
            }
            
            // Close modal
            if (e.target.id === 'modal-overlay' || 
                e.target.id === 'modal-close-btn' ||
                e.target.closest('#modal-close')) {
                this.closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });
    }
    
    openModal(modalType) {
        if (this.isOpen) return;
        
        const modalHTML = this.modals[modalType];
        if (!modalHTML) {
            console.error(`Modal type "${modalType}" not found`);
            return;
        }
        
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = modalHTML;
        
        // Show modal
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.style.opacity = '1';
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
            
            // Re-initialize Feather Icons
            feather.replace();
        }
        
        console.log(`Opened ${modalType} modal`);
    }
    
    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                document.getElementById('modal-container').innerHTML = '';
                this.isOpen = false;
                document.body.style.overflow = '';
            }, 300);
        }
    }
}

// Initialize Modal Manager
document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();
});