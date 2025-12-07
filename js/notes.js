// Virtual Love Notes - unlock messages based on visits and secret codes
(function(){
    const STORAGE_KEY = 'loveNotesUnlocked';
    const unlocked = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));

    // Expose API globally for compatibility
    window.LoveNotes = {
        getUnlocked: () => Array.from(unlocked),
        unlock: (key) => unlock(key),
        checkCode: async (code) => {
            const cfg = await loadConfig();
            const correct = (cfg && cfg.secretNoteCode) ? String(cfg.secretNoteCode).trim().toUpperCase() : 'LUMLUM';
            return code.trim().toUpperCase() === correct;
        },
        getNote: (key) => NOTES[key],
        getAllNotes: () => NOTES
    };

    async function loadConfig(){
        if (window.SITE_CONFIG) return window.SITE_CONFIG;
        try {
            const res = await fetch('../site-config.json', {cache: 'no-store'});
            if (res.ok) { window.SITE_CONFIG = await res.json(); return window.SITE_CONFIG; }
        } catch(e) {}
        return window.SITE_CONFIG || { secretNoteCode: 'LUMLUM' };
    }

    const NOTES = {
        first: { title: 'A Note for Us', body: "We kept showing up. That's how love grew — in the quiet, the intentional, the everyday." },
        distance: { title: 'Across Distance', body: "Those late night calls built a home for our hearts. Remember how we laughed until sunrise?" },
        secret_note: { title: 'My Little Secret', body: "Mide — you are my favorite nickname. Keep this between us. 💜" }
    };

    function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unlocked))); }

    function unlock(key) { 
        if (!NOTES[key] || unlocked.has(key)) return; 
        unlocked.add(key); 
        save();
        window.dispatchEvent(new CustomEvent('note-unlocked', { detail: { key } }));
    }

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
        btn.style.zIndex = '9998';
        btn.style.fontSize = '24px';
        btn.style.background = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '50%';
        btn.style.width = '60px';
        btn.style.height = '60px';
        btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'transform 0.2s';
        
        btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';
        
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
            modal.style.width = '90%';
            modal.style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)';
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
        h.style.marginBottom = '15px';
        h.style.fontFamily = "'Playfair Display', serif";
        h.style.fontSize = '24px';
        h.style.color = '#2d3748';
        h.style.borderBottom = '2px solid #f7fafc';
        h.style.paddingBottom = '10px';
        modal.appendChild(h);

        const list = document.createElement('div');
        list.style.maxHeight = '300px';
        list.style.overflowY = 'auto';
        
        // 1. Render Standard Notes
        const standardNotes = ['first', 'distance'];
        standardNotes.forEach(k => {
            if (unlocked.has(k)) {
                const n = NOTES[k];
                if (!n) return;
                const card = document.createElement('div');
                card.style.padding = '15px';
                card.style.marginBottom = '10px';
                card.style.borderRadius = '10px';
                card.style.background = '#fff5f7';
                card.style.borderLeft = '4px solid #ed64a6';
                
                const t = document.createElement('strong'); 
                t.textContent = n.title; 
                t.style.display = 'block';
                t.style.marginBottom = '5px';
                t.style.color = '#97266d';
                card.appendChild(t);
                
                const p = document.createElement('p'); 
                p.textContent = n.body; 
                p.style.margin = '0';
                p.style.color = '#4a5568';
                p.style.fontSize = '14px';
                p.style.lineHeight = '1.5';
                card.appendChild(p);
                
                list.appendChild(card);
            }
        });

        // 2. Render Secret Note (Always visible, either locked or unlocked)
        const secretKey = 'secret_note';
        const secretNote = NOTES[secretKey];
        
        const secretCard = document.createElement('div');
        secretCard.style.padding = '15px';
        secretCard.style.marginBottom = '10px';
        secretCard.style.borderRadius = '10px';
        secretCard.style.background = unlocked.has(secretKey) ? '#fff5f7' : '#f7fafc';
        secretCard.style.borderLeft = unlocked.has(secretKey) ? '4px solid #ed64a6' : '4px solid #cbd5e0';
        secretCard.style.transition = 'all 0.3s ease';

        if (unlocked.has(secretKey)) {
            // Unlocked State
            const t = document.createElement('strong'); 
            t.textContent = secretNote.title; 
            t.style.display = 'block';
            t.style.marginBottom = '5px';
            t.style.color = '#97266d';
            secretCard.appendChild(t);
            
            const p = document.createElement('p'); 
            p.textContent = secretNote.body; 
            p.style.margin = '0';
            p.style.color = '#4a5568';
            p.style.fontSize = '14px';
            p.style.lineHeight = '1.5';
            secretCard.appendChild(p);
        } else {
            // Locked State
            const t = document.createElement('strong'); 
            t.textContent = 'Secret Message 🔒'; 
            t.style.display = 'block';
            t.style.marginBottom = '10px';
            t.style.color = '#4a5568';
            secretCard.appendChild(t);

            const inputGroup = document.createElement('div');
            inputGroup.style.display = 'flex';
            inputGroup.style.gap = '10px';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Enter Code';
            input.style.flex = '1';
            input.style.padding = '8px';
            input.style.border = '1px solid #e2e8f0';
            input.style.borderRadius = '6px';
            input.style.fontSize = '14px';
            input.style.outline = 'none';

            const btn = document.createElement('button');
            btn.textContent = 'Unlock';
            btn.style.padding = '8px 15px';
            btn.style.background = '#667eea';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '14px';

            const handleUnlock = async () => {
                const code = input.value.trim().toUpperCase();
                if (!code) return;
                
                const cfg = await loadConfig();
                const correct = (cfg && cfg.secretNoteCode) ? String(cfg.secretNoteCode).trim().toUpperCase() : 'LUMLUM';

                if (code === correct) {
                    unlock('secret_note');
                    if (window.confetti) window.confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 } });
                    renderModal(); // Re-render to show unlocked state
                } else {
                    input.style.borderColor = '#f56565';
                    input.classList.add('shake');
                    setTimeout(() => {
                        input.style.borderColor = '#e2e8f0';
                        input.classList.remove('shake');
                    }, 500);
                }
            };

            btn.onclick = handleUnlock;
            input.onkeypress = (e) => { if (e.key === 'Enter') handleUnlock(); };

            inputGroup.appendChild(input);
            inputGroup.appendChild(btn);
            secretCard.appendChild(inputGroup);
        }
        list.appendChild(secretCard);
        
        if (standardNotes.every(k => !unlocked.has(k)) && !unlocked.has(secretKey)) {
             // Only show "No notes" if absolutely nothing is visible (though secret card is always visible now, so this might be redundant, but good for empty state logic)
             // Actually, since secret card is always there, we don't need the "No notes unlocked" message anymore.
        }
        modal.appendChild(list);

        const actions = document.createElement('div'); 
        actions.style.marginTop = '20px';
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end'; // Align close button to right
        actions.style.alignItems = 'center';
        actions.style.borderTop = '2px solid #f7fafc';
        actions.style.paddingTop = '15px';

        const close = document.createElement('button'); 
        close.textContent = 'Close'; 
        close.style.background = 'none';
        close.style.border = 'none';
        close.style.color = '#718096';
        close.style.cursor = 'pointer';
        close.style.fontSize = '14px';
        close.addEventListener('click', () => document.getElementById('notesModal').style.display = 'none');
        
        actions.appendChild(close); 
        modal.appendChild(actions);
    }

    // Removed openVaultUI as it is no longer used
    // Auto-unlock logic: mark visits

    // Auto-unlock logic: mark visits
    window.addEventListener('load', async () => {
        createNotesButton();
        const path = window.location.pathname || '';
        // Unlock 'first' note on home page (index.html or root)
        if (path.endsWith('anniversary-landing.html') || path.endsWith('index.html') || path === '/' || path.endsWith('/Ayomide/')) unlock('first');
        
        // Unlock 'distance' note on timeline page
        if (path.endsWith('timeline.html')) unlock('distance');

        // If both first & distance unlocked, reveal combined message
        if (unlocked.has('first') && unlocked.has('distance')) unlock('first');
    });

})();
