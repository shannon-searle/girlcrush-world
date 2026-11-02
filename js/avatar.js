/* ------------------------------------------
    Avatar dress-up
------------------------------------------ */
const avatarLayerOptions = {};
document.querySelectorAll('[data-layer]').forEach(button => {
    (avatarLayerOptions[button.dataset.layer] ??= []).push(button.dataset.src);
});

const avatarLayerDefaults = {};
document.querySelectorAll('.avatar-layer').forEach(img => {
    avatarLayerDefaults[img.id] = img.src;
});

const avatarCyclers = [];

document.querySelectorAll('.control-swatches').forEach(swatches => {
    const buttons = [...swatches.querySelectorAll('button')];
    const layerId = buttons[0].dataset.layer;
    const layer = document.getElementById(layerId);
    let index = 0;

    function show(i) {
        index = (i + buttons.length) % buttons.length;
        buttons.forEach((b, idx) => b.classList.toggle('active', idx === index));
        layer.src = buttons[index].dataset.src;
    }

    function syncToCurrentSrc() {
        const i = buttons.findIndex(b => layer.src.endsWith(b.dataset.src));
        show(i >= 0 ? i : 0);
    }

    const cycler = swatches.closest('.control-cycler');
    cycler.querySelector('.control-prev').addEventListener('click', () => show(index - 1));
    cycler.querySelector('.control-next').addEventListener('click', () => show(index + 1));

    syncToCurrentSrc();
    avatarCyclers.push(syncToCurrentSrc);
});

document.getElementById('avatar-randomize')?.addEventListener('click', () => {
    Object.entries(avatarLayerOptions).forEach(([layerId, options]) => {
        const layer = document.getElementById(layerId);
        if (layer) layer.src = options[Math.floor(Math.random() * options.length)];
    });
    avatarCyclers.forEach(sync => sync());
});

document.getElementById('avatar-reset')?.addEventListener('click', () => {
    Object.entries(avatarLayerDefaults).forEach(([layerId, src]) => {
        document.getElementById(layerId).src = src;
    });
    avatarCyclers.forEach(sync => sync());
});
