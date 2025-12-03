// Shared music controller (SoundCloud widget + HTML5) - Music Box Edition
(function(){
    // Helper to load config if not already present (backward compat)
    async function loadConfig(){
        if (window.SITE_CONFIG) return window.SITE_CONFIG;
        if (window.SITE_CONFIG_READY) return await window.SITE_CONFIG_READY;
        // Fallback fetch
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
        return { useSoundCloud: true, soundCloudTrackUrl: 'https://api.soundcloud.com/tracks/2019893204' };
    }

    async function main(){
        const cfg = await loadConfig();
        
        // Construct Playlist
        let playlist = [];
        if (cfg.playlist && Array.isArray(cfg.playlist) && cfg.playlist.length > 0) {
            playlist = cfg.playlist;
        } else {
            // Backward compatibility
            if (cfg.soundCloudTrackUrl) {
                playlist.push({ title: 'Our Theme', url: cfg.soundCloudTrackUrl, source: 'soundcloud' });
            }
            // Check local audio
            const localPath = cfg.localAudioPath || '/audio/track.mp3';
            // We'll check if it exists later, or just add it if configured
            if (cfg.localAudioPath) {
                 playlist.push({ title: 'Local Track', url: localPath, source: 'local' });
            }
        }

        let currentTrackIndex = Number(localStorage.getItem('musicTrackIndex') || 0);
        if (currentTrackIndex >= playlist.length) currentTrackIndex = 0;

        let widget = null;
        let audioEl = null;
        let isPlaying = false;
        let saveInterval = null;

        // SoundCloud Setup
        const SC_SRC = 'https://w.soundcloud.com/player/api.js';
        const WIDGET_ID = 'soundcloud-widget';
        
        function ensureSC(cb) {
            if (window.SC && window.SC.Widget) return cb();
            const existing = document.querySelector(`script[src="${SC_SRC}"]`);
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
                iframe.src = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2019893204&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false';
                document.body.appendChild(iframe);
            }
            return iframe;
        }

        // Player Logic
        function loadTrack(index, autoPlay = false) {
            const track = playlist[index];
            if (!track) return;
            
            // Stop existing
            if (audioEl) { audioEl.pause(); audioEl.style.display = 'none'; }
            if (widget) { widget.pause(); }

            currentTrackIndex = index;
            localStorage.setItem('musicTrackIndex', index);

            if (track.source === 'local' || track.type === 'local') {
                if (!audioEl) {
                    audioEl = document.createElement('audio');
                    audioEl.id = 'shared-audio';
                    document.body.appendChild(audioEl);
                    audioEl.addEventListener('ended', playNext);
                    audioEl.addEventListener('play', onPlay);
                    audioEl.addEventListener('pause', onPause);
                }
                audioEl.src = track.url;
                audioEl.style.display = 'none';
                if (autoPlay) audioEl.play().catch(e => console.log('Autoplay blocked', e));
                else {
                    // Restore position if same track
                    const savedPos = Number(localStorage.getItem('musicPosition') || 0);
                    if (savedPos) audioEl.currentTime = savedPos / 1000;
                }
            } else {
                // SoundCloud
                ensureSC(() => {
                    const iframe = createOrFindIframe();
                    if (!widget) {
                        widget = SC.Widget(iframe);
                        widget.bind(SC.Widget.Events.FINISH, playNext);
                        widget.bind(SC.Widget.Events.PLAY, onPlay);
                        widget.bind(SC.Widget.Events.PAUSE, onPause);
                    }
                    widget.load(track.url, {
                        auto_play: autoPlay,
                        show_artwork: false,
                        callback: () => {
                            if (!autoPlay) {
                                const savedPos = Number(localStorage.getItem('musicPosition') || 0);
                                if (savedPos) widget.seekTo(savedPos);
                            }
                        }
                    });
                });
            }
            updateModalUI();
        }

        function togglePlay() {
            const track = playlist[currentTrackIndex];
            if (track.source === 'local' || track.type === 'local') {
                if (audioEl.paused) audioEl.play(); else audioEl.pause();
            } else {
                if (widget) widget.toggle();
            }
        }

        function playNext() {
            let next = currentTrackIndex + 1;
            if (next >= playlist.length) next = 0;
            loadTrack(next, true);
        }

        function playPrev() {
            let prev = currentTrackIndex - 1;
            if (prev < 0) prev = playlist.length - 1;
            loadTrack(prev, true);
        }

        function onPlay() {
            isPlaying = true;
            localStorage.setItem('musicPlaying', 'true');
            toggleIcons(true);
            startSavingPosition();
            updateModalUI();
        }

        function onPause() {
            isPlaying = false;
            localStorage.setItem('musicPlaying', 'false');
            toggleIcons(false);
            stopSavingPosition();
            updateModalUI();
        }

        function startSavingPosition(){
            stopSavingPosition();
            saveInterval = setInterval(() => {
                const track = playlist[currentTrackIndex];
                if ((track.source === 'local' || track.type === 'local') && audioEl) {
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

        // UI
        function toggleIcons(playing) {
            const playIcon = document.getElementById('playIcon');
            const pauseIcon = document.getElementById('pauseIcon');
            if (!playIcon || !pauseIcon) return;
            if (playing) { playIcon.classList.add('hidden'); pauseIcon.classList.remove('hidden'); }
            else { playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden'); }
        }

        function createMusicBoxModal() {
            if (document.getElementById('musicBoxModal')) return;
            const modal = document.createElement('div');
            modal.id = 'musicBoxModal';
            modal.style.display = 'none';
            modal.style.position = 'fixed';
            modal.style.bottom = '100px';
            modal.style.right = '30px';
            modal.style.width = '300px';
            modal.style.background = 'rgba(255, 255, 255, 0.95)';
            modal.style.backdropFilter = 'blur(10px)';
            modal.style.borderRadius = '16px';
            modal.style.padding = '20px';
            modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            modal.style.zIndex = '9999';
            modal.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <h3 style="margin:0;font-family:'Playfair Display',serif;color:#4a5568;">🎵 Melody Box</h3>
                    <button id="closeMusicBox" style="background:none;border:none;font-size:20px;cursor:pointer;">&times;</button>
                </div>
                <div id="trackList" style="max-height:200px;overflow-y:auto;margin-bottom:15px;"></div>
                <div style="display:flex;justify-content:center;gap:15px;align-items:center;">
                    <button id="prevBtn" style="background:none;border:none;cursor:pointer;font-size:24px;">⏮️</button>
                    <button id="playPauseBtn" style="background:#667eea;border:none;border-radius:50%;width:50px;height:50px;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                        <span id="mbPlay">▶️</span><span id="mbPause" style="display:none;">⏸️</span>
                    </button>
                    <button id="nextBtn" style="background:none;border:none;cursor:pointer;font-size:24px;">⏭️</button>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('closeMusicBox').onclick = () => modal.style.display = 'none';
            document.getElementById('prevBtn').onclick = playPrev;
            document.getElementById('nextBtn').onclick = playNext;
            document.getElementById('playPauseBtn').onclick = togglePlay;
        }

        function updateModalUI() {
            const list = document.getElementById('trackList');
            if (!list) return;
            list.innerHTML = '';
            playlist.forEach((track, i) => {
                const item = document.createElement('div');
                item.textContent = (i === currentTrackIndex ? '🎵 ' : '') + track.title;
                item.style.padding = '8px';
                item.style.borderRadius = '8px';
                item.style.cursor = 'pointer';
                item.style.fontSize = '14px';
                item.style.background = i === currentTrackIndex ? '#f3e8ff' : 'transparent';
                item.style.color = i === currentTrackIndex ? '#6b46c1' : '#4a5568';
                item.onclick = () => loadTrack(i, true);
                list.appendChild(item);
            });

            const mbPlay = document.getElementById('mbPlay');
            const mbPause = document.getElementById('mbPause');
            if (isPlaying) {
                mbPlay.style.display = 'none';
                mbPause.style.display = 'block';
            } else {
                mbPlay.style.display = 'block';
                mbPause.style.display = 'none';
            }
        }

        function ensureMusicButton() {
            let btn = document.getElementById('musicBtn');
            if (!btn) {
                btn = document.createElement('button');
                btn.id = 'musicBtn';
                btn.className = 'music-btn';
                btn.title = 'Music Box';
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

            btn.onclick = () => {
                if (playlist.length > 1) {
                    const modal = document.getElementById('musicBoxModal');
                    if (modal.style.display === 'none') {
                        modal.style.display = 'block';
                        updateModalUI();
                    } else {
                        modal.style.display = 'none';
                    }
                } else {
                    togglePlay();
                }
            };
        }

        // Init
        createMusicBoxModal();
        ensureMusicButton();
        
        // Restore state
        const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
        loadTrack(currentTrackIndex, wasPlaying);
    }

    try { main(); } catch(e) { console.error('Music Box Init Error', e); }
})();
