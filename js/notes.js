// Virtual Love Notes - unlock messages based on visits and secret codes
(function(){
    const STORAGE_KEY = 'loveNotesUnlocked';
    const unlocked = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));

    async function loadConfig(){
        if (window.SITE_CONFIG) return window.SITE_CONFIG;
        try {
            const res = await fetch('../site-config.json', {cache: 'no-store'});
            if (res.ok) { window.SITE_CONFIG = await res.json(); return window.SITE_CONFIG; }
        } catch(e) {}
        return window.SITE_CONFIG || { secretNoteCode: 'MIDELOVE' };
    }

    const NOTES = {
        first: { title: 'A Note for Us', body: "We kept showing up. That's how love grew — in the quiet, the intentional, the everyday." },
        distance: { title: 'Across Distance', body: "Those late night calls built a home for our hearts. Remember how we laughed until sunrise?" },
        secret: { title: 'My Little Secret', body: "Mide — you are my favorite nickname. Keep this between us. 💜" }
    };

    function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unlocked))); }

    function unlock(key) { if (!NOTES[key] || unlocked.has(key)) return; unlocked.add(key); save(); }

    function createNotesButton(){
        if (document.getElementById('notesBtn')) return;
        const btn = document.createElement('button');
        btn.id = 'notesBtn';
        btn.className = 'music-btn notes-btn';
        btn.style.position = 'fixed';
        btn.style.left = '30px';
        btn.style.bottom = '30px';
        btn.title = 'Open Love Notes';
        btn.innerHTML = '💌';
        btn.addEventListener('click', openNotesModal);
        document.body.appendChild(btn);
    }

    function openNotesModal(){
        let modal = document.getElementById('notesModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'notesModal';
            modal.style.position = 'fixed';
            modal.style.left = '50%';
            modal.style.top = '50%';
            modal.style.transform = 'translate(-50%,-50%)';
            modal.style.zIndex = '9999';
            modal.style.background = 'white';
            modal.style.padding = '24px';
            modal.style.borderRadius = '16px';
            modal.style.maxWidth = '600px';
            modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            document.body.appendChild(modal);
        }
        renderModal();
        modal.style.display = 'block';
    }

    function renderModal(){
        const modal = document.getElementById('notesModal');
        modal.innerHTML = '';
        const h = document.createElement('h3');
        h.textContent = 'Love Notes';
        h.style.marginBottom = '12px';
        modal.appendChild(h);

        const list = document.createElement('div');
        Array.from(unlocked).forEach(k => {
            const n = NOTES[k];
            if (!n) return;
            const card = document.createElement('div');
            card.style.padding = '12px';
            card.style.marginBottom = '8px';
            card.style.borderRadius = '8px';
            card.style.background = '#fff6fb';
            const t = document.createElement('strong'); t.textContent = n.title; card.appendChild(t);
            const p = document.createElement('p'); p.textContent = n.body; p.style.marginTop = '6px'; card.appendChild(p);
            list.appendChild(card);
        });
        if (Array.from(unlocked).length === 0) {
            const p = document.createElement('p'); p.textContent = 'No notes unlocked yet. Visit the timeline and memories to reveal hidden notes.'; list.appendChild(p);
        }
        modal.appendChild(list);

        const actions = document.createElement('div'); actions.style.marginTop = '12px';
        const close = document.createElement('button'); close.textContent = 'Close'; close.style.marginRight = '8px';
        close.addEventListener('click', () => document.getElementById('notesModal').style.display = 'none');
        const codeBtn = document.createElement('button'); codeBtn.textContent = 'Enter Secret Code';
        codeBtn.addEventListener('click', async () => {
            const code = prompt('Enter the secret code:');
            if (!code) return;
            const cfg = await loadConfig();
            const correct = (cfg && cfg.secretNoteCode) ? String(cfg.secretNoteCode).trim().toUpperCase() : 'MIDELOVE';
            if (code.trim().toUpperCase() === correct) { unlock('secret'); alert('Secret note unlocked!'); renderModal(); }
            else alert('Nope — try again.');
        });
        actions.appendChild(close); actions.appendChild(codeBtn);
        modal.appendChild(actions);
    }

    // Auto-unlock logic: mark visits
    window.addEventListener('load', async () => {
        createNotesButton();
        const path = window.location.pathname || '';
        if (path.endsWith('anniversary-landing.html')) unlock('first');
        if (path.endsWith('timeline.html')) unlock('distance');

        // If both first & distance unlocked, reveal combined message
        if (unlocked.has('first') && unlocked.has('distance')) unlock('first');
    });

})();
