//  Shahar Dil Se Surendra bhai mafi mangta hun
// ==================== THEME TOGGLE ====================
const _THEME_KEY = 'ms_theme';

function _getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark';
}

function _initTheme() {
    const saved = localStorage.getItem(_THEME_KEY);
    const theme = saved || _getSystemTheme();
    _applyTheme(theme);
    // Watch for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme:light)').addEventListener('change', e => {
            if (!localStorage.getItem(_THEME_KEY)) {
                _applyTheme(e.matches ? 'light' : 'dark');
            }
        });
    }
}

function _applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = $('themeToggleBtn');
    if (btn) {
        const isDark = theme === 'dark';
        // Update icon
        btn.innerHTML = isDark
            ? '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
            : '<svg class="icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        btn.setAttribute('aria-label', btn.title);
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(_THEME_KEY, next);
    _applyTheme(next);
}

// Initialize on load
_initTheme();
