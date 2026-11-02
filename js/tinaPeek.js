const MIN_INTERVAL_MS = 1000;
const MAX_INTERVAL_MS = 100000;
const PEEK_DURATION_MS = 2000;

const tinaPeek = document.getElementById('tina-peek');

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function scheduleNextPeek() {
    setTimeout(() => {
        tinaPeek.classList.add('peek-out');
        setTimeout(() => {
            tinaPeek.classList.remove('peek-out');
            scheduleNextPeek();
        }, PEEK_DURATION_MS);
    }, randomBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS));
}

if (tinaPeek) scheduleNextPeek();
