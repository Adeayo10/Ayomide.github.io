// config-loader.js
// Loads `site-config.json` from likely locations once and exposes
// window.SITE_CONFIG and window.SITE_CONFIG_READY (a Promise).
(function(){
    if (window.SITE_CONFIG_READY) return;
    const candidates = ['./site-config.json','../site-config.json','/site-config.json'];
    window.SITE_CONFIG_READY = (async function(){
        for (const p of candidates) {
            try {
                const res = await fetch(p, {cache: 'no-store'});
                if (!res.ok) continue;
                const cfg = await res.json();
                window.SITE_CONFIG = cfg;
                return cfg;
            } catch(e){ /* ignore and try next */ }
        }
        // fallback defaults
        window.SITE_CONFIG = { startDate: '2025-09-08', celebrationDate: '2025-11-08', months:2, durationDays:61, useSoundCloud:true, soundCloudTrackUrl:'https://api.soundcloud.com/tracks/2019893204', localAudioPath:'/audio/track.mp3', themeDefault:'light', secretNoteCode:'MIDELOVE' };
        return window.SITE_CONFIG;
    })();
})();
