const virtualAngelIcon = document.querySelector('button[data-popup="virtual-angel-popup"]');
const angelCard = document.getElementById('angel-card');
const britneyBackground = document.getElementById('britney-background');
const divineMessage = document.getElementById('divine-message');
const angelSounds = ["./audio/britney-sound2.mp3", "./audio/britney-sound1.mp3"];
const angelCards = ["./images/virtual-angel/GRETA.gif", "./images/virtual-angel/MIK.gif",
                    "./images/virtual-angel/MUM.gif", "./images/virtual-angel/OSCAR.gif",
                    "./images/virtual-angel/SANTANA.gif"]
const card = document.querySelector(".card");


function showAngelCard() {
    angelCard.src = angelCards[Math.floor(Math.random() * angelCards.length)]
    card.classList.toggle("flipped");
    divineMessage.style.display = "none";
    
}

function resetAngelCard() {
    card.classList.remove("flipped");
    divineMessage.style.display = "block";
}

document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-close='virtual-angel-popup']");
    if (!closeBtn) return;

    resetAngelCard();
});

let currentSound = 0;

virtualAngelIcon.addEventListener('pointerdown', (e) => {
    const audio = new Audio(angelSounds[currentSound]);
    audio.currentTime = 0;
    audio.play();

    currentSound = (currentSound + 1) % angelSounds.length;

    setTimeout(() => {
        showAngelCard();
    }, 5000);
});
