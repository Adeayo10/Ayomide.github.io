// Lightweight confetti helper. Call `triggerConfetti()` to run.
(function(){
    function triggerConfetti(duration = 2500, colors = ['#764ba2','#f093fb','#ffb6c1','#667eea']){
        const end = Date.now() + duration;
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = 100000;
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        const pieces = [];
        for (let i=0;i<120;i++) pieces.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height - canvas.height, vx:(Math.random()-0.5)*6, vy:Math.random()*6+2, r: Math.random()*6+4, color: colors[Math.floor(Math.random()*colors.length)], rot: Math.random()*360, vr:(Math.random()-0.5)*10});

        function frame(){
            ctx.clearRect(0,0,canvas.width,canvas.height);
            for (const p of pieces){
                p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.rot += p.vr;
                ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
                ctx.fillStyle = p.color; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6);
                ctx.restore();
            }
            if (Date.now() < end) requestAnimationFrame(frame); else { canvas.remove(); }
        }
        requestAnimationFrame(frame);
    }

    // Auto-trigger on celebration date
    (async function(){
        try{
            if (!window.SITE_CONFIG_READY) return; // loader not present
            const cfg = await window.SITE_CONFIG_READY;
            if (!cfg || !cfg.celebrationDate) return;
            const today = new Date();
            const cd = new Date(cfg.celebrationDate + 'T00:00:00');
            if (today.getFullYear() === cd.getFullYear() && today.getMonth() === cd.getMonth() && today.getDate() === cd.getDate()){
                // run on load
                window.addEventListener('load', ()=> setTimeout(()=> triggerConfetti(3500), 600));
            }
        }catch(e){}
    })();

    window.triggerConfetti = triggerConfetti;
})();
