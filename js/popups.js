// ============================================================
// Config — fixed values for the popup stacking system
// ============================================================
const popupConfig = {
    baseZIndex: 2,
};

// ============================================================
// State — the mutable z-index counter
// ============================================================
const popupState = {
    tabCounter: 2,
};

/* ------------------------------------------
    Panel helpers
------------------------------------------ */

function openPanel(id) {
    const panel = document.getElementById(id);
    if (panel.classList.contains('open')) return;

    const skipReparent = panel.classList.contains('popup');
    if (!skipReparent && panel.parentElement === document.getElementById("popup-container")) {
        document.getElementById("popup-container").prepend(panel);
    }
    panel.classList.add('open');

    if (panel.classList.contains('popup')) {
        incrementZIndex(id);
    }

    // per-panel side effects
    if (id === 'guestbook') {
        document.getElementById('guestbook-button')?.classList.add('open');
    }
    if (id === 'virtual-angel-popup') {
        window.openVirtualAngel();
    }
    if (panel.classList.contains('item-carousel')) {
        window.resetItemCarousel(id);
    }
    if (id === 'whats-in-my-bag-popup') {
        window.startBagPulse();
    }
}

function closePanel(id) {
    const panel = document.getElementById(id);
    if (!panel.classList.contains('open')) return;

    panel.classList.remove('open');
    if (id !== 'guestbook') {
        panel.style.transform = 'translate(0px, 0px)'; // reset drag position
    }

    if (panel.classList.contains('popup')) {
        decrementPopups();
    }

    // per-panel side effects
    if (id === 'guestbook') {
        document.getElementById('guestbook-button')?.classList.remove('open');
    }
    if (id === 'virtual-angel-popup') {
        window.resetAngelCard();
    }
    if (id === 'cloud-jumper-popup') {
        window.closeCloudJumper();
    }
    if (id === 'strawberry-wedding-popup') {
        window.resetMedia();
    }
    if (id === 'whats-in-my-bag-popup') {
        window.stopBagPulse();
    }
}

function togglePanel(id) {
    const panel = document.getElementById(id);
    if (panel.classList.contains('open')) {
        closePanel(id);
    } else {
        openPanel(id);
    }
}

/* ------------------------------------------
    Stacking logic
------------------------------------------ */
function incrementZIndex(id) {
    const popup = document.getElementById(id);
    popupState.tabCounter += 1;
    popup.style.zIndex = popupState.tabCounter;
}

function getZ(el) {
    const z = getComputedStyle(el).zIndex;
    return z === 'auto' ? 0 : parseInt(z, 10);
}

function decrementPopups() {
    popupState.tabCounter -= 1;
    const popups = [...document.querySelectorAll('.popup.open')];

    popups.sort((a, b) => getZ(a) - getZ(b));

    popups.forEach((popup, i) => {
        popup.style.zIndex = popupConfig.baseZIndex + i;
    });
}

function restackPopups(frontPopup) {
    const popups = [...document.querySelectorAll('.popup.open')]
        .filter(popup => popup !== frontPopup);

    popups.sort((a, b) => getZ(a) - getZ(b));

    popups.forEach((popup, i) => {
        popup.style.zIndex = popupConfig.baseZIndex + i;
    });
    frontPopup.style.zIndex = popupState.tabCounter;
}

function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

function isBlockedByOpenPanel(targetId) {
    const target = document.getElementById(targetId);
    if (target?.classList.contains('item-carousel')) return false;

    const openPanelEl = document.querySelector('.popup.open, #guestbook.open, #start-menu.open');
    return !!openPanelEl && openPanelEl.id !== targetId;
}

// add listener for panel buttons
document.querySelectorAll('[data-panel]').forEach(button => {
    button.addEventListener('click', function() {
        const panelId = this.dataset.panel;

        if (!panelId) return;
        if (isMobile() && isBlockedByOpenPanel(panelId)) return;

        if (panelId === 'guestbook') {
            togglePanel('guestbook');
            return;
        }

        const taskbarId = this.dataset.taskbar;
        const wasOpen = document.getElementById(panelId).classList.contains('open');
        togglePanel(panelId);
        if (taskbarId) {
            wasOpen ? taskbarClose(taskbarId) : taskbarOpen(taskbarId);
        }
    });
});

// close panel
document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', function () {
        const panelId   = this.dataset.close;
        const menuId    = this.dataset.closemenu;
        const closeAlso = this.dataset.closeAlso;

        if (!panelId) return;

        closePanel(panelId);
        if (menuId)    taskbarClose(menuId);
        if (closeAlso) closeAlso.split(',').forEach(id => closePanel(id.trim()));
    });
});



/* ------------------------------------------
    Bring a popup to the front when clicked
------------------------------------------ */
document.getElementById('popup-container').addEventListener('mousedown', (e) => {
    const popup = e.target.closest('.popup.open');
    if (!popup) return;
    if (popup.style.zIndex !== popupState.tabCounter.toString()) {
        restackPopups(popup);
    }
});

/* ------------------------------------------
    Draggable popups (drag by titlebar only)
------------------------------------------ */
function makeDraggable(popup) {
    let offsetX = 0, offsetY = 0;
    let startX  = 0, startY  = 0;

    popup.addEventListener('mousedown', function (e) {
        if (!e.target.closest('.popup-titlebar')) return;

        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        if (popup.style.zIndex !== popupState.tabCounter.toString()) {
            restackPopups(popup);
        }

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup',   stopDrag);
    });

    function onDrag(e) {
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        popup.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    function stopDrag() {
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup',   stopDrag);
    }
}

// Apply draggable to specific popups
makeDraggable(document.getElementById('welcome-popup'));
makeDraggable(document.getElementById('avatar-popup'));
makeDraggable(document.getElementById('piano-popup'));
makeDraggable(document.getElementById('cloud-jumper-popup'));
makeDraggable(document.getElementById('virtual-angel-popup'));
makeDraggable(document.getElementById('webmaster-popup'));
makeDraggable(document.getElementById('strawberry-wedding-popup'));
makeDraggable(document.getElementById('whats-in-my-bag-popup'));
