/* ------------------------------------------
    Sections
------------------------------------------ */

const sectionElements = [...document.querySelectorAll('[data-section]')];
const sectionNames = sectionElements.map(section => section.dataset.section);
const sectionLinks = document.querySelectorAll('.nav-bar a[href^="/home"], .start-menu-item[href^="/home"]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const TASKBAR_BUTTON_BY_POPUP_TO_CLOSE_ON_LEAVE = {
    'cloud-jumper-popup': 'cloud-jumper-button',
    'virtual-angel-popup': 'virtual-angel-button',
};

const videosPausedOnLeaveBySection = new Map();

let currentSectionName = document.documentElement.dataset.currentSection;

function getSectionElement(name) {
    return sectionElements.find(section => section.dataset.section === name);
}

function getSectionNameFromPath(path) {
    const requestedSection = path.match(/^\/home\/([^/]+)\/?$/)?.[1];
    return sectionNames.includes(requestedSection) ? requestedSection : 'home';
}

function getPathForSection(name) {
    return name === 'home' ? '/home' : `/home/${name}`;
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
        link.classList.toggle('current', link.getAttribute('href') === getPathForSection(name));
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

function isPlainLeftClick(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

sectionLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        if (!isPlainLeftClick(event)) return;
        event.preventDefault();

        const name = getSectionNameFromPath(link.getAttribute('href'));
        if (name !== currentSectionName) history.pushState(null, '', getPathForSection(name));
        showSection(name);
    });
});

window.addEventListener('popstate', () => showSection(getSectionNameFromPath(location.pathname)));

applySection(currentSectionName);
playVideosIn(currentSectionName);

window.addEventListener('load', () => {
    document.querySelectorAll('video[data-play-on-enter]').forEach(video => {
        video.preload = 'auto';
    });
});
