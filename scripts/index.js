// ── Section transitions ──

function fadeBody(out, callback) {
    document.body.style.transition = "opacity 1s ease";
    document.body.style.opacity = out ? "0" : "1";
    if (callback) setTimeout(callback, 1000);
}

function setBackground(color) {
    const bg = document.getElementById("bg");
    bg.style.opacity = "0";
    setTimeout(() => {
        bg.style.background = color;
        requestAnimationFrame(() => { bg.style.opacity = "1"; });
    }, 1000);
}

function next(hideId, showId, newBg) {
    if (newBg) setBackground(newBg);

    fadeBody(true, () => {
        document.getElementById(hideId).style.display = "none";
        document.getElementById(showId).style.display = "flex";
        document.body.style.opacity = "1";
    });

    setTimeout(() => {
        document.documentElement.style.background = "black";
    }, 1600);
}

function goToBase() {
    setBackground("#fce4ec");
    fadeBody(true, () => {
        window.location.replace("base.html?from=index");
    });
}

// -- End Arival Video --
document.querySelector('.arrival-video').addEventListener('play', () => {
    setTimeout(() => {
        document.querySelectorAll('#screen-arrival p, #screen-arrival .button').forEach(el => {
            el.style.opacity = '1';
        });
    }, 7630);
});

// ── Stars ──

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.5,
    speed: Math.random() * 0.2 + 0.05,
    opacity: Math.random(),
    direction: Math.random() > 0.5 ? 1 : -1,
}));

function drawStar(x, y, size, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        ctx.lineTo(
            Math.cos((18 + i * 72) * Math.PI / 180) * size,
            -Math.sin((18 + i * 72) * Math.PI / 180) * size
        );
        ctx.lineTo(
            Math.cos((54 + i * 72) * Math.PI / 180) * size * 0.4,
            -Math.sin((54 + i * 72) * Math.PI / 180) * size * 0.4
        );
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fill();
    ctx.restore();
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.opacity += 0.02 * star.direction;
        if (star.opacity >= 1 || star.opacity <= 0) star.direction *= -1;

        star.y -= star.speed;
        if (star.y < 0) star.y = canvas.height;

        drawStar(star.x, star.y, star.size * 5, star.opacity);
    });

    requestAnimationFrame(animateStars);
}

animateStars();