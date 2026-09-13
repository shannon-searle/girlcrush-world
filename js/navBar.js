const starConnectors = document.querySelectorAll(".nav-star-connector");

starConnectors.forEach(star => {
    star.addEventListener("mouseenter", () => {
        if (star.classList.contains("spin")) return;

        star.classList.remove("spin");
        void star.offsetWidth; // reset animation
        star.classList.add("spin");

        star.addEventListener("animationend", () => {
            star.classList.remove("spin");
        }, { once: true });
    });
});

/* ------------------------------------------
    Keep the icon tray below the site title
    (the title's height is responsive, so this
    is measured rather than hardcoded)
------------------------------------------ */
const siteTitleEl = document.querySelector('.nav-bar');
const iconTrayEl = document.querySelector('.icon-tray');

function positionIconTray() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return; // mobile icon-tray flows normally, not fixed
    if (!siteTitleEl || !iconTrayEl) return;

    const gap = 50;
    iconTrayEl.style.top = (siteTitleEl.getBoundingClientRect().bottom + gap) + 'px';
}

positionIconTray();
window.addEventListener('resize', positionIconTray);
window.addEventListener('load', positionIconTray);