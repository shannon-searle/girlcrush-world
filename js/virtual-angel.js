const virtualAngelIcon = document.querySelector('button[data-popup="virtual-angel-popup"]');
const angelCard = document.getElementById('angel-card');
const britneyBackground = document.getElementById('britney-background');
const divineMessage = document.getElementById('divine-message');
const angelSound = "./media/audio/britneeey-sound-effect.mp3";
const audio = new Audio(angelSound);
const angelCards = ["./media/virtual-angel/GRETA.mp4", "./media/virtual-angel/MIK.mp4",
                    "./media/virtual-angel/MUM.mp4", "./media/virtual-angel/OSCAR.mp4",
                    "./media/virtual-angel/SANTANA.mp4"]
const card = document.querySelector(".card");

let flipTimeout = 0;

function showAngelCard() {
    angelCard.src = angelCards[Math.floor(Math.random() * angelCards.length)]
    angelCard.pl
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

function openVirtualAngel() {
    audio.currentTime = 0;
    audio.play();
    showAngelCard();
}


window.openVirtualAngel = openVirtualAngel;
window.resetAngelCard = resetAngelCard;
