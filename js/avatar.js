/* ------------------------------------------
    Avatar dress-up: click a swatch, swap that layer's image
------------------------------------------ */
document.querySelectorAll('[data-layer]').forEach(button => {
    button.addEventListener('click', function () {
        document.getElementById(this.dataset.layer).src = this.dataset.src;
    });
});

/* ------------------------------------------
    Randomize / reset — built from the swatches already in the markup,
    so a new outfit piece just needs a button added there
------------------------------------------ */
const avatarLayerOptions = {};
document.querySelectorAll('[data-layer]').forEach(button => {
    (avatarLayerOptions[button.dataset.layer] ??= []).push(button.dataset.src);
});

const avatarLayerDefaults = {};
document.querySelectorAll('.avatar-layer').forEach(img => {
    avatarLayerDefaults[img.id] = img.src;
});

document.getElementById('avatar-randomize')?.addEventListener('click', () => {
    Object.entries(avatarLayerOptions).forEach(([layerId, options]) => {
        const layer = document.getElementById(layerId);
        if (layer) layer.src = options[Math.floor(Math.random() * options.length)];
    });
});

document.getElementById('avatar-reset')?.addEventListener('click', () => {
    Object.entries(avatarLayerDefaults).forEach(([layerId, src]) => {
        document.getElementById(layerId).src = src;
    });
});
