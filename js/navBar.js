const navLinks = document.querySelectorAll(".nav-bar a");

navLinks.forEach(link => {
    const star = link.querySelector(".nav-link-star");
    if (!star) return;

    link.addEventListener("mouseenter", () => {
        if (star.classList.contains("spin")) return;

        star.classList.add("spin");

        star.addEventListener("animationend", () => {
            star.classList.remove("spin");
        }, { once: true });
    });
});

// measured rather than hardcoded since the title and nav heights are responsive
const navBarEl = document.querySelector('.nav-bar');

function updateMobilePopupTop() {
    if (window.innerWidth > MOBILE_BREAKPOINT || !navBarEl) return;
    const rect = navBarEl.getBoundingClientRect();
    const marginBottom = parseFloat(getComputedStyle(navBarEl).marginBottom) || 0;
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-popup-gap')) || 12;
    document.documentElement.style.setProperty('--mobile-popup-top', (rect.bottom + marginBottom + gap) + 'px');
}

updateMobilePopupTop();
window.addEventListener('resize', updateMobilePopupTop);
window.addEventListener('load', updateMobilePopupTop);