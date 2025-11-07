// Shared music controller (SoundCloud widget) - stores play state and position in localStorage
(function(){
    const SC_SRC = 'https://w.soundcloud.com/player/api.js';
    const WIDGET_ID = 'soundcloud-widget';
    const TRACK_IFRAME_SRC = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2019893204&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false';
    let widget;
    let saveInterval;

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

    function initWidget() {
        const iframe = createOrFindIframe();
        widget = SC.Widget(iframe);

        // Restore state
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
    }

    function startSavingPosition(){
        stopSavingPosition();
        saveInterval = setInterval(() => {
            widget.getPosition(pos => {
                localStorage.setItem('musicPosition', String(pos));
            });
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
            document.body.appendChild(btn);
        }

        btn.addEventListener('click', () => {
            if (!widget) return;
            widget.isPaused(paused => {
                if (paused) widget.play(); else widget.pause();
            });
        });
    }

    // Init
    ensureSC(() => {
        try { initWidget(); } catch(e) {}
        ensureMusicButton();
    });

})();
