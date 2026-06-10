const player = document.getElementById('cloud-jumper');
const game = document.querySelector('.cloud-jumper-game');
const clouds = [];

let playerY = 100;
let velocityY = 0;
const gravity = 0.65;
let gameStarted = false;

let isJumping = false;
let jumpPower = 8;
let charging = false;
let maxPower = 14;
let chargeRate = 0.5;
let onPlatform = false;
let activePlatform = null;

let gameOver = false;


const maxGap = (2 * maxPower / gravity) * 1.5; 

for (let i = 0; i < 5; i++) {
    const el = document.createElement('img');
    el.src = "./images/cloud.png"; // your image
    el.classList.add('cloud');

    game.appendChild(el);

    clouds.push({
        x: i === 0 ? 300 : i === 1 ? 600 : game.clientWidth + i * (maxGap),
        y: 50,
        el
    });
}

clouds.forEach(c => {
    c.el.style.left = c.x + 'px';
    c.el.style.bottom = c.y + 'px';
});



function update() {
    if (gameStarted) {
        if (gameOver) {
            requestAnimationFrame(update);
            return;
        }

        // Thrust while holding space
        if (charging) {
            velocityY = Math.min(velocityY + chargeRate, maxPower);
        }

        // Apply physics when not on a platform
        if (!onPlatform) {
            velocityY -= gravity;
            playerY += velocityY;
        } else {
            // Ride the active platform's Y position
            if (activePlatform) {
                playerY = activePlatform.y + activePlatform.el.offsetHeight;
            }
        }

        player.style.bottom = playerY + 'px';

        // Move clouds
        clouds.forEach(c => {
            c.x -= 2;

            if (c.x < -100) {
                c.x = game.clientWidth + Math.random() * maxGap;
                c.y = 50;
            }

            

            c.el.style.left = c.x + 'px';
            c.el.style.bottom = c.y + 'px';
        });

        // Collision detection — only land on top, don't snap when jumping upward
        let landed = false;
        clouds.forEach(c => {
            const playerRect = player.getBoundingClientRect();
            const cloudRect = c.el.getBoundingClientRect();

            const horizontalOverlap =
                playerRect.left < cloudRect.right &&
                playerRect.right > cloudRect.left;

            const landingOnTop =
                playerRect.bottom >= cloudRect.top &&
                playerRect.bottom <= cloudRect.bottom &&
                velocityY <= 0; // only snap when falling or neutral

            if (horizontalOverlap && landingOnTop) {
                landed = true;
                activePlatform = c;
            }
        });

        if (landed) {
            onPlatform = true;
            velocityY = 0;
            isJumping = false;
        } else if (!landed && onPlatform && velocityY <= 0) {
            // Walked off the edge of a cloud — start falling
            onPlatform = false;
            activePlatform = null;
        }

        // Game over if player falls off screen
        if (playerY < 0) {
            console.log("game over");
            gameOver = true;
        }
    }

    requestAnimationFrame(update);
}

document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space' && !isJumping) {
        gameStarted = true;
        charging = true;
        isJumping = true;
        onPlatform = false;
        activePlatform = null;
        velocityY = jumpPower;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        charging = false;
    }
});

update();