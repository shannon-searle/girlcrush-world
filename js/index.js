// ============================================================
// Config — transition timings, tweak in one place
// ============================================================
const transitionConfig = {
    fadeMs: 800,
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
    bg.style.opacity = "1";
    const bgVideo = document.getElementById("bg-video");
    bgVideo.style.opacity = "0";
    bgVideo.pause();
    // remove previous screen
    document.querySelectorAll("section").forEach(el => {
        el.style.display = "none";
    });
    // show title screen
    document.getElementById('screen-title').style.display = "flex";
    document.querySelector('.page-container').style.opacity = "1";
}

// ── reset on page load ──
window.addEventListener("pageshow", resetToScreenTitle);

// Push a dummy state so we can catch the back button
history.pushState(null, '', window.location.href);


// ── Section transitions ──

function fadeContent(out, callback) {
    const container = document.querySelector('.page-container');
    container.style.transition = `opacity ${transitionConfig.fadeMs / 1000}s ease-in-out`;
    container.style.opacity = out ? "0" : "1";
    if (callback) setTimeout(callback, transitionConfig.fadeMs);
}

function setBackground(value) {
    const bg = document.getElementById("bg");
    const bgVideo = document.getElementById("bg-video");

    if (value === "spooky") {
        bg.style.opacity = "0";
        bgVideo.currentTime = 0;
        bgVideo.play();
        setTimeout(() => {
            requestAnimationFrame(() => { bgVideo.style.opacity = "1"; });
        }, transitionConfig.fadeMs);
        return;
    }

    bgVideo.style.opacity = "0";
    bg.style.opacity = "0";
    setTimeout(() => {
        bg.style.background = value;
        requestAnimationFrame(() => { bg.style.opacity = "1"; });
    }, transitionConfig.fadeMs);
}

function next(hideId, showId, newBg) {
    if (newBg) setBackground(newBg);

    fadeContent(true, () => {
        document.getElementById(hideId).style.display = "none";
        document.getElementById(showId).style.display = "flex";
        fadeContent(false);
    });
}

function goToBase() {
    setBackground("#fce4ec");
    fadeContent(true, () => {
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