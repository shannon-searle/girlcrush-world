
// if not mobile open chatbox
if (window.innerWidth > 768) {
    openPopup('chatbox-popup');
}

// fade into base
window.addEventListener("load", () => {
    requestAnimationFrame(() => {
        document.body.style.opacity = "1";
    });
});

/* ------------------------------------------
    piano
------------------------------------------ */
const BASE_URL = "https://tonejs.github.io/audio/salamander/";
const audioctx = new (window.AudioContext || window.webkitAudioContext)();

// only load samples close to your key range (C4–E5)
const noteFiles = {
    C4:    "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4:    "A4.mp3",
    C5:    "C5.mp3",
    "D#5": "Ds5.mp3",
};

const buffers = {};

async function loadSamples() {
    await Promise.all(Object.entries(noteFiles).map(async ([note, file]) => {
        const res = await fetch(BASE_URL + file);
        const arrayBuffer = await res.arrayBuffer();
        buffers[note] = await audioctx.decodeAudioData(arrayBuffer);
    }));
}
loadSamples();

function noteToMidi(note) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const name = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    return notes.indexOf(name) + (octave + 1) * 12;
}

function findClosestSample(note) {
    const targetMidi = noteToMidi(note);
    let closest = null;
    let smallestDiff = Infinity;

    for (const sampleNote of Object.keys(buffers)) {
        const diff = Math.abs(noteToMidi(sampleNote) - targetMidi);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closest = sampleNote;
        }
    }

    const semitonesDiff = targetMidi - noteToMidi(closest);
    const playbackRate = Math.pow(2, semitonesDiff / 12);
    return { buffer: buffers[closest], playbackRate };
}

function playBuffer(note) {
    const { buffer, playbackRate } = findClosestSample(note);
    if (!buffer) return;
    const source = audioctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    source.connect(audioctx.destination);
    source.start(0);
    setTimeout(() => {
        source.stop();
    }, 500);
}

let isPointerDown = false;
let activeKey = null;

function playKey(key) {
    if (!key || key === activeKey) return;
    activeKey = key;

    if (audioctx.state === "suspended") audioctx.resume();

    const note = key.dataset.note;
    playBuffer(note);

    key.classList.add("pressed");
    setTimeout(() => key.classList.remove("pressed"), 200);
}

document.querySelectorAll(".key, .black-key").forEach(key => {
    key.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        isPointerDown = true;
        playKey(key);
    });
});

const pianoEl = document.getElementById("piano-popup");

pianoEl.addEventListener("pointerup", () => {
    isPointerDown = false;
    activeKey = null;
});

pianoEl.addEventListener("pointermove", (e) => {
    if (!isPointerDown) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const key = el.closest(".key, .black-key");
    playKey(key);
});

/* --------------------------- ---------------
    Cursor heart trail
------------------------------------------ */
let trailCount = 0;

document.addEventListener('mousemove', function (e) {
    trailCount++;
    if (trailCount % 5 !== 0) return;   // only fire every 5th move event

    const heart = document.createElement('div');
    heart.className  = 'cursor-heart';
    heart.innerHTML  = '♡';
    heart.style.left = e.pageX + 'px';
    heart.style.top  = e.pageY + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
});


/* ------------------------------------------
    Popup helpers
------------------------------------------ */
function openPopup(id) {
    document.getElementById(id).classList.add('open');

    // Also highlight the Start button when the About popup opens
    if (id === 'about-me-popup') {
        document.getElementById('start-button').classList.add('open');
    }
    if (id === 'chatbox-popup') {
        document.getElementById('chatbox-button').classList.add('open');
    }

    if (id === "virtual-angel-popup") {
        window.openVirtualAngel();
    }
}

function closePopup(id) {
    const popup = document.getElementById(id);
    popup.classList.remove('open');
    popup.style.transform = 'translate(0px, 0px)';  // reset drag position

    if (id === 'about-me-popup') {
        document.getElementById('start-button').classList.remove('open');
    }
    if (id === 'chatbox-popup' ) {
        document.getElementById('chatbox-button').classList.remove('open');
    }
    if (id === "virtual-angel-popup") {
        window.resetAngelCard();
    }
    if (id === "cloud-jumper-popup") {
        window.resetCloudJumper();
    }
}

// add listener for popup buttons
document.querySelectorAll('[data-popup]').forEach(button => {
    button.addEventListener('click', function() {
        const popupId = this.dataset.popup;
        const startmenuId = this.dataset.startmenu;

        if (!popupId) return;

        if (popupId === 'chatbox-popup') {
            const popup = document.getElementById(popupId);
            if (popup.classList.contains('open')) {
                closePopup(popupId);
                return;
            }
        }

        if (popupId === 'about-me-popup') {
            const popup = document.getElementById(popupId);
            if (popup.classList.contains('open')) {
                closePopup('about-me-popup');
                closePopup('likes-popup');
                closePopup('dislikes-popup');
                return;
            }
        }

        openPopup(popupId);
        if (startmenuId) {
            openStartMenu(startmenuId);
        }
    });
});

// close popup
document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', function () {
        const popupId  = this.dataset.close;
        const menuId   = this.dataset.closemenu;
        const alsoClose = this.dataset.closeAlso;

        if (!popupId) return;

        closePopup(popupId);
        if (menuId)    closeStartMenu(menuId);
        if (alsoClose) alsoClose.split(',').forEach(id => closePopup(id.trim()));
    });
});

// Avatar layer buttons
document.querySelectorAll('[data-layer]').forEach(button => {
    button.addEventListener('click', function () {
        document.getElementById(this.dataset.layer).src = this.dataset.src;
    });
});

// Epic gifs prev/next
document.querySelectorAll('[data-gif]').forEach(button => {
    button.addEventListener('click', function () {
        changeGif(parseInt(this.dataset.gif));
    });
});

/* ------------------------------------------
    Start bar taskbar buttons
------------------------------------------ */
function openStartMenu(id) {
    const btn = document.getElementById(id);
    const chatButton = document.getElementById('chatbox-button');
    if (!btn.classList.contains('open')) {
        btn.classList.add('open');
        document.querySelector('.start-bar').insertBefore(btn, chatButton);
    }

}

function closeStartMenu(id) {
    document.getElementById(id).classList.remove('open');
}


/* ------------------------------------------
    Avatar dress-up: swap a layer's image
------------------------------------------ */
function changeLayer(layerId, newSrc) {
    document.getElementById(layerId).src = newSrc;
}


/* ------------------------------------------
    Draggable popups (drag by titlebar only)
------------------------------------------ */
function makeDraggable(popup) {
    let offsetX = 0, offsetY = 0;
    let startX  = 0, startY  = 0;

    popup.addEventListener('mousedown', function (e) {
        if (!e.target.closest('.popup-titlebar')) return;

        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup',   stopDrag);
    });

    function onDrag(e) {
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        popup.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    function stopDrag() {
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup',   stopDrag);
    }
}

// Apply draggable to specific popups
makeDraggable(document.getElementById('welcome-popup'));
makeDraggable(document.getElementById('avatar-popup'));
makeDraggable(document.getElementById('piano-popup'));
makeDraggable(document.getElementById('likes-popup'));
makeDraggable(document.getElementById('dislikes-popup'));
makeDraggable(document.getElementById('image-gallery-popup'));
makeDraggable(document.getElementById('my-music-popup'));
makeDraggable(document.getElementById('cloud-jumper-popup'));
makeDraggable(document.getElementById('virtual-angel-popup'));
makeDraggable(document.getElementById('webmaster-popup'));



/* ------------------------------------------
Page fade-in (when navigating from index)
------------------------------------------ */
if (window.location.search === '?from=index') {
    document.body.style.opacity         = '0';
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.transition      = 'opacity 1.5s ease, background-color 1s ease';

    setTimeout(() => {
        document.body.style.opacity         = '1';
        document.body.style.backgroundColor = '#fce4ec';
    }, 50);
}

/* ------------------------------------------
Epic gifs change gif
------------------------------------------ */

const gifs = [
    './epic-gifs/gif1.gif',
    './epic-gifs/gif2.gif',
    './epic-gifs/gif3.gif',
];

let currentGif = 0;

function changeGif(direction) {
    currentGif = (currentGif + direction + gifs.length) % gifs.length;
    document.getElementById('epicGif').src = gifs[currentGif];
}


    /* ------------------------------------------
STARS
------------------------------------------ */

const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height * 0.5 + Math.random() * canvas.height * 0.5,
    size: Math.random() * 5,
    opacity: Math.random(),
    direction: Math.random() > 0.5 ? 1 : -1
}));

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.opacity += 0.02 * star.direction;
        if (star.opacity >= 1 || star.opacity <= 0) star.direction *= -1;

        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * star.size,
                    -Math.sin((18 + i * 72) * Math.PI / 180) * star.size);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * star.size * 0.4,
                    -Math.sin((54 + i * 72) * Math.PI / 180) * star.size * 0.4);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        ctx.restore();
    });

    requestAnimationFrame(draw);
}

draw();

/* BLINKIES */
document.querySelectorAll('.blinkies img').forEach(img => {
const rotate = (Math.random() * 2 - 2);        // -10 to 10 degrees
const translateX = (Math.random() * 20 - 10);    // -10 to 10px
const translateY = (Math.random() * 20 - 10);    // -10 to 10px
img.style.transform = `rotate(${rotate}deg) translate(${translateX}px, ${translateY}px)`;
});
