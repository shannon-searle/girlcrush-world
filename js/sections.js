/* ------------------------------------------
    Sections — home, about me, girlcrush world and music all live in home.html.
    The URL hash (#music) names the current section, so links, refresh and the
    back button work without a page load.
------------------------------------------ */

const sectionElements = [...document.querySelectorAll('[data-section]')];
const sectionNames = sectionElements.map(section => section.dataset.section);
const sectionLinks = document.querySelectorAll('.nav-bar a[href^="#"], .start-menu-item[href^="#"]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// these keep running while hidden (space bar jumps, angel audio), so leaving home closes them
const TASKBAR_BUTTON_BY_POPUP_TO_CLOSE_ON_LEAVE = {
    'cloud-jumper-popup': 'cloud-jumper-button',
    'virtual-angel-popup': 'virtual-angel-button',
};

const videosPausedOnLeaveBySection = new Map();

// set by the inline script in <head> before the body rendered
let currentSectionName = document.documentElement.dataset.currentSection;

function getSectionElement(name) {
    return sectionElements.find(section => section.dataset.section === name);
}

function getSectionNameFromHash() {
    const requestedSection = window.location.hash.slice(1);
    return sectionNames.includes(requestedSection) ? requestedSection : 'home';
}

function pauseVideosIn(name) {
    const playingVideos = [...getSectionElement(name).querySelectorAll('video')].filter(video => !video.paused);
    playingVideos.forEach(video => video.pause());
    videosPausedOnLeaveBySection.set(name, playingVideos);
}

function playVideosIn(name) {
    const section = getSectionElement(name);
    const videosToPlay = new Set([
        ...(videosPausedOnLeaveBySection.get(name) ?? []),
        ...section.querySelectorAll('video[autoplay], video[data-play-on-enter]'),
    ]);
    // play() rejects if the browser blocks it; the video just stays paused
    videosToPlay.forEach(video => video.play().catch(() => {}));
}

function closePopupsThatRunInBackground() {
    Object.entries(TASKBAR_BUTTON_BY_POPUP_TO_CLOSE_ON_LEAVE).forEach(([popupId, taskbarButtonId]) => {
        if (!document.getElementById(popupId).classList.contains('open')) return;
        closePanel(popupId);
        taskbarClose(taskbarButtonId);
    });
}

function leaveSection(name) {
    pauseVideosIn(name);
    if (name === 'home') closePopupsThatRunInBackground();
}

function applySection(name) {
    document.documentElement.dataset.currentSection = name;
    document.title = getSectionElement(name).dataset.title;
    sectionLinks.forEach(link => {
        link.classList.toggle('current', link.getAttribute('href') === `#${name}`);
    });
}

function showSection(name) {
    if (name === currentSectionName) return;

    leaveSection(currentSectionName);
    currentSectionName = name;

    if (document.startViewTransition && !prefersReducedMotion.matches) {
        document.startViewTransition(() => applySection(name));
    } else {
        applySection(name);
    }

    playVideosIn(name);
}

window.addEventListener('hashchange', () => showSection(getSectionNameFromHash()));

applySection(currentSectionName);
playVideosIn(currentSectionName);

// once the current section has loaded, fetch the other sections' videos so they start straight away
window.addEventListener('load', () => {
    document.querySelectorAll('video[data-play-on-enter]').forEach(video => {
        video.preload = 'auto';
    });
});
