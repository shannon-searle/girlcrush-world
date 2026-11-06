const TONI_IMAGE_BY_ACTION = {
    likes: 'media/about-me/toni-likes.png',
    dislikes: 'media/about-me/toni-dislikes.png',
    dance: 'media/about-me/toni-dance.png',
    'make-song': 'media/about-me/toni-make-song.png',
    'confess-love': 'media/about-me/toni-confess-love.png',
    explode: 'media/about-me/toni-explode.png',
};

const toniImage = document.querySelector('.about-me-toni');
const aboutMeButtons = document.querySelectorAll('.about-me-button');

Object.values(TONI_IMAGE_BY_ACTION).forEach((src) => {
    new Image().src = src;
});

aboutMeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const toniImageForAction = TONI_IMAGE_BY_ACTION[button.dataset.action];
        if (toniImageForAction) toniImage.src = toniImageForAction;
    });
});
