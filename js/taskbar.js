const taskbar = document.querySelector('.taskbar');
const taskbarSpacer = document.querySelector('.taskbar-spacer');
const startButton = document.querySelector("#start-button");
const chatButton = document.getElementById('chatbox-button');
const mobile = (window.innerWidth <= 768);

/* ------------------------------------------
    Start menu taskbar buttons
------------------------------------------ */
function taskbarOpen(id) {
    const btn = document.getElementById(id);
    if (!btn.classList.contains('open')) {
        btn.classList.add('open');
        taskbar.insertBefore(btn, taskbarSpacer);
        // clear previous "last"
        document.querySelectorAll(".keep-full").forEach(b => b.classList.remove("keep-full"));
        if (!mobile && taskbarSpacer.clientWidth <= 20) {
            enableScalableTaskbar(btn);
        }
    }
}

function taskbarClose(id) {
    document.querySelectorAll(".keep-full").forEach(b => b.classList.remove("keep-full"));
    document.getElementById(id).classList.remove('open');

    if (!mobile && taskbarSpacer.clientWidth > 20) {
        disableScalableTaskbar();
    } else {
        const btns = [...document.querySelectorAll(".taskbar-button.open:not(#start-button)")];
        btns[btns.length - 1].classList.add("keep-full");
    }
}

function enableCompactTaskbar() {
    taskbar.classList.add("compact");
}

function disableCompactTaskbar() {
    taskbar.classList.remove("compact");
}

function enableScalableTaskbar(lastbtn) {
    taskbar.classList.add("scaleable");
    lastbtn.classList.add("keep-full");
}

function disableScalableTaskbar() {
    taskbar.classList.remove("scaleable");
}

if (window.innerWidth <= 768) {
    enableCompactTaskbar();
}