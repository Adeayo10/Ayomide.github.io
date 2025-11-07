// Shared music controller (SoundCloud widget) - stores play state and position in localStorage
(function(){
    // Load config (try likely relative paths)
    async function loadConfig(){
        if (window.SITE_CONFIG) return window.SITE_CONFIG;
        const candidates = ['./site-config.json','../site-config.json','/site-config.json'];
        for (const p of candidates) {
            try {
                const res = await fetch(p, {cache: 'no-store'});
                if (!res.ok) continue;
                const cfg = await res.json();
                window.SITE_CONFIG = cfg;
                return cfg;
            } catch(e) { /* try next */ }
        }
        // sensible defaults
        window.SITE_CONFIG = { useSoundCloud: true, soundCloudTrackUrl: 'https://api.soundcloud.com/tracks/2019893204', localAudioPath: '/audio/track.mp3' };
        return window.SITE_CONFIG;
    }

    async function main(){
        const cfg = await loadConfig();
        const SC_SRC = 'https://w.soundcloud.com/player/api.js';
        const WIDGET_ID = 'soundcloud-widget';
        const TRACK_IFRAME_SRC = cfg.soundCloudTrackUrl ? ('https://w.soundcloud.com/player/?url=' + encodeURIComponent(cfg.soundCloudTrackUrl) + '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false') : null;
        let widget;
        let saveInterval;
        let audioEl = null;
        let useAudio = false;

        function ensureSC(cb) {
            if (window.SC && window.SC.Widget) return cb();
            const existing = document.querySelector('script[src="https://w.soundcloud.com/player/api.js"]');
            if (!existing) {
                const s = document.createElement('script');
                s.src = SC_SRC;
                s.onload = cb;
                document.head.appendChild(s);
            } else {
                existing.addEventListener('load', cb);
            }
        }

        function createOrFindIframe() {
            let iframe = document.getElementById(WIDGET_ID);
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = WIDGET_ID;
                iframe.width = '100%';
                iframe.height = '0';
                iframe.scrolling = 'no';
                iframe.frameBorder = 'no';
                iframe.allow = 'autoplay';
                iframe.style.display = 'none';
                iframe.src = TRACK_IFRAME_SRC;
                document.body.appendChild(iframe);
            }
            return iframe;
        }

        // Try to detect a local audio file by attempting to load metadata via an Audio element
        function tryUseHtml5AudioCandidate(path) {
            return new Promise(resolve => {
                if (!path) return resolve(null);
                try {
                    const a = document.createElement('audio');
                    a.preload = 'metadata';
                    a.src = path;
                    // if metadata loads, audio is available
                    const onLoaded = () => { cleanup(); resolve(path); };
                    const onError = () => { cleanup(); resolve(null); };
                    function cleanup(){ a.removeEventListener('loadedmetadata', onLoaded); a.removeEventListener('error', onError); }
                    a.addEventListener('loadedmetadata', onLoaded);
                    a.addEventListener('error', onError);
                    // in case browser blocks, timeout
                    setTimeout(() => { cleanup(); resolve(null); }, 1500);
                } catch(e){ resolve(null); }
            });
        }

        async function tryUseHtml5Audio() {
            const path = cfg.localAudioPath || '/audio/track.mp3';
            const candidates = [path, './' + path.replace(/^\//,''), '../' + path.replace(/^\//,'')];
            for (const p of candidates) {
                const ok = await tryUseHtml5AudioCandidate(p);
                if (ok) return ok;
            }
            return null;
        }

        function initWidget() {
            tryUseHtml5Audio().then(path => {
                if (path) {
                    useAudio = true;
                    audioEl = document.createElement('audio');
                    audioEl.id = 'shared-audio';
                    audioEl.src = path;
                    audioEl.preload = 'metadata';
                    audioEl.style.display = 'none';
                    document.body.appendChild(audioEl);

                    const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
                    const savedPos = Number(localStorage.getItem('musicPosition') || 0);
                    if (savedPos && !isNaN(savedPos)) {
                        audioEl.currentTime = savedPos / 1000;
                    }
                    audioEl.addEventListener('play', () => {
                        localStorage.setItem('musicPlaying','true');
                        toggleIcons(true);
                        startSavingPosition();
                    });
                    audioEl.addEventListener('pause', () => {
                        localStorage.setItem('musicPlaying','false');
                        toggleIcons(false);
                        stopSavingPosition();
                    });
                    if (wasPlaying) {
                        audioEl.play().catch(()=>{});
                        toggleIcons(true);
                    }
                    return;
                }

                // Fallback to SoundCloud widget if allowed
                if (!cfg.useSoundCloud || !TRACK_IFRAME_SRC) return;
                const iframe = createOrFindIframe();
                widget = SC.Widget(iframe);

                const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
                const savedPos = Number(localStorage.getItem('musicPosition') || 0);

                widget.bind(SC.Widget.Events.READY, () => {
                    if (savedPos && !isNaN(savedPos)) {
                        try { widget.seekTo(savedPos); } catch(e) {}
                    }
                    if (wasPlaying) {
                        widget.play();
                        toggleIcons(true);
                    }
                });

                widget.bind(SC.Widget.Events.PLAY, () => {
                    localStorage.setItem('musicPlaying','true');
                    toggleIcons(true);
                    startSavingPosition();
                });

                widget.bind(SC.Widget.Events.PAUSE, () => {
                    localStorage.setItem('musicPlaying','false');
                    toggleIcons(false);
                    stopSavingPosition();
                });
            }).catch(()=>{});
        }

        function startSavingPosition(){
            stopSavingPosition();
            saveInterval = setInterval(() => {
                if (useAudio && audioEl) {
                    localStorage.setItem('musicPosition', String(Math.floor(audioEl.currentTime * 1000)));
                } else if (widget) {
                    widget.getPosition(pos => {
                        localStorage.setItem('musicPosition', String(pos));
                    });
                }
            }, 2000);
        }

        function stopSavingPosition(){
            if (saveInterval) { clearInterval(saveInterval); saveInterval = null; }
        }

        function toggleIcons(playing) {
            const playIcon = document.getElementById('playIcon');
            const pauseIcon = document.getElementById('pauseIcon');
            if (!playIcon || !pauseIcon) return;
            if (playing) { playIcon.classList.add('hidden'); pauseIcon.classList.remove('hidden'); }
            else { playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden'); }
        }

        function ensureMusicButton() {
            let btn = document.getElementById('musicBtn');
            if (!btn) {
                btn = document.createElement('button');
                btn.id = 'musicBtn';
                btn.className = 'music-btn';
                btn.title = 'Toggle Music';
                btn.innerHTML = '<svg id="playIcon" class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>\n                <svg id="pauseIcon" class="w-8 h-8 text-white hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
                btn.style.position = 'fixed';
                btn.style.bottom = '30px';
                btn.style.right = '30px';
                btn.style.zIndex = '10000';
                btn.style.width = '60px';
                btn.style.height = '60px';
                btn.style.borderRadius = '50%';
                btn.style.display = 'flex';
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
                document.body.appendChild(btn);
            }

            btn.addEventListener('click', () => {
                if (useAudio && audioEl) {
                    if (audioEl.paused) audioEl.play().catch(()=>{}); else audioEl.pause();
                    return;
                }
                if (!widget) return;
                widget.isPaused(paused => {
                    if (paused) widget.play(); else widget.pause();
                });
            });
        }

        // Init
        if (cfg.useSoundCloud) ensureSC(() => { try { initWidget(); } catch(e) {} });
        else initWidget();
        ensureMusicButton();
    }

    // start
    try { main(); } catch(e) { console.error('music init err', e); }

})();
