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
    Works for every panel (popup or not).
    Stacking behavior (z-index) only applies
    when the panel also carries class="popup".
------------------------------------------ */
function openPanel(id) {
    const panel = document.getElementById(id);
    if (panel.classList.contains('open')) return;

    // nested panels (e.g. an item-carousel living inside another popup)
    // stay put — only reparent top-level panels to bring them to the front
    if (panel.parentElement === document.getElementById("popup-container")) {
        document.getElementById("popup-container").prepend(panel);
    }
    panel.classList.add('open');

    if (panel.classList.contains('popup')) {
        incrementZIndex(id);
    }

    // per-panel side effects
    if (id === 'chatbox') {
        document.getElementById('chatbox-button')?.classList.add('open');
    }
    if (id === 'virtual-angel-popup') {
        window.openVirtualAngel();
    }
    if (panel.classList.contains('item-carousel')) {
        window.resetItemCarousel(id);
    }
}

function closePanel(id) {
    const panel = document.getElementById(id);
    if (!panel.classList.contains('open')) return;

    panel.classList.remove('open');
    if (id !== 'chatbox') {
        panel.style.transform = 'translate(0px, 0px)'; // reset drag position
    }

    if (panel.classList.contains('popup')) {
        decrementPopups();
    }

    // per-panel side effects
    if (id === 'chatbox') {
        document.getElementById('chatbox-button')?.classList.remove('open');
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
    Only ever touches elements with class="popup"
    (chatbox/decor don't carry it, so they
    never enter this code at all).
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

// add listener for panel buttons
document.querySelectorAll('[data-panel]').forEach(button => {
    button.addEventListener('click', function() {
        const panelId = this.dataset.panel;
        const taskbarId = this.dataset.taskbar;

        if (!panelId) return;

        if (panelId === 'chatbox') {
            togglePanel('chatbox');
            return;
        }

        openPanel(panelId);
        if (taskbarId) {
            taskbarOpen(taskbarId);
        }
    });
});

// close panel
document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', function () {
        const panelId  = this.dataset.close;
        const menuId   = this.dataset.closemenu;
        const alsoClose = this.dataset.closeAlso;

        if (!panelId) return;

        closePanel(panelId);
        if (menuId)    taskbarClose(menuId);
        if (alsoClose) alsoClose.split(',').forEach(id => closePanel(id.trim()));
    });
});



/* ------------------------------------------
    Bring a popup to the front when clicked
    anywhere inside it (not just the titlebar)
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
makeDraggable(document.getElementById('things-i-love-popup'));
