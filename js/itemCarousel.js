// Item image carousels — add new ones by keying an entry below to a panel id
const itemCarousels = {
    'ipod-carousel': {
        folder: "./media/base/whats-in-my-bag/ipod-pngs/",
        images: [
            "beatopia.png",
            "colourmeinkindness.png",
            "crest.png",
            "either_or.png",
            "girl with fish.png",
            "imaginal disk.png",
            "love me.png",
            "my love is cool.png",
            "rocket.png",
            "shed.png",
            "so vanilla.png",
            "softscars.png",
            "swanlike.png",
            "tender buttons.png",
            "time n place.png",
            "words from a wishing well.png",
        ],
        index: 0,
    },
    'camera-carousel': {
        folder: "./media/base/whats-in-my-bag/camera-pngs/",
        images: [
            "alice.png",
            "cecelia-condit.png",
            "house.png",
            "obsession.png",
            "picnic.png",
            "slayyyter.png",
            "twin-peaks.png",
            "yung-lean.png",
        ],
        index: 0,
    },
    'ds-carousel': {
        folder: "./media/base/whats-in-my-bag/ds-pngs/",
        images: [
            "DS.png",
        ],
        index: 0,
    },
};

function showCarouselImage(panelId, index) {
    const carousel = itemCarousels[panelId];
    if (!carousel) return;

    carousel.index = (index + carousel.images.length) % carousel.images.length;

    const img = document.querySelector(`#${panelId} .item-carousel-img`);
    img.src = carousel.folder + encodeURIComponent(carousel.images[carousel.index]);
}

function resetItemCarousel(panelId) {
    if (!itemCarousels[panelId]) return;
    showCarouselImage(panelId, 0);
}

document.querySelectorAll('.item-carousel-next').forEach(button => {
    button.addEventListener('click', () => {
        const panelId = button.closest('.item-carousel').id;
        const carousel = itemCarousels[panelId];
        if (!carousel) return;
        showCarouselImage(panelId, carousel.index + 1);
    });
});

document.querySelectorAll('.item-carousel-prev').forEach(button => {
    button.addEventListener('click', () => {
        const panelId = button.closest('.item-carousel').id;
        const carousel = itemCarousels[panelId];
        if (!carousel) return;
        showCarouselImage(panelId, carousel.index - 1);
    });
});

// clicking outside the enlarged image closes it (no close button)
document.querySelectorAll('.item-carousel').forEach(carousel => {
    carousel.addEventListener('click', (e) => {
        if (e.target === carousel) {
            closePanel(carousel.id);
        }
    });
});

window.resetItemCarousel = resetItemCarousel;
