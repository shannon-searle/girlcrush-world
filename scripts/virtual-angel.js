const virtualAngelIcon = document.querySelector('button[data-popup="virtual-angel-popup"]');
const angelCard = document.getElementById('angel-card');
const britneyBackground = document.getElementById('britney-background');
const divineMessage = document.getElementById('divine-message');
const angelSound = "./audio/britneeey-sound-effect.mp3";
const audio = new Audio(angelSound);
const angelCards = ["./images/virtual-angel/GRETA.gif", "./images/virtual-angel/MIK.gif",
                    "./images/virtual-angel/MUM.gif", "./images/virtual-angel/OSCAR.gif",
                    "./images/virtual-angel/SANTANA.gif"]
const card = document.querySelector(".card");


function showAngelCard() {
    angelCard.src = angelCards[Math.floor(Math.random() * angelCards.length)]
    flipTimeout = setTimeout(() => {
        card.classList.toggle("flipped");
        divineMessage.style.display = "none";
    }, 5000);
}

function resetAngelCard() {
    clearTimeout(flipTimeout);
    card.classList.remove("flipped");
    divineMessage.style.display = "block";
    audio.pause();
    audio.currentTime = 0;
}

document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-close='virtual-angel-popup']");
    if (!closeBtn) return;

    resetAngelCard();
});


virtualAngelIcon.addEventListener('pointerdown', (e) => {
    audio.currentTime = 0;
    audio.play();
    showAngelCard();
    currentSound = (currentSound + 1) % angelSounds.length;
});
