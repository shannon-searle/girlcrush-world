// ============================================================
// Config — transition timings, tweak in one place
// ============================================================
const transitionConfig = {
    fadeMs: 1000,
    blackoutDelayMs: 1600, // gives the fade time to finish before hard-cutting to black
};

// reset to screen title
function resetToScreenTitle() {
    // set bg
    const bg = document.getElementById("bg");
    bg.style.background = `radial-gradient(
            circle at center,
            #ffffff 0%,
            #e0f7fa 35%,
            #f3e5f5 70%,
            #fce4ec 100%
        )`;
    // remove previous screen
    document.querySelectorAll("section").forEach(el => {
        el.style.display = "none";
    });
    // show title screen
    document.getElementById('screen-title').style.display = "flex";
    document.body.style.opacity = "1";
    // reset html background
    document.documentElement.style.background = "#fce4ec";
    document.body.style.background = "";

}

// ── reset on page load ──
window.addEventListener("pageshow", resetToScreenTitle);

// Push a dummy state so we can catch the back button
history.pushState(null, '', window.location.href);


// ── Section transitions ──

function fadeBody(out, callback) {
    document.body.style.transition = `opacity ${transitionConfig.fadeMs / 1000}s ease`;
    document.body.style.opacity = out ? "0" : "1";
    if (callback) setTimeout(callback, transitionConfig.fadeMs);
}

function setBackground(color) {
    const bg = document.getElementById("bg");
    bg.style.opacity = "0";
    setTimeout(() => {
        bg.style.background = color;
        requestAnimationFrame(() => { bg.style.opacity = "1"; });
    }, transitionConfig.fadeMs);
}

function next(hideId, showId, newBg) {
    if (newBg) setBackground(newBg);

    fadeBody(true, () => {
        document.getElementById(hideId).style.display = "none";
        document.getElementById(showId).style.display = "flex";
        document.body.style.opacity = "1";
    });

    setTimeout(() => {
        document.documentElement.style.background = "black";
    }, transitionConfig.blackoutDelayMs);
}

function goToBase() {
    setBackground("#fce4ec");
    fadeBody(true, () => {
        window.location.href = "base.html?from=index";
    });
}

// ── Screen transition triggers ──
document.querySelectorAll('[data-hide]').forEach(el => {
    el.addEventListener('click', () => {
        next(el.dataset.hide, el.dataset.show, el.dataset.bg);
    });
});

document.querySelectorAll('[data-goto-base]').forEach(el => {
    el.addEventListener('click', goToBase);
});

// ── Stars ──
createStarfield({ maxSize: 7.5, drift: 0.2 });