function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

const menuButton = document.getElementById('start-button');
const startMenu = document.getElementById('start-menu');

function openStartMenu() {
    startMenu.classList.add('open');
    menuButton.classList.add('open');
}

function closeStartMenu() {
    startMenu.classList.remove('open');
    menuButton.classList.remove('open');
}

function toggleStartMenu() {
    if (startMenu.classList.contains('open')) {
        closeStartMenu();
    } else {
        openStartMenu();
    }
}

menuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
});

document.getElementById('start-menu-close').addEventListener('click', closeStartMenu);

// clicking a menu item closes the start menu behind it
startMenu.querySelectorAll('[data-panel]').forEach(item => {
    item.addEventListener('click', closeStartMenu);
});

// click anywhere outside the menu/button closes it
document.addEventListener('click', (e) => {
    if (!startMenu.classList.contains('open')) return;
    if (e.target.closest('#start-menu') || e.target.closest('#start-button')) return;
    closeStartMenu();
});

// escape closes it
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeStartMenu();
});
