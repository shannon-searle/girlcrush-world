const virtualAngelIcon = document.querySelector('button[data-popup="virtual-angel-popup"]');
const angelCard = document.getElementById('angel-card');
const britneyBackground = document.getElementById('britney-background');
const divineMessage = document.getElementById('divine-message');
const angelSound = "./audio/britneeey-sound-effect.mp3";
const audio = new Audio(angelSound);
const angelCards = ["./images/virtual-angel/GRETA.mp4", "./images/virtual-angel/MIK.mp4",
                    "./images/virtual-angel/MUM.mp4", "./images/virtual-angel/OSCAR.mp4",
                    "./images/virtual-angel/SANTANA.mp4"]
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

function openVirtualAngel() {
    audio.currentTime = 0;
    audio.play();
    showAngelCard();
}


window.openVirtualAngel = openVirtualAngel;
window.resetAngelCard = resetAngelCard;
