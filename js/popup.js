
/* ------------------------------------------
    Popup helpers
------------------------------------------ */
function openPopup(id) {
    document.getElementById(id).classList.add('open');

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

function closePopup(id) {
    const popup = document.getElementById(id);
    popup.classList.remove('open');
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