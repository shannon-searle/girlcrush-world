/* ------------------------------------------
    piano
------------------------------------------ */
const BASE_URL = "https://tonejs.github.io/audio/salamander/";
let audioctx = null;

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

function startPianoAudio() {
    if (audioctx) return;
    audioctx = new (window.AudioContext || window.webkitAudioContext)();
    loadSamples();
}

document.querySelectorAll('[data-panel="piano-popup"]').forEach(pianoOpener => {
    pianoOpener.addEventListener("click", startPianoAudio);
});

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

    startPianoAudio();
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

