// Item image carousels — add new ones by keying an entry below to a panel id
const itemCarousels = {
    'ipod-carousel': {
        folder: "./media/base/whats-in-my-bag/ipod-pngs/",
        images: [
            "beatopia.webp",
            "colourmeinkindness.webp",
            "crest.webp",
            "either_or.webp",
            "girl-with-fish.webp",
            "imaginal-disk.webp",
            "love-me.webp",
            "my-love-is-cool.webp",
            "rocket.webp",
            "shed.webp",
            "so-vanilla.webp",
            "softscars.webp",
            "swanlike.webp",
            "tender-buttons.webp",
            "time-n-place.webp",
            "words-from-a-wishing-well.webp",
        ],
        index: 0,
    },
    'camera-carousel': {
        folder: "./media/base/whats-in-my-bag/camera-pngs/",
        images: [
            "alice.webp",
            "cannibalism.webp",
            "coraline.webp",
            "house.webp",
            "obsession.webp",
            "picnic.webp",
            "possibly-in-michigan.webp",
            "storm.webp",
            "twin-peaks.webp",
            "wont-tell.webp",
        ],
        index: 0,
    },
    'ds-carousel': {
        folder: "./media/base/whats-in-my-bag/ds-pngs/",
        images: [
            "DS.webp",
        ],
        index: 0,
    },
    'cards-carousel': {
        folder: "./media/base/whats-in-my-bag/",
        images: [
            "hello-kitty.gif",
        ],
        index: 0,
    },
    'notebook-carousel': {
        folder: "./media/base/whats-in-my-bag/notebook/",
        images: [
            "page1.webp",
            "page2.webp",
            "page3.webp",
            "page4.webp",
            "page5.webp",
        ],
        index: 0,
    },
    'book-carousel': {
        folder: "./media/base/whats-in-my-bag/",
        images: [
            "book-stack-final.webp",
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

let firstImagesPreloaded = false;

function preloadFirstCarouselImages() {
    if (firstImagesPreloaded) return;
    firstImagesPreloaded = true;

    Object.values(itemCarousels).forEach(carousel => {
        const firstImage = new Image();
        firstImage.src = carousel.folder + encodeURIComponent(carousel.images[0]);
    });
}

function resetItemCarousel(panelId) {
    if (!itemCarousels[panelId]) return;

    const img = document.querySelector(`#${panelId} .item-carousel-img`);
    img.classList.remove('loaded');
    img.onload = () => img.classList.add('loaded');
    showCarouselImage(panelId, 0);

    if (img.complete) {
        void img.offsetWidth;
        img.classList.add('loaded');
    }
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

// escape closes it
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.item-carousel.open').forEach(carousel => closePanel(carousel.id));
});

window.resetItemCarousel = resetItemCarousel;
window.preloadFirstCarouselImages = preloadFirstCarouselImages;
