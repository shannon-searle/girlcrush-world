const NUDGE_INTERVAL_MS = 30000;
const NUDGE_DURATION_MS = 1000;

const guestbookButton = document.getElementById('guestbook-button');

function nudgeGuestbookButton() {
    if (guestbookButton.classList.contains('open')) return;
    guestbookButton.classList.add('nudge');
    setTimeout(() => guestbookButton.classList.remove('nudge'), NUDGE_DURATION_MS);
}

if (guestbookButton) setInterval(nudgeGuestbookButton, NUDGE_INTERVAL_MS);
