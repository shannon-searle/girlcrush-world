const TONI_IMAGE_BY_ACTION = {
    likes: 'media/about-me/toni-likes.png',
    dislikes: 'media/about-me/toni-dislikes.png',
    dance: 'media/about-me/toni-dance.png',
    'make-song': 'media/about-me/toni-make-song.png',
    'confess-love': 'media/about-me/toni-confess-love.png',
    explode: 'media/about-me/toni-explode.png',
};

const PANEL_ID_BY_ACTION = {
    likes: 'likes-panel',
    dislikes: 'dislikes-panel',
    'make-song': 'make-song-panel',
};

const toniImage = document.querySelector('.about-me-toni');
const aboutMeButtons = document.querySelectorAll('.about-me-button');

Object.values(TONI_IMAGE_BY_ACTION).forEach((src) => {
    new Image().src = src;
});

function togglePanelFor(action) {
    const panel = document.getElementById(PANEL_ID_BY_ACTION[action]);
    panel?.classList.toggle('is-visible');
}

aboutMeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const toniImageForAction = TONI_IMAGE_BY_ACTION[action];
        if (toniImageForAction) toniImage.src = toniImageForAction;
        togglePanelFor(action);
    });
});
