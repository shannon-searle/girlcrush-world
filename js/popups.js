/* ------------------------------------------
    Panels
------------------------------------------ */

const PANEL_SIDE_EFFECTS = {
    'guestbook': {
        onOpen: () => document.getElementById('guestbook-button')?.classList.add('open'),
        onClose: () => document.getElementById('guestbook-button')?.classList.remove('open'),
    },
    'virtual-angel-popup': {
        onOpen: () => window.openVirtualAngel(),
        onClose: () => window.resetAngelCard(),
    },
    'whats-in-my-bag-popup': {
        onOpen: () => {
            window.preloadFirstCarouselImages();
            window.startBagPulse();
        },
        onClose: () => window.stopBagPulse(),
    },
    'cloud-jumper-popup': {
        onClose: () => window.closeCloudJumper(),
    },
    'strawberry-wedding-popup': {
        onClose: () => window.resetMedia(),
    },
};

function isPopup(panel) {
    return panel.classList.contains('popup');
}

function openPanel(id) {
    const panel = document.getElementById(id);
    if (panel.classList.contains('open')) return;

    panel.classList.add('open');
    if (isPopup(panel)) bringToFront(panel);
    if (panel.classList.contains('item-carousel')) window.resetItemCarousel(id);
    PANEL_SIDE_EFFECTS[id]?.onOpen?.();
}

function closePanel(id) {
    const panel = document.getElementById(id);
    if (!panel.classList.contains('open')) return;

    panel.classList.remove('open');
    if (isPopup(panel)) resetDragPosition(panel);
    PANEL_SIDE_EFFECTS[id]?.onClose?.();
}

function togglePanel(id) {
    const panel = document.getElementById(id);
    if (panel.classList.contains('open')) closePanel(id);
    else openPanel(id);
}

/* ------------------------------------------
    Popups only — stacking and dragging
------------------------------------------ */

let topPopupZIndex = 2;

function bringToFront(popup) {
    if (popup.style.zIndex === String(topPopupZIndex)) return;
    topPopupZIndex += 1;
    popup.style.zIndex = topPopupZIndex;
}

const dragOffsetByPopup = new Map();

function resetDragPosition(popup) {
    dragOffsetByPopup.set(popup, { x: 0, y: 0 });
    popup.style.transform = '';
}

function makeDraggable(popup) {
    let pointerStartX = 0;
    let pointerStartY = 0;

    function onDrag(e) {
        const offset = { x: e.clientX - pointerStartX, y: e.clientY - pointerStartY };
        dragOffsetByPopup.set(popup, offset);
        popup.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
    }

    function stopDrag() {
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    popup.addEventListener('mousedown', (e) => {
        bringToFront(popup);
        if (!e.target.closest('.popup-titlebar')) return;

        const offset = dragOffsetByPopup.get(popup) ?? { x: 0, y: 0 };
        pointerStartX = e.clientX - offset.x;
        pointerStartY = e.clientY - offset.y;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
    });
}

document.querySelectorAll('.popup').forEach(makeDraggable);

/* ------------------------------------------
    Buttons that open and close panels
------------------------------------------ */

function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

function isBlockedByOpenPanel(targetId) {
    if (document.getElementById(targetId)?.classList.contains('item-carousel')) return false;
    const openPanelEl = document.querySelector('.popup.open, #guestbook.open, #start-menu.open');
    return !!openPanelEl && openPanelEl.id !== targetId;
}

document.querySelectorAll('[data-panel]').forEach(button => {
    button.addEventListener('click', () => {
        const panelId = button.dataset.panel;
        if (isMobile() && isBlockedByOpenPanel(panelId)) return;

        togglePanel(panelId);

        const taskbarId = button.dataset.taskbar;
        if (!taskbarId) return;
        if (document.getElementById(panelId).classList.contains('open')) taskbarOpen(taskbarId);
        else taskbarClose(taskbarId);
    });
});

document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => {
        closePanel(button.dataset.close);
        if (button.dataset.closemenu) taskbarClose(button.dataset.closemenu);
    });
});
