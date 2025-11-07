// Theme toggle (light / dark) - lightweight implementation
(function(){
    const KEY = 'themePreference';

    function applyTheme(theme) {
        if (theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
        else document.documentElement.removeAttribute('data-theme');
    }

    function toggleTheme() {
        const current = localStorage.getItem(KEY) || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(KEY, next);
        applyTheme(next);
    }

    function createToggleButton() {
        if (document.getElementById('themeToggle')) return;
        const btn = document.createElement('button');
        btn.id = 'themeToggle';
        btn.title = 'Toggle dark mode';
        btn.className = 'music-btn';
        btn.style.right = '110px';
        btn.innerHTML = '🌓';
        btn.addEventListener('click', toggleTheme);
        document.body.appendChild(btn);
    }

    // Small CSS overrides for dark mode
    const css = `
    [data-theme="dark"] body { background: linear-gradient(180deg,#0f172a 0%, #0b1220 100%) !important; color: #e6eef8 !important; }
    [data-theme="dark"] .title-font { color: #f7f7fb !important; }
    [data-theme="dark"] .glass-card, [data-theme="dark"] .timeline-content { background: rgba(10,12,20,0.6) !important; color: #e6eef8 !important; }
    [data-theme="dark"] .memory-caption, [data-theme="dark"] .memory-title { color: #e6eef8 !important; }
    `;

    const style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // Init
    window.addEventListener('load', () => {
        const t = localStorage.getItem(KEY) || 'light';
        applyTheme(t);
        createToggleButton();
    });

})();
