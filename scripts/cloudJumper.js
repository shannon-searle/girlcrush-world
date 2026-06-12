
// ============================================================
// DOM references
// ============================================================
const player = document.getElementById('cloud-jumper');
const game = document.querySelector('.cloud-jumper-game');
const scoreDisplay = document.getElementById('score-display');
const gameOverText = document.getElementById('game-over');
const desktopInstructions = document.getElementById('desktop-instructions');
const mobileInstructions = document.getElementById('mobile-instructions');
const playAgain = document.getElementById('play-again');

// ============================================================
// Config — every "magic number" lives here, tweak in one place
// ============================================================
const config = {
    gravity: 0.65,
    maxPower: 14,
    chargeRate: 0.5,
    jumpPower: 8,
    cloudSpeed: 1,
    cloudWidth: 80,
    cloudY: 50,
    startPlayerY: 100
}; // maybe change cloudWidth ? not hardcoded

// ============================================================
// State — everything that changes while playing
// ============================================================
const state = {
    playerY: config.startPlayerY,
    velocityY: 0,
    gameStarted: false,
    isJumping: false,
    charging: false,
    onPlatform: false,
    activePlatform: null,
    gameOver: false,
    initialized: false,
    score: 0
};

// ============================================================
// Layout — measured/derived values, filled in by initGame()
// ============================================================
const layout = {
    mobile: window.innerWidth <= 768,
    playerLeft: 150,
    playerWidth: 0,
    maxGap: 0,
    gameWidth: 0
};
// if mobile player starts at 20px left
if (layout.mobile) { layout.playerLeft = 20;}

let clouds = [];

// ============================================================
// Game loop — update()
// ============================================================
function update() {
    if (state.gameStarted) {
        if (state.gameOver) {
            requestAnimationFrame(update);
            return;
        }

        // keep jumping while holding key
        if (state.charging) {
            state.velocityY = Math.min(state.velocityY + config.chargeRate, config.maxPower);
        }

        // Apply physics when not on a platform
        if (!state.onPlatform) {
            state.velocityY -= config.gravity;
            state.playerY += state.velocityY;
        } else {
            // Ride the active platform's Y position
            if (state.activePlatform) {
                state.playerY = state.activePlatform.y + state.activePlatform.el.offsetHeight;
            }
        }

        // set player Y 
        player.style.bottom = state.playerY + 'px';

        // Move clouds

        // right edge of the furthest-right cloud — the anchor for new spawns
        let rightEdge = Math.max(...clouds.map(o => o.x)) + config.cloudWidth;
    
        clouds.forEach(c => {
            c.x -= config.cloudSpeed;
    
            // recycle when fully off the left edge
            if (c.x < -config.cloudWidth) {
                const gap = Math.random() * layout.maxGap;   // edge-to-edge gap
                c.x = rightEdge + gap;
                rightEdge = c.x + config.cloudWidth;         // chain the next spawn
                c.y = config.cloudY;
            }
            c.el.style.left = c.x + 'px';
            c.el.style.bottom = c.y + 'px';
        });


        // Collision detection
        let landed = false;
        clouds.forEach(c => {
            const playerRect = player.getBoundingClientRect();
            const cloudRect = c.el.getBoundingClientRect();
            const playerCenterX = playerRect.left + playerRect.width / 2;

            const horizontalOverlap =
                playerCenterX > cloudRect.left &&
                playerCenterX < cloudRect.right;

            const landingOnTop =
                playerRect.bottom >= cloudRect.top &&
                playerRect.bottom <= cloudRect.bottom &&
                state.velocityY <= 0;

            if (horizontalOverlap && landingOnTop) {
                landed = true;
                state.activePlatform = c;
            }
        });
        // if player has landed on a cloud, they are on platform
        if (landed) {
            state.onPlatform = true;
            state.velocityY = 0;
            state.isJumping = false;
        } else {
            state.onPlatform = false;
            state.activePlatform = null;
        }

        // Game over if player falls off screen
        if (state.playerY < 0) {
            state.gameOver = true;
            showGameInstructions(state.gameOver);
        }

        // update score 
        state.score += config.cloudSpeed * 0.1;   // tune the multiplier
        scoreDisplay.textContent = Math.floor(state.score) + 'm';

    }

    requestAnimationFrame(update);
}

// ============================================================
// Reset and Init Functions
// ============================================================

// initialise game layout 
function initGame() {
    if (state.initialized) return;
    state.initialized = true;
 
    layout.playerWidth = player.offsetWidth;
    layout.cloudWidth = clouds[0]?.el.offsetWidth || layout.cloudWidth;
    layout.gameWidth = game.clientWidth;
 
    const maxTimeInAir = (2 * config.maxPower) / config.gravity;
    const edgeToEdgeGap = config.cloudSpeed * maxTimeInAir;
    layout.maxGap = (layout.cloudWidth + edgeToEdgeGap) * 0.7;

    
}

// create initial clouds
function createClouds(startX, gap, Y) {
    let number = 8;
    if (layout.mobile) {
        number = 6;
    }
    for (let i = 0; i < number; i++) {
        const el = document.createElement('img');
        el.src = "./images/cloud.png"; // your image
        el.classList.add('cloud');

        game.appendChild(el);

        clouds.push({
            x: startX + (i * gap),
            y: Y,
            el
        });
    }

    clouds.forEach(c => {
        c.el.style.left = c.x + 'px';
        c.el.style.bottom = c.y + 'px';
    });
}

// reset game after 'Game Over'
function reset() {
    // reset state
    state.playerY = 100;
    state.velocityY = 0;
    state.gameStarted = false;
    state.isJumping = false;
    state.charging = false;
    state.onPlatform = false;
    state.activePlatform = null;
    state.gameOver = false;
    state.score = 0;

    // update score 
    scoreDisplay.textContent = Math.floor(state.score) + 'm';



    // reset UI
    showGameInstructions(state.gameOver)

    // reset cloud positions
    clouds.forEach((c, i) => {
        c.x = layout.playerLeft +(i * 80),
        c.y = 50;
        c.el.style.left = c.x + 'px';
        c.el.style.bottom = c.y + 'px';
    });

    // reset player position
    player.style.bottom = state.playerY + 'px';
    
}

// ============================================================
// UI helpers
// ============================================================
function showGameInstructions(isGameOver) {
    if (isGameOver) {
        gameOverText.style.display = "block";
        playAgain.style.display = "block";
        if (layout.mobile) {
            mobileInstructions.style.display = 'none';
        }
        else {
            desktopInstructions.style.display = 'none';
        }
    }
    else {
        gameOverText.style.display = 'none';
        playAgain.style.display = 'none';

        if (layout.mobile) {
            mobileInstructions.style.display = 'block';
        }
        else {
            desktopInstructions.style.display = 'block';
        }
    }
}


// ============================================================
// Input
// ============================================================

// desktop keyboard events
document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space' && !state.isJumping) {
        if (state.initialized == false) {
            initGame();
        }
        state.gameStarted = true;
        state.charging = true;
        state.isJumping = true;
        state.onPlatform = false;
        state.activePlatform = null;
        state.velocityY = config.jumpPower;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        state.charging = false;
    }
});

// mobile touch events
game.addEventListener('touchstart', (event) => {
    event.preventDefault();  // stops the page scrolling while playing
    if (!state.isJumping) {
        if (state.initialized == false) {
            initGame();
        }
        state.gameStarted = true;
        state.charging = true;
        state.isJumping = true;
        state.onPlatform = false;
        state.activePlatform = null;
        state.velocityY = config.jumpPower;
    }
});

game.addEventListener('touchend', (event) => {
    event.preventDefault();
    state.charging = false;
});

// event listener for play again button
playAgain.addEventListener('pointerdown', () => {
    reset();
});


// ============================================================
// Boot
// ============================================================
createClouds(layout.playerLeft, config.cloudWidth, config.cloudY);
update();




// ============================================================
// Code Ideas
// ============================================================

// chnage player positon to array like clouds 
//const playerData = {
//     x: 50,
//     y: 100,
//     width: 40,
//     height: 40
// };

// const collision =
//     playerData.x < c.x + c.width &&
//     playerData.x + playerData.width > c.x &&
//     playerData.y < c.y + c.height &&
//     playerData.y + playerData.height > c.y;


