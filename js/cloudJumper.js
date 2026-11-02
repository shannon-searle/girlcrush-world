// ============================================================
// DOM references (non-game-object UI)
// ============================================================
const game = document.querySelector('.cloud-jumper-game');
const cloudJumper = document.getElementById('cloud-jumper');
const gameContainer = document.querySelector('.cloud-jumper-container');
const scoreDisplay = document.getElementById('score-display');
const gameOverText = document.getElementById('game-over');
const desktopInstructions = document.getElementById('desktop-instructions');
const mobileInstructions = document.getElementById('mobile-instructions');
const playAgain = document.getElementById('play-again');
const startGame = document.getElementById('start-game');

// ============================================================
// Config — every "magic number" lives here, tweak in one place
// ============================================================
const config = {
    gravity: 0.65,
    maxPower: 14,
    chargeRate: 0.5,
    jumpPower: 8,
    cloudSpeed: 1.5,
    cloudWidth: 90,
    cloudHeight: 50,
    cloudY: 30,
    startPlayerY: 80,
    playerWidth: 57,
    numClouds: 8
};

// ============================================================
// Game-level state — things that belong to the game, not the player
// ============================================================
const state = {
    gameWindowOpen: false,
    gameStarted: false,
    gameOver: false,
    initialized: false,
    loopRunning: false,
    score: 0,
    difficulty: 0,
    minGap: 30, // gaps smaller than this are treated as touching (harder as this shrinks)
    gapRamp: 0.65, // 0-1, ramps toward 1 as the max gap between clouds widens
    speedRamp: 1 // multiplies cloud speed, ramps up over time
};

// ============================================================
// Layout — measured/derived values, filled in by initGame()
// ============================================================
const layout = {
    mobile: window.innerWidth <= MOBILE_BREAKPOINT,
    playerLeft: 162,
    centerX: 200.5,
    maxGap: 0,
    gameWidth: 0,
    cloudStartX: 70
};

if (layout.mobile) {
    layout.playerLeft = 32;
    layout.cloudStartX = 10;
    layout.centerX = 58.5;
}

// ============================================================
// Image preloading — avoids a decode/paint hitch mid-game when
// the player sprite swaps between jumping/platform states
// ============================================================
const preloadedImages = {};
function preloadImage(src) {
    if (preloadedImages[src]) return preloadedImages[src];
    const img = new Image();
    img.src = src;
    preloadedImages[src] = img;
    return img;
}

// ============================================================
// Player class — position, velocity, and jump state
// ============================================================
class Player {
    constructor() {
        this.idleEl = document.getElementById('cloud-jumper');
        this.jumpEl = document.getElementById('cloud-jumper-jump');
        this.y = config.startPlayerY;
        this.prevY = config.startPlayerY;
        this.velocityY = 0;
        this.isJumping = false;
        this.charging = false;
        this.onPlatform = false;
        this.activePlatform = null;

        this.idleEl.style.left = layout.playerLeft + 'px';
        this.jumpEl.style.left = layout.playerLeft + 'px';
        this.idleEl.style.opacity = '1';
        this.jumpEl.style.opacity = '0';

        this._pendingImageSwap = null;

        this.render();
    }

    setPlayerImage() {
        // clear any pending swap so rapid charge/release doesn't
        // stack up multiple timeouts fighting each other
        if (this._pendingImageSwap) {
            clearTimeout(this._pendingImageSwap);
            this._pendingImageSwap = null;
        }

        if (this.charging) {
            this.jumpEl.style.opacity = '1';
            this.idleEl.style.opacity = '0';
        }
        else {
            this._pendingImageSwap = setTimeout(() => {
                this.jumpEl.style.opacity = '0';
                this.idleEl.style.opacity = '1';
                this._pendingImageSwap = null;
            }, 250);
        }
    }

    // called on space / touch
    startJump() {
        this.charging = true;
        this.isJumping = true;
        this.onPlatform = false;
        this.activePlatform = null;
        this.velocityY = config.jumpPower;
        this.setPlayerImage();
    }

    // called on key/touch release
    stopCharging() {
        this.charging = false;
        this.setPlayerImage();
    }

    applyPhysics(dt) {
        this.prevY = this.y;

        if (this.charging) {
            this.velocityY = Math.min(
                this.velocityY + config.chargeRate * dt,
                config.maxPower
            );
        }

        if (!this.onPlatform) {
            this.velocityY -= config.gravity * dt;
            this.y += this.velocityY * dt;
        } else if (this.activePlatform) {
            this.y = this.activePlatform.y + config.cloudHeight;
        }
    }

    // Collision detection against all clouds — pure game coordinates,
    // swept check so fast falls can't tunnel through clouds
    checkLanding(clouds) {
        let landed = false;

        clouds.forEach(c => {
            const cloudTop = c.y + config.cloudHeight;

            const horizontalOverlap =
                layout.centerX > c.x &&
                layout.centerX < c.x + config.cloudWidth;

            // did the player's feet cross this cloud's top surface
            // at any point during this frame, while falling?
            const crossedTop =
                this.velocityY <= 0 &&
                this.prevY >= cloudTop &&
                this.y <= cloudTop;

            if (horizontalOverlap && crossedTop) {
                landed = true;
                this.activePlatform = c;
                this.y = cloudTop;
            }
        });

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
        const t = `translate3d(0, ${-this.y}px, 0)`;
        this.idleEl.style.transform = t;
        this.jumpEl.style.transform = t;
    }

    reset() {
        this.y = config.startPlayerY;
        this.velocityY = 0;
        this.isJumping = false;
        this.charging = false;
        this.onPlatform = false;
        this.activePlatform = null;
        if (this._pendingImageSwap) {
            clearTimeout(this._pendingImageSwap);
            this._pendingImageSwap = null;
        }
        this.idleEl.style.opacity = '1';
        this.jumpEl.style.opacity = '0';
        this.render();
    }
}

// ============================================================
// Cloud class — one platform, owns its element and position
// ============================================================
class Cloud {
    static images = [
        "./media/base/cloud-jumper/cloud1.png",
        "./media/base/cloud-jumper/cloud1.png",
        "./media/base/cloud-jumper/cloud2.png"
    ];

    static preloaded = false;
    static preloadAll() {
        if (Cloud.preloaded) return;
        Cloud.preloaded = true;
        Cloud.images.forEach(preloadImage);
    }

    constructor(x, y) {
        Cloud.preloadAll();

        this.el = document.createElement('img');
        this.el.src = this.randomiseCloud();
        this.el.classList.add('cloud');

        // fixed anchor at (0,0) — movement happens entirely via transform
        this.el.style.position = 'absolute';
        this.el.style.left = '0px';
        this.el.style.bottom = '0px';
        this.el.style.willChange = 'transform';

        game.appendChild(this.el);

        this.x = x;
        this.y = y;
        this.render();
    }

    randomiseCloud() {
        return Cloud.images[Math.floor(Math.random() * Cloud.images.length)];
    }

    move(dt) {
        this.x -= config.cloudSpeed * state.speedRamp * dt;
    }

    isOffScreen() {
        return this.x < -config.cloudWidth;
    }

    // place this cloud back into the chain past the rightmost cloud
    respawn(rightEdge) {
        let gap = Math.random() * layout.maxGap * state.gapRamp;   // edge-to-edge gap
        if (gap < state.minGap) {
            gap = -2;
        }
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
        this.el.style.transform = `translate3d(${this.x}px, ${-this.y}px, 0)`;
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
    let dt = (timestamp - lastTime) / (1000 / 60);
    lastTime = timestamp;

    dt = Math.min(Math.max(dt, 0), 3);

    if (state.gameStarted && !state.gameOver) {
        player.applyPhysics(dt);

        let rightEdge = -Infinity;
        for (let i = 0; i < clouds.length; i++) {
            if (clouds[i].x > rightEdge) rightEdge = clouds[i].x;
        }
        rightEdge += config.cloudWidth;

        for (let i = 0; i < clouds.length; i++) {
            const c = clouds[i];
            c.move(dt);

            if (c.isOffScreen()) {
                rightEdge = c.respawn(rightEdge);
            }
            c.render();
        }

        // checkLanding may snap player.y onto a cloud top, so render after it
        player.checkLanding(clouds);
        player.render();

        if (player.y < 0) {
            state.gameOver = true;
            showGameInstructions();
        }

        state.score += config.cloudSpeed * state.speedRamp * 0.1 * dt;
        scoreDisplay.textContent = Math.floor(state.score) + 'm';

        state.difficulty += 0.01 * dt;
        increaseDifficulty();
    }

    requestAnimationFrame(update);
}

function increaseDifficulty() {
    state.gapRamp = Math.min(1, 0.5 + (state.difficulty * 0.01));

    if (state.minGap >= 25) {
        state.minGap = Math.max(15, 50 - (state.difficulty * 0.1));
    }

    state.speedRamp = 1 + (state.difficulty * 0.04);
}

function calculateMaxGap() {
    const maxTimeInAir = (2 * config.maxPower) / config.gravity;
    const edgeToEdgeGap = config.cloudSpeed * state.speedRamp * maxTimeInAir;
    layout.maxGap = config.cloudWidth + edgeToEdgeGap;
}


// ============================================================
// Reset and Init Functions
// ============================================================

function initGame() {
    if (state.initialized) return;
    state.initialized = true;

    layout.gameWidth = game.clientWidth;

    calculateMaxGap();
}

function createClouds(startX, gap, Y) {
    let cloudSplit = Math.floor(config.numClouds/2);
    let cloudSplitX = 50;
    for (let i = 0; i < cloudSplit; i++) {
        clouds.push(new Cloud(startX + (i * gap), Y));
    }
    for (let i = cloudSplit; i < config.numClouds; i++) {
        clouds.push(new Cloud(startX + cloudSplitX + (i * gap), Y));
    }
}

function reset() {
    state.gameStarted = false;
    state.gameOver = false;
    state.score = 0;
    state.difficulty = 0;
    state.minGap = 50;
    state.gapRamp = 0.5;
    state.speedRamp = 1;

    player.reset();
    scoreDisplay.textContent = Math.floor(state.score) + 'm';
    showGameInstructions();

    clouds.forEach((c, i) => {
        c.setPosition(layout.cloudStartX + (i * config.cloudWidth), config.cloudY);
    });
}


// ============================================================
// UI helpers
// ============================================================
function setInstructionsVisible(visible) {
    const display = visible ? 'block' : 'none';
    if (layout.mobile) {
        mobileInstructions.style.display = display;
    } else {
        desktopInstructions.style.display = display;
    }
}

function showGameInstructions() {
    if (state.gameOver) {
        gameOverText.style.display = 'block';
        playAgain.style.display = 'block';
        setInstructionsVisible(false);
    } else if (state.gameStarted) {
        gameOverText.style.display = 'none';
        playAgain.style.display = 'none';
        setInstructionsVisible(false);
    } else if (!state.gameWindowOpen) {
        gameOverText.style.display = 'none';
        playAgain.style.display = 'none';
        startGame.style.display = 'block';
        mobileInstructions.style.display = 'none';
        desktopInstructions.style.display = 'none';
    } else {
        gameOverText.style.display = 'none';
        playAgain.style.display = 'none';
        setInstructionsVisible(true);
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
    showGameInstructions();

    if (!state.loopRunning) {
        state.loopRunning = true;
        requestAnimationFrame(update);
    }
}

document.addEventListener('keydown', (event) => {
    if (state.gameWindowOpen) {
        if (event.repeat) return;
        if (event.code === 'Space') {
            beginJump();
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (state.gameWindowOpen) {
        if (event.code === 'Space') {
            player.stopCharging();
        }
    }
});

gameContainer.addEventListener('pointerdown', (event) => {
    if (state.gameWindowOpen) {
        event.preventDefault();  // stops the page scrolling while playing
        beginJump();
    }
}, { passive: false });

gameContainer.addEventListener('pointerup', (event) => {
    if (state.gameWindowOpen) {
        event.preventDefault();
        player.stopCharging();
    }
}, { passive: false });

gameContainer.addEventListener('pointercancel', (event) => {
    if (state.gameWindowOpen) {
        player.stopCharging();
    }
});

// also guard against the finger sliding off the game area mid-charge
gameContainer.addEventListener('pointerleave', (event) => {
    if (state.gameWindowOpen && player.charging) {
        player.stopCharging();
    }
});

playAgain.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    reset();
});

function closeCloudJumper() {
    state.gameWindowOpen = false;
    reset();
}

startGame.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    state.gameWindowOpen = true;
    startGame.style.display = 'none';
    showGameInstructions();
});


// ============================================================
// Boot
// ============================================================
createClouds(layout.cloudStartX, config.cloudWidth, config.cloudY);