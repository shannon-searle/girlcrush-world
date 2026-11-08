// ============================================================
// Config — magic numbers for this file's effects, tweak in one place
// ============================================================
const mainConfig = {
    heartTrailEveryNMoves: 5,
    heartLifetimeMs: 1000,
};

/* ------------------------------------------
    Cursor heart trail
------------------------------------------ */
function initCursorHeartTrail() {
    let trailCount = 0;

    document.addEventListener('mousemove', (e) => {
        trailCount++;
        if (trailCount % mainConfig.heartTrailEveryNMoves !== 0) return;

        const heart = document.createElement('div');
        heart.className  = 'cursor-heart';
        heart.innerHTML  = '♡';
        heart.style.left = e.pageX + 'px';
        heart.style.top  = e.pageY + 'px';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), mainConfig.heartLifetimeMs);
    });
}

/* ------------------------------------------
    Blinkies: scatter each one with a small random tilt/offset
------------------------------------------ */
function initBlinkies() {
    document.querySelectorAll('.blinkies img').forEach(img => {
        const rotate = (Math.random() * 20 - 10);         // -10 to 10 degrees
        const translateX = (Math.random() * 20 - 10);    // -10 to 10px
        const translateY = (Math.random() * 20 - 10);    // -10 to 10px
        img.style.transform = `rotate(${rotate}deg) translate(${translateX}px, ${translateY}px)`;
    });
}

initCursorHeartTrail();
initBlinkies();

/* ------------------------------------------
    Stars
------------------------------------------ */
createStarfield({ maxSize: 5, minY: 0.5, maxY: 1 });
