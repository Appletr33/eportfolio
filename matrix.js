/* matrix.js — Ambient Matrix rain background effect
   Renders falling green characters behind all page content.
   Designed to be atmospheric and non-distracting. */

(function () {
    'use strict';

    // ── Configuration ──────────────────────────────────────────
    const CONFIG = {
        fontSize: 14,             // Base character size in px
        columnGap: 1.2,           // Multiplier for horizontal spacing (1 = tight)
        fps: 18,                  // Target frames per second (lower = subtler)
        trailFade: 0.04,          // How quickly old characters fade (lower = longer trails)
        maxOpacity: 0.12,         // Peak brightness of the brightest character (head of drop)
        glowOpacity: 0.25,        // Opacity of the glow bloom on the head character
        headColor: '0, 255, 70',  // RGB of the leading (brightest) character
        trailColor: '0, 180, 50', // RGB of trailing characters
        dimColor: '0, 100, 30',   // RGB of the dimmest trail characters
        spawnChance: 0.015,       // Probability per column per frame to start a new drop
        speedMin: 0.3,            // Minimum drop speed (cells per frame)
        speedMax: 1.1,            // Maximum drop speed
        // Characters: Katakana + code symbols + digits
        charset: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789{}[]<>/\\|=+*&^%$#@!;:.,~`',
    };

    // ── Character pool ─────────────────────────────────────────
    const chars = CONFIG.charset.split('');

    // ── Canvas setup ───────────────────────────────────────────
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-rain';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let columns = 0;
    let drops = [];    // Each drop: { y, speed, length, chars[], opacities[] }
    let W, H;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;

        const colWidth = CONFIG.fontSize * CONFIG.columnGap;
        const newColCount = Math.ceil(W / colWidth);

        // Preserve existing drops when resizing, add/remove columns as needed
        if (newColCount > columns) {
            for (let i = columns; i < newColCount; i++) {
                drops[i] = null; // No active drop
            }
        }
        columns = newColCount;
        drops.length = columns;
    }

    // ── Drop factory ───────────────────────────────────────────
    function createDrop(colIndex) {
        const length = Math.floor(Math.random() * 18) + 6; // 6–24 chars long
        const speed = CONFIG.speedMin + Math.random() * (CONFIG.speedMax - CONFIG.speedMin);
        return {
            y: -length,
            speed: speed,
            length: length,
            colIndex: colIndex,
            chars: Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]),
            // Occasionally mutate a character for that flickering feel
            mutateTimer: 0,
        };
    }

    // ── Draw loop ──────────────────────────────────────────────
    let lastTime = 0;
    const interval = 1000 / CONFIG.fps;
    let animId;
    let isVisible = true;

    function draw(timestamp) {
        animId = requestAnimationFrame(draw);

        if (!isVisible) return;
        if (timestamp - lastTime < interval) return;
        lastTime = timestamp;

        const colWidth = CONFIG.fontSize * CONFIG.columnGap;
        const totalRows = Math.ceil(H / CONFIG.fontSize);

        // Fade the canvas — this creates the trail effect
        ctx.fillStyle = `rgba(15, 17, 23, ${CONFIG.trailFade})`;
        ctx.fillRect(0, 0, W, H);

        ctx.font = `${CONFIG.fontSize}px 'Fira Code', 'Consolas', monospace`;
        ctx.textAlign = 'center';

        for (let i = 0; i < columns; i++) {
            // Spawn new drops
            if (drops[i] === null && Math.random() < CONFIG.spawnChance) {
                drops[i] = createDrop(i);
            }

            const drop = drops[i];
            if (!drop) continue;

            // Advance drop
            drop.y += drop.speed;

            // Mutate random characters occasionally for flicker
            drop.mutateTimer++;
            if (drop.mutateTimer > 3) {
                drop.mutateTimer = 0;
                const idx = Math.floor(Math.random() * drop.length);
                drop.chars[idx] = chars[Math.floor(Math.random() * chars.length)];
            }

            // Draw each character in the drop
            for (let j = 0; j < drop.length; j++) {
                const cellY = Math.floor(drop.y) - (drop.length - 1 - j);
                if (cellY < -1 || cellY > totalRows + 1) continue;

                const x = i * colWidth + colWidth / 2;
                const y = cellY * CONFIG.fontSize;

                const distFromHead = drop.length - 1 - j; // 0 = head, higher = further back
                const normalizedDist = distFromHead / drop.length;

                if (distFromHead === 0) {
                    // Head character — brightest with a soft glow
                    ctx.shadowColor = `rgba(${CONFIG.headColor}, ${CONFIG.glowOpacity})`;
                    ctx.shadowBlur = 12;
                    ctx.fillStyle = `rgba(${CONFIG.headColor}, ${CONFIG.maxOpacity * 2.5})`;
                    ctx.fillText(drop.chars[j], x, y);
                    ctx.shadowBlur = 0;
                } else {
                    // Trail characters — fade from bright to dim
                    const fadeRatio = 1 - normalizedDist;
                    const opacity = CONFIG.maxOpacity * fadeRatio * fadeRatio; // Quadratic falloff
                    const color = normalizedDist < 0.5 ? CONFIG.trailColor : CONFIG.dimColor;
                    ctx.fillStyle = `rgba(${color}, ${opacity})`;
                    ctx.fillText(drop.chars[j], x, y);
                }
            }

            // Remove drop when it's fully off screen
            if (Math.floor(drop.y) - drop.length > totalRows) {
                drops[i] = null;
            }
        }
    }

    // ── Visibility handling — pause when tab is hidden ─────────
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
    });

    // ── Init ───────────────────────────────────────────────────
    window.addEventListener('resize', resize);
    resize();
    animId = requestAnimationFrame(draw);
})();
