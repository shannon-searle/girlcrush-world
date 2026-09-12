/* ------------------------------------------
    Twinkling star canvas background.
    Shared by index.js and main.js — pass options
    to control size, movement, and where stars spawn.
------------------------------------------ */
function createStarfield({ canvasId = 'stars', count = 150, maxSize = 5, drift = 0, minY = 0, maxY = 1 } = {}) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: canvas.height * minY + Math.random() * canvas.height * (maxY - minY),
        size: Math.random() * maxSize,
        speed: Math.random() * drift,
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

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach(star => {
            star.opacity += 0.02 * star.direction;
            if (star.opacity >= 1 || star.opacity <= 0) star.direction *= -1;

            if (drift) {
                star.y -= star.speed;
                if (star.y < 0) star.y = canvas.height;
            }

            drawStar(star.x, star.y, star.size, star.opacity);
        });

        requestAnimationFrame(animate);
    }

    animate();
}
