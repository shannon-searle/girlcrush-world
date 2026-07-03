// ============================================================
// DOM references (non-game-object UI)
// ============================================================
const game = document.querySelector('.cloud-jumper-game');
const cloudJumper = document.getElementById('cloud-jumper');
const gameContainer = document.querySelector('.cloud-jumper-container');
const closeBtn = document.getElementById('cloud-jumper-close')
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
    gapRoundDown: 30, // the closer this is to 10 which is the minimum the more gaps you will see between clouds i.e harder
    gapRamp: 0.5, // scaler closer this gets to 1 the longer the max gap will be
    speedRamp: 1 // want this to increase and get faster 
};

// ============================================================
// Layout — measured/derived values, filled in by initGame()
// ============================================================
const layout = {
    mobile: window.innerWidth <= 768,
    playerLeft: 162,
    centerX: 200.5,
    maxGap: 0,
    gameWidth: 0,
    cloudStart: 70
};

// if mobile player starts change layout
if (layout.mobile) { layout.playerLeft = 32; }
if (layout.mobile) { layout.cloudStart = 10; }
if (layout.mobile) { layout.centerX = 58.5; }

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
        // Two real <img> elements declared in your HTML — both styled by
        // the shared .player-sprite CSS class, so sizing/position is
        // consistent by construction. No cloning, no computed-style
        // workarounds needed.
        this.el = document.getElementById('cloud-jumper');        // platform/idle sprite
        this.jumpEl = document.getElementById('cloud-jumper-jump'); // jumping sprite
        this.y = config.startPlayerY;
        this.prevY = config.startPlayerY;
        this.velocityY = 0;
        this.isJumping = false;
        this.charging = false;
        this.onPlatform = false;
        this.activePlatform = null;

        // fixed anchor — all movement happens via transform from here on,
        // so these elements never trigger layout after initial placement.
        // left/bottom/width/height come from the .player-sprite CSS class;
        // only the mobile left-offset needs a JS override since it depends
        // on layout.playerLeft computed at runtime.
        this.el.style.left = layout.playerLeft + 'px';
        this.jumpEl.style.left = layout.playerLeft + 'px';
        this.el.style.opacity = '1';
        this.jumpEl.style.opacity = '0';

        // We toggle opacity between two pre-loaded, already-in-DOM images
        // instead of swapping a single element's .src — reassigning .src
        // mid-animation forces the browser to redo decode/layout for that
        // element, which visibly hitched the player's motion right at the
        // moment of the swap. Opacity toggling is compositor-only.
        this._pendingImageSwap = null;

        // apply the initial transform now — render() otherwise isn't
        // called until the game loop starts (i.e. after the first jump),
        // which left the player sitting at the bottom:0 anchor (y=0)
        // instead of config.startPlayerY until then
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
            this.el.style.opacity = '0';
        }
        else {
            this._pendingImageSwap = setTimeout(() => {
                this.jumpEl.style.opacity = '0';
                this.el.style.opacity = '1';
                this._pendingImageSwap = null;
            }, 250)
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

    // GPU-composited move: translateY is negative because the anchor
    // is bottom:0, so moving "up" (higher y) means translating up (negative Y).
    // NOTE: tried rounding this to whole pixels to fix sub-pixel blur, but
    // on small/slow movement that caused visible stair-step judder instead
    // (several frames rounding to the same pixel, then jumping 1px) — worse
    // than the blur. Left as float; sub-pixel blur is the lesser issue here.
    // Both twin elements (el + jumpEl) move together — only opacity differs.
    render() {
        const t = `translate3d(0, ${-this.y}px, 0)`;
        this.el.style.transform = t;
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
        this.el.style.opacity = '1';
        this.jumpEl.style.opacity = '0';
        this.render();
    }
}

// ============================================================
// Cloud class — one platform, owns its element and position
// ============================================================
class Cloud {
    static images = [
        "./media/cloud-jumper/cloud1.png",
        "./media/cloud-jumper/cloud1.png",
        "./media/cloud-jumper/cloud2.png"
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

    // randomises the cloud img
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
        if (gap < state.gapRoundDown) {
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

    // GPU-composited move — translate along both axes from the
    // fixed (0,0) anchor set in the constructor. Left as float — see note
    // on Player.render() about rounding causing visible judder.
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
    // Always track elapsed time, even while idle/paused/game-over — this
    // keeps lastTime fresh so dt never spikes huge the moment the game
    // (re)starts after sitting idle. Previously lastTime was frozen while
    // !gameStarted or gameOver, so resuming produced one giant dt (a visible
    // "fast" jump), and on iOS — where rAF timing is more prone to gaps from
    // address-bar/scroll/low-power throttling — this happened often enough
    // to look like a constant fast/slow flicker.
    let dt = (timestamp - lastTime) / (1000 / 60);
    lastTime = timestamp;

    // clamp on BOTH ends: upper bound guards against lag-spike teleports,
    // lower bound (0) guards against a rare backwards/equal timestamp
    // producing negative dt, which would flip gravity's sign for a frame
    // and launch the player the wrong way — another source of "fast" glitches.
    dt = Math.min(Math.max(dt, 0), 3);

    if (state.gameStarted && !state.gameOver) {
        // player physics
        player.applyPhysics(dt);

        // Move clouds
        // right edge of the furthest-right cloud — the anchor for new spawns.
        // Plain loop instead of Math.max(...clouds.map()) to avoid allocating
        // a new array + spreading it every single frame (GC pressure was
        // contributing to the mobile stutter).
        let rightEdge = -Infinity;
        for (let i = 0; i < clouds.length; i++) {
            if (clouds[i].x > rightEdge) rightEdge = clouds[i].x;
        }
        rightEdge += config.cloudWidth;

        for (let i = 0; i < clouds.length; i++) {
            const c = clouds[i];
            c.move(dt);

            // recycle when fully off the left edge
            if (c.isOffScreen()) {
                rightEdge = c.respawn(rightEdge);   // chain the next spawn
            }
            c.render();
        }

        // Collision detection — may snap player.y onto a cloud top
        player.checkLanding(clouds);

        // render AFTER collision so the snapped position is what's painted
        player.render();

        // Game over if player falls off screen
        if (player.y < 0) {
            state.gameOver = true;
            showGameInstructions();
        }

        // update score
        state.score += config.cloudSpeed * state.speedRamp * 0.1 * dt;   // tune the multiplier
        scoreDisplay.textContent = Math.floor(state.score) + 'm';
        
        // update difficulty 
        state.difficulty += 0.01 * dt;
        increaseDifficulty();

    }

    requestAnimationFrame(update);
}

// increase game difficulty 
function increaseDifficulty() {
    state.gapRamp = Math.min(1, 0.5 + (state.difficulty * 0.01));

    if (state.gapRoundDown >= 25) {
        state.gapRoundDown = Math.max(15, 50 - (state.difficulty * 0.1));
    }
    
    state.speedRamp = 1 + (state.difficulty * 0.04);
}

// calculate max gap
function calculateMaxGap() {
    const maxTimeInAir = (2 * config.maxPower) / config.gravity;
    const edgeToEdgeGap = config.cloudSpeed * state.speedRamp * maxTimeInAir;
    layout.maxGap = config.cloudWidth + edgeToEdgeGap;
}


// ============================================================
// Reset and Init Functions
// ============================================================

// initialise game layout
function initGame() {
    if (state.initialized) return;
    state.initialized = true;

    layout.gameWidth = game.clientWidth;

    calculateMaxGap();
}

// create initial clouds
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

// reset game after 'Game Over'
function reset() {
    // reset state
    state.gameStarted = false;
    state.gameOver = false;
    state.score = 0;
    state.difficulty =  0;
    state.gapRoundDown = 50;
    state.gapRamp = 0.5;
    state.speedRamp = 1;

    // reset player
    player.reset();

    // update score
    scoreDisplay.textContent = Math.floor(state.score) + 'm';

    // reset UI
    showGameInstructions();

    // reset cloud positions
    clouds.forEach((c, i) => {
        c.setPosition(layout.cloudStart + (i * config.cloudWidth), config.cloudY);
    });
}


// ============================================================
// UI helpers
// ============================================================
function showGameInstructions() {
    if (state.gameOver) {
        gameOverText.style.display = "block";
        playAgain.style.display = "block";
        if (layout.mobile) {
            mobileInstructions.style.display = 'none';
        }
        else {
            desktopInstructions.style.display = 'none';
        }
    } else if (state.gameStarted) {
        gameOverText.style.display = "none";
        playAgain.style.display = "none";
        if (layout.mobile) {
            mobileInstructions.style.display = 'none';
        }
        else {
            desktopInstructions.style.display = 'none';
        }
    } else if (!state.gameWindowOpen) {
        gameOverText.style.display = "none";
        playAgain.style.display = "none";
        startGame.style.display = "block";
        mobileInstructions.style.display = 'none';
        desktopInstructions.style.display = 'none';

    } else {
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
    showGameInstructions();

    // update() keeps calling requestAnimationFrame(update) on itself forever
    // once started (see bottom of the function) — so the loop only ever
    // needs to be kicked off ONCE. Calling it again here on every jump was
    // stacking a brand new concurrent loop each time, so after a few jumps
    // physics/movement were being applied 2x, 3x, 4x+ per real frame.
    if (!state.loopRunning) {
        state.loopRunning = true;
        requestAnimationFrame(update);
    }
}

// desktop keyboard events
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

// mobile touch events
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

// iOS Safari fires pointercancel (not pointerup) when it decides the touch
// is actually a scroll/zoom gesture, or the finger slides off the element.
// Without this, player.charging can get stuck true forever after a cancel,
// since stopCharging() would never be called.
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

// event listener for play again button
playAgain.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    reset();
});

// event listener for close popup will call reset
function closeCloudJumper() {
    state.gameWindowOpen = false;
    reset();
}

// event listener for start game button
startGame.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    state.gameWindowOpen = true;
    startGame.style.display = 'none';
    showGameInstructions();
});


// ============================================================
// Boot
// ============================================================
createClouds(layout.cloudStart, config.cloudWidth, config.cloudY);