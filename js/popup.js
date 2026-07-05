let tabCounter = 2; // rework this
let baseIndex = 2;

/* ------------------------------------------
    Panel helpers
    Works for every panel (popup or not).
    Stacking behavior (z-index) only applies
    when the panel also carries class="popup".
------------------------------------------ */
function openPanel(id) {
    const panel = document.getElementById(id);
    if (panel.classList.contains('open')) return;

    document.getElementById("popup-container").prepend(panel);
    panel.classList.add('open');

    if (panel.classList.contains('popup')) {
        incrementZIndex(id);
    }

    // per-panel side effects
    if (id === 'about-me-popup') {
        document.getElementById('start-button').classList.add('open');
    }
    if (id === 'chatbox') {
        document.getElementById('chatbox-button').classList.add('open');
    }
    if (id === 'virtual-angel-popup') {
        window.openVirtualAngel();
    }
    if (id === 'cloud-jumper-popup') {
        state.gameWindowOpen = true;
    }
}

function closePanel(id) {
    const panel = document.getElementById(id);
    if (!panel.classList.contains('open')) return;

    panel.classList.remove('open');
    panel.style.transform = 'translate(0px, 0px)'; // reset drag position

    if (panel.classList.contains('popup')) {
        decrementPopups();
    }

    // per-panel side effects
    if (id === 'about-me-popup') {
        document.getElementById('start-button').classList.remove('open');
    }
    if (id === 'chatbox') {
        document.getElementById('chatbox-button').classList.remove('open');
    }
    if (id === 'virtual-angel-popup') {
        window.resetAngelCard();
    }
    if (id === 'cloud-jumper-popup') {
        window.closeCloudJumper();
        state.gameWindowOpen = false;
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
    tabCounter += 1;
    popup.style.zIndex = tabCounter;
}

function getZ(el) {
    const z = getComputedStyle(el).zIndex;
    return z === 'auto' ? 0 : parseInt(z, 10);
}

function decrementPopups() {
    tabCounter -= 1;
    const popups = [...document.querySelectorAll('.popup.open')];

    popups.sort((a, b) => getZ(a) - getZ(b));

    popups.forEach((popup, i) => {
        popup.style.zIndex = baseIndex + i;
    });
}

function restackPopups(frontPopup) {
    const popups = [...document.querySelectorAll('.popup.open')]
        .filter(popup => popup !== frontPopup);

    popups.sort((a, b) => getZ(a) - getZ(b));

    popups.forEach((popup, i) => {
        popup.style.zIndex = baseIndex + i;
    });
    frontPopup.style.zIndex = tabCounter;
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

        if (panelId === 'about-me-popup') {
            const panel = document.getElementById(panelId);
            if (panel.classList.contains('open')) {
                closePanel('about-me-popup');
                closePanel('likes-popup');
                closePanel('dislikes-popup');
                return;
            }
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
    Draggable popups (drag by titlebar only)
------------------------------------------ */
function makeDraggable(popup) {
    let offsetX = 0, offsetY = 0;
    let startX  = 0, startY  = 0;

    popup.addEventListener('mousedown', function (e) {
        if (!e.target.closest('.popup-titlebar')) return;

        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        if (popup.style.zIndex !== tabCounter.toString()) {
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
// makeDraggable(document.getElementById('likes-popup'));
// makeDraggable(document.getElementById('dislikes-popup'));
makeDraggable(document.getElementById('image-gallery-popup'));
makeDraggable(document.getElementById('my-music-popup'));
makeDraggable(document.getElementById('cloud-jumper-popup'));
makeDraggable(document.getElementById('virtual-angel-popup'));
makeDraggable(document.getElementById('webmaster-popup'));
makeDraggable(document.getElementById('strawberry-wedding-popup'));