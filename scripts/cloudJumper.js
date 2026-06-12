// ============================================================
// DOM references (non-game-object UI)
// ============================================================
const game = document.querySelector('.cloud-jumper-game');
const gameContainer = document.querySelector('.cloud-jumper-container');
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
    cloudSpeed: 1.5,
    cloudWidth: 80,
    cloudY: 50,
    startPlayerY: 100
}; // maybe change cloudWidth ? not hardcoded

// ============================================================
// Game-level state — things that belong to the game, not the player
// ============================================================
const state = {
    gameStarted: false,
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
    cloudWidth: config.cloudWidth,   // fallback until measured
    cloudHeight: 40,                 // fallback until measured
    maxGap: 0,
    gameWidth: 0
};
// if mobile player starts at 20px left
if (layout.mobile) { layout.playerLeft = 20; }

// ============================================================
// Player class — position, velocity, and jump state
// ============================================================
class Player {
    constructor() {
        this.el = document.getElementById('cloud-jumper');
        this.y = config.startPlayerY;
        this.prevY = config.startPlayerY;
        this.velocityY = 0;
        this.isJumping = false;
        this.charging = false;
        this.onPlatform = false;
        this.activePlatform = null;
    }

    // called on space / touch
    startJump() {
        this.charging = true;
        this.isJumping = true;
        this.onPlatform = false;
        this.activePlatform = null;
        this.velocityY = config.jumpPower;
    }

    // called on key/touch release
    stopCharging() {
        this.charging = false;
    }

    applyPhysics(dt) {
        this.prevY = this.y;

        // keep jumping while holding key
        if (this.charging) {
            this.velocityY = Math.min(
                this.velocityY + config.chargeRate * dt,
                config.maxPower
            );
        }

        // Apply physics when not on a platform
        if (!this.onPlatform) {
            this.velocityY -= config.gravity * dt;
            this.y += this.velocityY * dt;
        } else if (this.activePlatform) {
            // Ride the active platform's Y position
            this.y = this.activePlatform.y + layout.cloudHeight;
        }
    }

    // Collision detection against all clouds — pure game coordinates,
    // swept check so fast falls can't tunnel through clouds
    checkLanding(clouds) {
        let landed = false;
        const centerX = layout.playerLeft + layout.playerWidth / 2;

        clouds.forEach(c => {
            const cloudTop = c.y + layout.cloudHeight;

            const horizontalOverlap =
                centerX > c.x &&
                centerX < c.x + layout.cloudWidth;

            // did the player's feet cross this cloud's top surface
            // at any point during this frame, while falling?
            const crossedTop =
                this.velocityY <= 0 &&
                this.prevY >= cloudTop &&
                this.y <= cloudTop;

            if (horizontalOverlap && crossedTop) {
                landed = true;
                this.activePlatform = c;
                this.y = cloudTop;   // snap exactly onto the surface
            }
        });

        // if player has landed on a cloud, they are on platform
        if (landed) {
            this.onPlatform = true;
            this.velocityY = 0;
            this.isJumping = false;
        } else {
            this.onPlatform = false;
            this.activePlatform = null;
        }
    }

    render() {
        this.el.style.bottom = this.y + 'px';
    }

    reset() {
        this.y = config.startPlayerY;
        this.velocityY = 0;
        this.isJumping = false;
        this.charging = false;
        this.onPlatform = false;
        this.activePlatform = null;
        this.render();
    }
}

// ============================================================
// Cloud class — one platform, owns its element and position
// ============================================================
class Cloud {
    constructor(x, y) {
        this.el = document.createElement('img');
        this.el.src = "./images/cloud.png"; // your image
        this.el.classList.add('cloud');
        game.appendChild(this.el);

        this.x = x;
        this.y = y;
        this.render();
    }

    move(dt) {
        this.x -= config.cloudSpeed * dt;
    }

    isOffScreen() {
        return this.x < -config.cloudWidth;
    }

    // place this cloud back into the chain past the rightmost cloud
    respawn(rightEdge) {
        const gap = Math.random() * layout.maxGap;   // edge-to-edge gap
        this.x = rightEdge + gap;
        this.y = config.cloudY;
        return this.x + config.cloudWidth;           // new right edge for chaining
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.render();
    }

    render() {
        this.el.style.left = this.x + 'px';
        this.el.style.bottom = this.y + 'px';
    }
}

// ============================================================
// Game objects
// ============================================================
const player = new Player();
let clouds = [];

let lastTime = 0;

// ============================================================
// Game loop — update()
// ============================================================
function update(timestamp) {
    // dt = elapsed time, normalized so dt === 1 at exactly 60fps
    let dt = (timestamp - lastTime) / (1000 / 60);
    lastTime = timestamp;

    // clamp: after a tab-switch or lag spike, don't teleport the player
    dt = Math.min(dt, 3);

    if (state.gameStarted) {
        if (state.gameOver) {
            requestAnimationFrame(update);
            return;
        }

        // player physics
        player.applyPhysics(dt);

        // Move clouds
        // right edge of the furthest-right cloud — the anchor for new spawns
        let rightEdge = Math.max(...clouds.map(c => c.x)) + config.cloudWidth;

        clouds.forEach(c => {
            c.move(dt);

            // recycle when fully off the left edge
            if (c.isOffScreen()) {
                rightEdge = c.respawn(rightEdge);   // chain the next spawn
            }
            c.render();
        });

        // Collision detection — may snap player.y onto a cloud top
        player.checkLanding(clouds);

        // render AFTER collision so the snapped position is what's painted
        player.render();

        // Game over if player falls off screen
        if (player.y < 0) {
            state.gameOver = true;
            showGameInstructions(state.gameOver);
        }

        // update score
        state.score += config.cloudSpeed * 0.1 * dt;   // tune the multiplier
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

    layout.playerWidth = player.el.offsetWidth;
    layout.cloudWidth = clouds[0]?.el.offsetWidth || layout.cloudWidth;
    layout.cloudHeight = clouds[0]?.el.offsetHeight || layout.cloudHeight;
    layout.gameWidth = game.clientWidth;

    const maxTimeInAir = (2 * config.maxPower) / config.gravity;
    const edgeToEdgeGap = config.cloudSpeed * maxTimeInAir;
    layout.maxGap = (layout.cloudWidth + edgeToEdgeGap) * 0.7;
}

// create initial clouds
function createClouds(startX, gap, Y) {
    for (let i = 0; i < 8; i++) {
        clouds.push(new Cloud(startX + (i * gap), Y));
    }
}

// reset game after 'Game Over'
function reset() {
    // reset state
    state.gameStarted = false;
    state.gameOver = false;
    state.score = 0;

    // reset player
    player.reset();

    // update score
    scoreDisplay.textContent = Math.floor(state.score) + 'm';

    // reset UI
    showGameInstructions(state.gameOver);

    // reset cloud positions
    clouds.forEach((c, i) => {
        c.setPosition(layout.playerLeft + (i * 80), 50);
    });
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

// shared "begin a jump" logic for both input types
function beginJump() {
    if (player.isJumping) return;
    initGame();              // no-op after the first call
    state.gameStarted = true;
    player.startJump();
}

// desktop keyboard events
document.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space') {
        beginJump();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        player.stopCharging();
    }
});

// mobile touch events
gameContainer.addEventListener('touchstart', (event) => {
    event.preventDefault();  // stops the page scrolling while playing
    beginJump();
});

gameContainer.addEventListener('touchend', (event) => {
    event.preventDefault();
    player.stopCharging();
});

// event listener for play again button
playAgain.addEventListener('pointerdown', () => {
    reset();
});

// ============================================================
// Boot
// ============================================================
createClouds(layout.playerLeft, config.cloudWidth, config.cloudY);
requestAnimationFrame(update);