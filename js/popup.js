
let tabCounter = 2; // rework this 
let baseIndex = 2;

/* ------------------------------------------
    Popup helpers
------------------------------------------ */
function openPopup(id) {
    const popup = document.getElementById(id);

    if (!popup.classList.contains('open')) {
        popup.classList.add('open');

        incrementZIndex(id);

        // Also highlight the Start button when the About popup opens
        if (id === 'about-me-popup') {
            document.getElementById('start-button').classList.add('open');
        }
        if (id === 'chatbox-popup') {
            document.getElementById('chatbox-button').classList.add('open');
        }

        if (id === "virtual-angel-popup") {
            window.openVirtualAngel();
        }

        if (id === "cloud-jumper-popup") {
            state.gameWindowOpen = true;
        }
    }
}

function incrementZIndex(id) {
    if (id != 'decor-popup') {
        const popup = document.getElementById(id);
        tabCounter += 1;
        popup.style.zIndex = tabCounter;
    }
}

// decrement popups
function decrementPopups() {
    tabCounter -= 1;
    const popups = [...document.querySelectorAll('.popup.open')]
        .filter(popup => popup.id !== 'decor-popup');

    popups.sort((a, b) =>
        parseInt(getComputedStyle(a).zIndex || 0, 15)
        - parseInt(getComputedStyle(b).zIndex || 0, 15)
    );

    popups.forEach((popup, i) => {
        popup.style.zIndex = baseIndex + i;
    });
}

// restack when touching another popup
function restackPopups(frontPopup) {
    const popups = [...document.querySelectorAll('.popup.open')]
        .filter(popup => (popup.id !== 'decor-popup' && popup !== frontPopup));

    popups.sort((a, b) =>
        parseInt(getComputedStyle(a).zIndex || 0, 15)
        - parseInt(getComputedStyle(b).zIndex || 0, 15)
    );
    popups.forEach((popup, i) => {
        popup.style.zIndex = baseIndex + i;
    });
    frontPopup.style.zIndex = tabCounter;
}

function closePopup(id) {
    const popup = document.getElementById(id);

    if (popup.classList.contains('open')) {
        popup.classList.remove('open');
        decrementPopups();

        popup.style.transform = 'translate(0px, 0px)';  // reset drag position

        if (id === 'about-me-popup') {
            document.getElementById('start-button').classList.remove('open');
        }
        if (id === 'chatbox-popup' ) {
            document.getElementById('chatbox-button').classList.remove('open');
        }
        if (id === "virtual-angel-popup") {
            window.resetAngelCard();
        }
        if (id === "cloud-jumper-popup") {
            window.resetCloudJumper();
            state.gameWindowOpen = false;
        }

        if (id === "strawberry-wedding-popup") {
            window.resetMedia();
        }
    }
}

// add listener for popup buttons
document.querySelectorAll('[data-popup]').forEach(button => {
    button.addEventListener('click', function() {
        const popupId = this.dataset.popup;
        const taskbarId = this.dataset.taskbar;

        if (!popupId) return;

        if (popupId === 'chatbox-popup') {
            const popup = document.getElementById(popupId);
            if (popup.classList.contains('open')) {
                closePopup(popupId);
                return;
            }
        }

        if (popupId === 'about-me-popup') {
            const popup = document.getElementById(popupId);
            if (popup.classList.contains('open')) {
                closePopup('about-me-popup');
                closePopup('likes-popup');
                closePopup('dislikes-popup');
                return;
            }
        }

        openPopup(popupId);
        if (taskbarId) {
            taskbarOpen(taskbarId);
        }
    });
});

// close popup
document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', function () {
        const popupId  = this.dataset.close;
        const menuId   = this.dataset.closemenu;
        const alsoClose = this.dataset.closeAlso;

        if (!popupId) return;

        closePopup(popupId);
        if (menuId)    taskbarClose(menuId);
        if (alsoClose) alsoClose.split(',').forEach(id => closePopup(id.trim()));
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
