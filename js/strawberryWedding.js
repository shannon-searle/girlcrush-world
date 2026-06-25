const rsvp = document.getElementById('rsvp');
const titleScreen = document.getElementById('wedding-title-screen');
const wedding = document.getElementById('wedding');


rsvp.addEventListener('pointerup', () => {
    wedding.play();
    wedding.classList.add('active');
    titleScreen.classList.remove('active');
    rsvp.classList.add("hidden");

});

function resetMedia() {
    wedding.classList.remove('active');
    titleScreen.classList.add('active');
    rsvp.classList.remove("hidden");
}