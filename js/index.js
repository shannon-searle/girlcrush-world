// ============================================================
// Config — transition timings, tweak in one place
// ============================================================
const transitionConfig = {
    fadeMs: 800,
};

function resetToScreenTitle() {
    const backdrop = document.getElementById("page-backdrop");
    backdrop.style.background = `radial-gradient(
            circle at center,
            #ffffff 0%,
            #e0f7fa 35%,
            #f3e5f5 70%,
            #fce4ec 100%
        )`;
    backdrop.style.opacity = "1";

    const backdropVideo = document.getElementById("page-backdrop-video");
    backdropVideo.style.opacity = "0";
    backdropVideo.pause();

    document.querySelectorAll("section").forEach(el => {
        el.style.display = "none";
    });
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
    const backdrop = document.getElementById("page-backdrop");
    const backdropVideo = document.getElementById("page-backdrop-video");

    if (value === "spooky") {
        backdrop.style.opacity = "0";
        backdropVideo.currentTime = 0;
        backdropVideo.play();
        setTimeout(() => {
            requestAnimationFrame(() => { backdropVideo.style.opacity = "1"; });
        }, transitionConfig.fadeMs);
        return;
    }

    backdropVideo.style.opacity = "0";
    backdrop.style.opacity = "0";
    setTimeout(() => {
        backdrop.style.background = value;
        requestAnimationFrame(() => { backdrop.style.opacity = "1"; });
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
        window.location.href = "/home?from=index";
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