const rsvp = document.getElementById('rsvp');
const media = document.getElementById('strawberry-wedding-media');

rsvp.addEventListener('pointerup', (e) => {
    media.src = './media/strawberry-wedding/strawberry-wedding.gif';
    rsvp.style.display = 'none';
});

function resetMedia() {
    media.src = './media/strawberry-wedding/wedding-title-screen.gif';
    rsvp.style.display = 'flex';
}