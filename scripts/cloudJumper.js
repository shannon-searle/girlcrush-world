const player = document.getElementById('cloud-jumper');
const game = document.querySelector('.cloud-jumper-game');
const gameOverText = document.getElementById('game-over');
const desktopInstructions = document.getElementById('desktop-instructions');
const mobileInstructions = document.getElementById('mobile-instructions');
const playAgain = document.getElementById('play-again');
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

let mobile = false;


const playerWidth = player.offsetWidth;             // reads from DOM directly
const margin = playerWidth * 0.2;

let playerLeft = 150;
// if mobile open chatbox
if (window.innerWidth <= 768) {
    playerLeft = 20;
    mobile = true;
}
const playerCenterX = playerLeft + playerWidth / 2;

const cloudSpeed = 1;
const cloudWidth = 80;
const maxTimeInAir = (2 * maxPower) / gravity;
const edgeToEdgeGap = (cloudSpeed * maxTimeInAir) + margin;
const maxGap = (cloudWidth + edgeToEdgeGap) * 0.7;

const scaler = 0.1

// desktop
let cloudStartingX = playerLeft;


for (let i = 0; i < 6; i++) {
    const el = document.createElement('img');
    el.src = "./images/cloud.png"; // your image
    el.classList.add('cloud');

    game.appendChild(el);

    clouds.push({
        x: cloudStartingX + i * (maxGap) * 1.5,
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
            c.x -= 1;

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

            const playerCenterX = playerRect.left + playerRect.width / 2;

            const horizontalOverlap =
                playerCenterX > cloudRect.left - margin &&
                playerCenterX < cloudRect.right + margin;

            const landingOnTop =
                playerRect.bottom >= cloudRect.top &&
                playerRect.bottom <= cloudRect.bottom &&
                velocityY <= 0;

            if (horizontalOverlap && landingOnTop) {
                landed = true;
                activePlatform = c;
            }
        });

        if (landed) {
            onPlatform = true;
            velocityY = 0;
            isJumping = false;
        } else {
            onPlatform = false;
            activePlatform = null;
        }

        // Game over if player falls off screen
        if (playerY < 0) {
            gameOver = true;
            gameOverText.style.display = "block";
            playAgain.style.display = "block";
            if (mobile) {mobileInstructions.style.display = 'none';}
            else {desktopInstructions.style.display = 'none';}
        }
    }

    requestAnimationFrame(update);
}

// desktop keyboard events
document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space') {
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

// mobile touch events
game.addEventListener('touchstart', (event) => {
    event.preventDefault();  // stops the page scrolling while playing
    if (!isJumping) {
        gameStarted = true;
        charging = true;
        isJumping = true;
        onPlatform = false;
        activePlatform = null;
        velocityY = jumpPower;
    }
});

game.addEventListener('touchend', (event) => {
    event.preventDefault();
    charging = false;
});

playAgain.addEventListener('pointerdown', () => {
    reset();
});

function reset() {
    // reset state
    playerY = 100;
    velocityY = 0;
    gameStarted = false;
    isJumping = false;
    charging = false;
    onPlatform = false;
    activePlatform = null;

    // reset UI
    gameOverText.style.display = 'none';
    playAgain.style.display = 'none';
    if (mobile) {mobileInstructions.style.display = 'block';}
    else {desktopInstructions.style.display = 'block';}

    // reset cloud positions
    clouds.forEach((c, i) => {
        c.x = cloudStartingX + i * (maxGap) * 1.5,
        c.y = 50;
        c.el.style.left = c.x + 'px';
        c.el.style.bottom = c.y + 'px';
    });


    // reset player position
    player.style.bottom = playerY + 'px';
    gameOver = false;
}

update();
