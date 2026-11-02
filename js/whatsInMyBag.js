const PULSE_DURATION = 2000;
const PAUSE_DURATION = 1000;

const bagItems = [...document.querySelectorAll('#whats-in-my-bag-popup .bag-item')];
let bagPulseIndex = 0;
let bagPulseTimeoutId = null;

function bagPulseStep() {
    const item = bagItems[bagPulseIndex];
    item.classList.add('pulse');

    bagPulseTimeoutId = setTimeout(() => {
        item.classList.remove('pulse');
        bagPulseIndex = (bagPulseIndex + 1) % bagItems.length;
        bagPulseTimeoutId = setTimeout(bagPulseStep, PAUSE_DURATION);
    }, PULSE_DURATION);
}

function startBagPulse() {
    if (!bagItems.length || !isMobile() || bagPulseTimeoutId) return;
    bagPulseIndex = 0;
    bagPulseStep();
}

function stopBagPulse() {
    clearTimeout(bagPulseTimeoutId);
    bagPulseTimeoutId = null;
    bagItems.forEach(item => item.classList.remove('pulse'));
}

window.startBagPulse = startBagPulse;
window.stopBagPulse = stopBagPulse;
