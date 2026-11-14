/* ------------------------------------------
    piano
------------------------------------------ */
const BASE_URL = "https://tonejs.github.io/audio/salamander/";
const NOTE_LENGTH_MS = 500;

// only load samples close to your key range (C4–E5)
const noteFiles = {
    C4:    "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4:    "A4.mp3",
    C5:    "C5.mp3",
    "D#5": "Ds5.mp3",
};

const pianoSamples = Object.fromEntries(Object.entries(noteFiles).map(([note, file]) => [
    note,
    new Howl({ src: [BASE_URL + file], preload: false }),
]));

function loadPianoSamples() {
    Object.values(pianoSamples).forEach(sample => {
        if (sample.state() === "unloaded") sample.load();
    });
}

document.querySelectorAll('[data-panel="piano-popup"]').forEach(pianoOpener => {
    pianoOpener.addEventListener("click", loadPianoSamples);
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

    for (const sampleNote of Object.keys(pianoSamples)) {
        const diff = Math.abs(noteToMidi(sampleNote) - targetMidi);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closest = sampleNote;
        }
    }

    const semitonesDiff = targetMidi - noteToMidi(closest);
    const playbackRate = Math.pow(2, semitonesDiff / 12);
    return { sample: pianoSamples[closest], playbackRate };
}

function playNote(note) {
    const { sample, playbackRate } = findClosestSample(note);
    const soundId = sample.play();
    sample.rate(playbackRate, soundId);
    setTimeout(() => sample.stop(soundId), NOTE_LENGTH_MS);
}

let isPointerDown = false;
let activeKey = null;

function playKey(key) {
    if (!key || key === activeKey) return;
    activeKey = key;

    loadPianoSamples();
    playNote(key.dataset.note);

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

