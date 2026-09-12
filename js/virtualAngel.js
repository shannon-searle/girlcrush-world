// ============================================================
// Config — media paths and timing for the virtual angel card
// ============================================================
const angelConfig = {
    sound: "./media/audio/britneeey-sound-effect.mp3",
    cards: [
        "./media/virtual-angel/GRETA.mp4",
        "./media/virtual-angel/MIK.mp4",
        "./media/virtual-angel/MUM.mp4",
        "./media/virtual-angel/OSCAR.mp4",
        "./media/virtual-angel/SANTANA.mp4",
    ],
    flipDelayMs: 5000,
};

const virtualAngelIcon = document.querySelector('button[data-panel="virtual-angel-popup"]');
const angelCard = document.getElementById('angel-card');
const britneyBackground = document.getElementById('britney-background');
const divineMessage = document.getElementById('divine-message');
const audio = new Audio(angelConfig.sound);
const card = document.querySelector(".card");

let flipTimeout = 0;

function showAngelCard() {
    angelCard.src = angelConfig.cards[Math.floor(Math.random() * angelConfig.cards.length)];

    angelCard.oncanplay = () => {
        angelCard.play();
        angelCard.oncanplay = null;
    };

    angelCard.load();

    flipTimeout = setTimeout(() => {
        card.classList.toggle("flipped");
        divineMessage.style.display = "none";
    }, angelConfig.flipDelayMs);
}

function resetAngelCard() {
    clearTimeout(flipTimeout);
    card.classList.remove("flipped");
    divineMessage.style.display = "block";
    audio.pause();
    audio.currentTime = 0;
}

function openVirtualAngel() {
    audio.currentTime = 0;
    audio.play();
    showAngelCard();
}


window.openVirtualAngel = openVirtualAngel;
window.resetAngelCard = resetAngelCard;
