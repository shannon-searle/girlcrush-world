// ============================================================
// Config — magic numbers for this file's effects, tweak in one place
// ============================================================
const mainConfig = {
    heartTrailEveryNMoves: 5,
    heartLifetimeMs: 1000,
    arrivalFadeMaxWaitMs: 1000,
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
    Page fade-in (when navigating from index)
------------------------------------------ */
function waitUntilPageIsShownAndLoaded() {
    return new Promise(resolve => {
        const waitForLoad = () => {
            if (document.readyState === 'complete') return resolve();
            window.addEventListener('load', resolve, { once: true });
            setTimeout(resolve, mainConfig.arrivalFadeMaxWaitMs);
        };

        if (document.prerendering) {
            document.addEventListener('prerenderingchange', waitForLoad, { once: true });
        } else {
            waitForLoad();
        }
    });
}

function initArrivalFadeIn() {
    if (window.location.search !== '?from=index') return;

    document.body.style.opacity         = '0';
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.transition      = 'opacity 1.5s ease, background-color 1s ease';

    waitUntilPageIsShownAndLoaded().then(() => {
        // the query must be in the link so index.html's prerender matches, but visitors don't need to see it
        history.replaceState(history.state, '', location.pathname + location.hash);

        requestAnimationFrame(() => {
            document.body.style.opacity         = '1';
            document.body.style.backgroundColor = '#fce4ec';
        });
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
initArrivalFadeIn();
initBlinkies();

/* ------------------------------------------
    Stars
------------------------------------------ */
createStarfield({ maxSize: 5, minY: 0.5, maxY: 1 });
