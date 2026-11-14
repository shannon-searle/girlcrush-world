const NUDGE_INTERVAL_MS = 15000;
const NUDGE_DURATION_MS = 1000;

const guestbookButton = document.getElementById('guestbook-button');

function nudgeGuestbookButton() {
    guestbookButton.classList.add('nudge');
    setTimeout(() => guestbookButton.classList.remove('nudge'), NUDGE_DURATION_MS);
}

if (guestbookButton) {
    const nudgeTimer = setInterval(nudgeGuestbookButton, NUDGE_INTERVAL_MS);
    guestbookButton.addEventListener('click', () => clearInterval(nudgeTimer), { once: true });
}
