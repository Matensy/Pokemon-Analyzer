/**
 * PokeStatsBR - Main JavaScript
 */

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
            menuBtn.classList.remove('active');
        }
    });
});

// Utility functions
const utils = {
    // Format large numbers with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Debounce function for search input
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get Pokemon sprite URL from Showdown
    getShowdownSprite(pokemonName) {
        const name = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `https://play.pokemonshowdown.com/sprites/gen5/${name}.png`;
    },

    // Get Pokemon sprite URL (fallback)
    getPokemonSprite(pokemonName) {
        const name = pokemonName.toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-|-$/g, '');
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${name}.png`;
    },

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (e) {
                document.body.removeChild(textarea);
                return false;
            }
        }
    }
};

// Type colors for Tera Types
const typeColors = {
    'Normal': '#A8A878',
    'Fire': '#F08030',
    'Water': '#6890F0',
    'Electric': '#F8D030',
    'Grass': '#78C850',
    'Ice': '#98D8D8',
    'Fighting': '#C03028',
    'Poison': '#A040A0',
    'Ground': '#E0C068',
    'Flying': '#A890F0',
    'Psychic': '#F85888',
    'Bug': '#A8B820',
    'Rock': '#B8A038',
    'Ghost': '#705898',
    'Dragon': '#7038F8',
    'Dark': '#705848',
    'Steel': '#B8B8D0',
    'Fairy': '#EE99AC',
    'Stellar': '#44AACC'
};

// API wrapper
const api = {
    baseUrl: '/api',

    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getMonths() {
        return this.get('/months');
    },

    async getStats(formatCode, rating, month = null) {
        let url = `/stats/${formatCode}?rating=${rating}`;
        if (month) {
            url += `&month=${month}`;
        }
        return this.get(url);
    },

    async getPokemon(formatCode, pokemonName, rating, month = null) {
        let url = `/pokemon/${formatCode}/${encodeURIComponent(pokemonName)}?rating=${rating}`;
        if (month) {
            url += `&month=${month}`;
        }
        return this.get(url);
    }
};

// Toast notifications
const toast = {
    show(message, type = 'info', duration = 3000) {
        const container = this.getContainer();
        const toastEl = document.createElement('div');
        toastEl.className = `toast toast-${type}`;
        toastEl.textContent = message;

        container.appendChild(toastEl);

        // Trigger animation
        setTimeout(() => toastEl.classList.add('show'), 10);

        // Remove after duration
        setTimeout(() => {
            toastEl.classList.remove('show');
            setTimeout(() => toastEl.remove(), 300);
        }, duration);
    },

    getContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    info(message) {
        this.show(message, 'info');
    }
};

// Add toast styles dynamically
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .toast {
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .toast.show {
        opacity: 1;
        transform: translateX(0);
    }

    .toast-success {
        background: #009c3b;
    }

    .toast-error {
        background: #dc3545;
    }

    .toast-info {
        background: #0d6efd;
    }
`;
document.head.appendChild(toastStyles);

// Export for global use
window.PokeStats = {
    utils,
    api,
    toast,
    typeColors
};
