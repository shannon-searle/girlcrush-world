const virtualAngelIcon = document.querySelector('button[data-popup="virtual-angel-popup"]');

const angelSounds = ["./audio/britney-sound2.mp3", "./audio/britney-sound1.mp3"];
let currentSound = 0;

virtualAngelIcon.addEventListener('pointerdown', (e) => {
    const audio = new Audio(angelSounds[currentSound]);
    audio.currentTime = 0;
    audio.play();

    currentSound = (currentSound + 1) % angelSounds.length;
});