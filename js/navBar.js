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

const siteTitleEl = document.querySelector('.nav-bar');
const desktopIconsEl = document.querySelector('.desktop-icons');

function positionDesktopIcons() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return;
    if (!siteTitleEl || !desktopIconsEl) return;

    const gap = 50;
    desktopIconsEl.style.top = (siteTitleEl.getBoundingClientRect().bottom + gap) + 'px';
}

positionDesktopIcons();
window.addEventListener('resize', positionDesktopIcons);
window.addEventListener('load', positionDesktopIcons);

// measured rather than hardcoded since the title's height is responsive
const siteTitleImgEl = document.querySelector('.site-title');

function updateMobilePopupTop() {
    if (window.innerWidth > MOBILE_BREAKPOINT || !siteTitleImgEl) return;
    const rect = siteTitleImgEl.getBoundingClientRect();
    const marginBottom = parseFloat(getComputedStyle(siteTitleImgEl).marginBottom) || 0;
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-popup-gap')) || 12;
    document.documentElement.style.setProperty('--mobile-popup-top', (rect.bottom + marginBottom + gap) + 'px');
}

updateMobilePopupTop();
window.addEventListener('resize', updateMobilePopupTop);
window.addEventListener('load', updateMobilePopupTop);