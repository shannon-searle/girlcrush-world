// ============================================================
// Config — media paths and timing for the virtual angel card
// ============================================================
const angelConfig = {
    sound: "./media/base/audio/britneeey-sound-effect.mp3",
    cards: [
        "./media/base/virtual-angel/GRETA.mp4",
        "./media/base/virtual-angel/MIK.mp4",
        "./media/base/virtual-angel/MUM.mp4",
        "./media/base/virtual-angel/OSCAR.mp4",
        "./media/base/virtual-angel/SANTANA.mp4",
    ],
    flipDelayMs: 5000,
    autoCloseMs: 15000,
};

const angelCard = document.getElementById('angel-card');
const divineMessage = document.getElementById('divine-message');
const audio = new Audio(angelConfig.sound);
const card = document.querySelector(".card");

let flipTimeout = 0;
let autoCloseTimeout = 0;

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
    clearTimeout(autoCloseTimeout);
    card.classList.remove("flipped");
    divineMessage.style.display = "block";
    audio.pause();
    audio.currentTime = 0;
}

function openVirtualAngel() {
    audio.currentTime = 0;
    audio.play();
    showAngelCard();

    autoCloseTimeout = setTimeout(() => {
        closePanel('virtual-angel-popup');
        taskbarClose('virtual-angel-button');
    }, angelConfig.autoCloseMs);
}


window.openVirtualAngel = openVirtualAngel;
window.resetAngelCard = resetAngelCard;
