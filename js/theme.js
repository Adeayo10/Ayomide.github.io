// Theme toggle (light / dark) - lightweight implementation
(function(){
    const KEY = 'themePreference';

    async function loadConfig(){
        if (window.SITE_CONFIG) return window.SITE_CONFIG;
        try {
            const res = await fetch('../site-config.json', {cache: 'no-store'});
            if (res.ok) { window.SITE_CONFIG = await res.json(); return window.SITE_CONFIG; }
        } catch(e) {}
        return window.SITE_CONFIG || { themeDefault: 'light' };
    }

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
        btn.style.position = 'fixed';
        btn.style.bottom = '30px';
        btn.style.right = '100px';
        btn.style.zIndex = '10000';
        btn.style.width = '60px';
        btn.style.height = '60px';
        btn.style.borderRadius = '50%';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
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
    window.addEventListener('load', async () => {
        const cfg = await loadConfig();
        const t = localStorage.getItem(KEY) || (cfg && cfg.themeDefault) || 'light';
        applyTheme(t);
        createToggleButton();
    });

})();
