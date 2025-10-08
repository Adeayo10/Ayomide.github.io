document.addEventListener('DOMContentLoaded', () => {
    // Fade-in animation
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = 0;
        container.style.transition = 'opacity 700ms ease-in-out';
        requestAnimationFrame(() => { container.style.opacity = 1; });
    }

    // Dynamic greeting (if a title exists)
    const title = document.querySelector('.title');
    if (title) {
        const hours = new Date().getHours();
        let greeting = 'Hello';
        if (hours < 12) greeting = 'Good Morning';
        else if (hours < 18) greeting = 'Good Afternoon';
        else greeting = 'Good Evening';
        // Allow the page to still show the custom title if present
        title.textContent = `${greeting}, Ayomide`;
    }

    setupAudioControls();
    setupBackToTopButton();
    setupTextToSpeech();
    startHeartAnimation();
});

/* ------------------- Audio (WebAudio ambient pad + fallback to SoundCloud) ------------------- */
let audioCtx = null;
let ambientNodes = null;
function setupAudioControls() {
    const playBtn = document.getElementById('playMusic');
    const stopBtn = document.getElementById('stopMusic');
    const iframe = document.getElementById('soundcloudPlayer');

    // If SoundCloud iframe exists and SC widget is available, prefer it for track playback
    if (iframe && typeof SC !== 'undefined') {
        try {
            const widget = SC.Widget(iframe);
            // bind ready to enable controls
            widget.bind(SC.Widget.Events.READY, () => {
                if (playBtn) playBtn.addEventListener('click', () => widget.play());
                if (stopBtn) stopBtn.addEventListener('click', () => widget.pause());
            });
            return;
        } catch (err) {
            console.warn('SoundCloud widget error, falling back to generated ambient audio', err);
        }
    }

    // Fallback: create a gentle ambient pad using WebAudio
    if (!playBtn && !stopBtn) return;

    const ensureAudioContext = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const startAmbient = () => {
        if (ambientNodes) return; // already running
        ensureAudioContext();
        const ctx = audioCtx;
        const master = ctx.createGain();
        master.gain.value = 0.0;
        master.connect(ctx.destination);

        // Two detuned oscillators for a pad
        const oscA = ctx.createOscillator();
        const oscB = ctx.createOscillator();
        oscA.type = 'sine';
        oscB.type = 'sine';
        oscA.frequency.value = 220; // A3-ish
        oscB.frequency.value = 220 * 1.01; // slightly detuned

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.07; // slow wobble
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 80; // modulation depth
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        // gentle noise texture
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.02;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.15;

        oscA.connect(filter);
        oscB.connect(filter);
        filter.connect(master);
        noise.connect(noiseGain);
        noiseGain.connect(master);

        oscA.start();
        oscB.start();
        noise.start();
        lfo.start();

        // ramp in
        master.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5);

        ambientNodes = { ctx, oscA, oscB, noise, lfo, master };
    };

    const stopAmbient = () => {
        if (!ambientNodes) return;
        const { ctx, oscA, oscB, noise, lfo, master } = ambientNodes;
        // ramp out then stop
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        setTimeout(() => {
            try { oscA.stop(); oscB.stop(); noise.stop(); lfo.stop(); } catch (e) { /* ignore */ }
            ambientNodes = null;
        }, 1400);
    };

    if (playBtn) playBtn.addEventListener('click', (e) => {
        // resume audio context on user gesture
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        startAmbient();
        playBtn.textContent = 'Playing';
    });

    if (stopBtn) stopBtn.addEventListener('click', (e) => {
        stopAmbient();
        if (playBtn) playBtn.textContent = 'Play Music';
    });
}

/* ------------------- Back to top button ------------------- */
function setupBackToTopButton() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) backToTop.classList.add('show');
        else backToTop.classList.remove('show');
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ------------------- Hearts animation ------------------- */
let heartInterval = null;
function startHeartAnimation() {
    if (heartInterval) return;
    heartInterval = setInterval(createHeart, 600);
}

function createHeart() {
    const maxHearts = 40;
    const hearts = document.querySelectorAll('.heart');
    if (hearts.length >= maxHearts) return;

    const heart = document.createElement('div');
    heart.className = 'heart';
    const size = 12 + Math.random() * 36;
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.background = `radial-gradient(circle at 30% 30%, #ff9ab8, #ff6b81)`;
    heart.style.opacity = (0.6 + Math.random() * 0.4).toString();
    heart.style.borderRadius = '50%';
    heart.style.position = 'fixed';
    heart.style.bottom = '-40px';
    heart.style.zIndex = '1000';
    heart.style.pointerEvents = 'none';
    heart.style.transition = `transform ${4 + Math.random() * 4}s linear, opacity ${4 + Math.random() * 4}s linear`;

    document.body.appendChild(heart);

    requestAnimationFrame(() => {
        heart.style.transform = `translateY(-120vh) scale(${0.5 + Math.random()}) rotate(${Math.random() * 360}deg)`;
        heart.style.opacity = '0';
    });

    setTimeout(() => heart.remove(), 9000);
}

/* ------------------- Text-to-Speech (robust) ------------------- */
function setupTextToSpeech() {
    const readAloudButton = document.getElementById('readAloudButton');
    const stopReadingButton = document.getElementById('stopReadingButton');
    if (!readAloudButton || !stopReadingButton) return;

    if (!('speechSynthesis' in window)) {
        console.warn('Speech Synthesis API not available in this browser.');
        readAloudButton.disabled = true;
        stopReadingButton.disabled = true;
        return;
    }

    const synth = window.speechSynthesis;
    let voices = [];
    const loadVoices = () => { voices = synth.getVoices(); };
    loadVoices();
    if (synth.onvoiceschanged !== undefined) synth.addEventListener('voiceschanged', loadVoices);

    let chunkQueue = [];
    let isReading = false;

    const getTextToRead = () => {
        const ta = document.querySelector('.styled-textarea');
        if (ta) return ta.value.trim();
        const msg = document.querySelector('.message');
        if (msg) return msg.textContent.trim();
        return '';
    };

    const splitIntoChunks = (text, maxLen = 180) => {
        // Split by sentences but keep chunks under maxLen
        const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
        const chunks = [];
        let current = '';
        for (const s of sentences) {
            if ((current + s).length > maxLen) {
                if (current) { chunks.push(current.trim()); current = s; }
                else { chunks.push(s.trim()); current = ''; }
            } else {
                current += s;
            }
        }
        if (current) chunks.push(current.trim());
        return chunks;
    };

    const speakNext = () => {
        if (chunkQueue.length === 0) { isReading = false; return; }
        const text = chunkQueue.shift();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1;
        u.pitch = 1;
        u.volume = 1;
        // prefer a warm English voice if available
        const preferred = voices.find(v => /en-(GB|US)|Google|Microsoft/i.test(v.name));
        if (preferred) u.voice = preferred;

        u.onend = () => { speakNext(); };
        u.onerror = (e) => { console.error('TTS error', e); speakNext(); };
        synth.speak(u);
    };

    readAloudButton.addEventListener('click', () => {
        const text = getTextToRead();
        if (!text) return;
        // cancel any current speech and queue new chunks
        synth.cancel();
        chunkQueue = splitIntoChunks(text, 220);
        isReading = true;
        // small delay to allow cancel to take effect on some browsers
        setTimeout(() => speakNext(), 150);
    });

    stopReadingButton.addEventListener('click', () => {
        synth.cancel();
        chunkQueue = [];
        isReading = false;
    });
}




// function setupTextToSpeech() {
//     const readAloudButton = document.getElementById("readAloudButton");
//     const stopReadingButton = document.getElementById("stopReadingButton");
//     const messageContainer = document.querySelector(".styled-textarea");

//     if (!readAloudButton || !stopReadingButton || !messageContainer || !window.speechSynthesis) {
//         console.error("Required elements or Speech Synthesis API not available.");
//         return;
//     }

//     const synth = window.speechSynthesis;
//     let voices = [];
//     let isReading = false;

//     // Load voices when they are available
//     const loadVoices = () => {
//         voices = synth.getVoices();
//         if (voices.length === 0) {
//             console.error("No voices available. Ensure the browser supports speech synthesis.");
//         } else {
//             console.log("Available voices:", voices);
//         }
//     };

//     // Ensure voices are loaded before using them
//     if (synth.onvoiceschanged !== undefined) {
//         synth.addEventListener("voiceschanged", loadVoices);
//     }
//     loadVoices();

//     // Function to split text into smaller chunks
//     const splitTextIntoChunks = (text, chunkSize = 200) => {
//         const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]; // Split by sentences
//         const chunks = [];
//         let currentChunk = "";

//         sentences.forEach(sentence => {
//             if ((currentChunk + sentence).length > chunkSize) {
//                 chunks.push(currentChunk.trim());
//                 currentChunk = sentence;
//             } else {
//                 currentChunk += sentence;
//             }
//         });

//         if (currentChunk) {
//             chunks.push(currentChunk.trim());
//         }

//         return chunks;
//     };

//     // Function to read text chunks sequentially
//     const readChunks = (chunks, voice) => {
//         if (chunks.length === 0) {
//             console.log("Finished reading all chunks.");
//             isReading = false;
//             return;
//         }

//         const utterance = new SpeechSynthesisUtterance(chunks.shift());
//         utterance.voice = voice;
//         utterance.pitch = 1;
//         utterance.rate = 1;
//         utterance.volume = 1;

//         utterance.addEventListener("end", () => {
//             readChunks(chunks, voice); // Read the next chunk after the current one ends
//         });

//         utterance.addEventListener("error", (event) => {
//             console.error("Speech synthesis error:", event.error);
//         });

//         synth.speak(utterance);
//     };

//     readAloudButton.addEventListener("click", () => {
//         if (isReading) {
//             console.warn("Already reading. Please stop first.");
//             return;
//         }

//         const text = messageContainer.value.trim(); // Use `.value` for textarea
//         if (!text) {
//             console.error("No text to read.");
//             return;
//         }

//         const chunks = splitTextIntoChunks(text, 200); // Split text into chunks of 200 characters
//         console.log("Text chunks:", chunks);

//         const selectedVoice = voices.find(voice => voice.name.includes("Google UK English Female")) || voices[0];
//         if (!selectedVoice) {
//             console.error("No suitable voice found. Using default voice.");
//             return;
//         }

//         isReading = true;
//         readChunks(chunks, selectedVoice); // Start reading chunks
//     });

//     stopReadingButton.addEventListener("click", () => {
//         console.log("Stop Reading button clicked.");
//         if (synth.speaking) {
//             console.log("Stopping speech...");
//             synth.cancel();
//             isReading = false;
//         } else {
//             console.warn("No speech to stop.");
//         }
//     });
// }