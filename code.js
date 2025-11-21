// Get the canvas and drawing context
let canvas = document.getElementById("gameCanvas");
let pencil = canvas.getContext("2d");
pencil.imageSmoothingEnabled = false;
//grab zombie images
let zombieBack = document.getElementById("zombie_back");
let zombieFront = document.getElementById("zombie_front");
let zombieRight = document.getElementById("zombie_right");
let zombieLeft = document.getElementById("zombie_left");
// grab bush images
let bushBack = document.getElementById("bush_back");
let bushFront = document.getElementById("bush_front");
let bushRight = document.getElementById("bush_right");
let bushLeft = document.getElementById("bush_left");


// grab heart image
let heart= document.getElementById("heart");

// projectile
let itemSprite = document.getElementById("coin");

// -----------------------------------------------
// Projectiles (coin sprite used as projectile)

let projectiles = []; // active projectiles

function spawnProjectile(shooter) {
    
    let now = Date.now();
    if (shooter.fireRate && (now - (shooter.lastShot || 0)) < shooter.fireRate) {
        return;
    }
    shooter.lastShot = now;

    
    let speed = 12;
    let vx = 0, vy = 0;
    let pWidth = 24, pHeight = 24;
    let px = shooter.x + shooter.width / 2 - pWidth / 2;
    let py = shooter.y + shooter.height / 2 - pHeight / 2;

    if (shooter === zombie) {
        vx = speed;
        vy = 0;
        // spawn at right edge
        px = shooter.x + shooter.width;
    } else if (shooter === bush) {
        vx = -speed;
        vy = 0;
        // spawn at left edge
        px = shooter.x - pWidth;
    }

    projectiles.push({
        x: px,
        y: py,
        width: pWidth,
        height: pHeight,
        vx: vx,
        vy: vy,
        owner: shooter,
        image: itemSprite
    });
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        // remove if off-screen
        if (p.x + p.width < 0 || p.x > canvas.width || p.y + p.height < 0 || p.y > canvas.height) {
            projectiles.splice(i, 1);
            continue;
        }
        // check collision with zombie/bush (don't hit owner) and only if target still alive
        let targets = [zombie, bush];
        for (let t of targets) {
            if (t !== p.owner && t.lives > 0 && rectsIntersect(p, t)) {
                console.log("projectile hit", t === zombie ? "zombie" : "bush");
                // reduce life and remove projectile
                t.lives = Math.max(0, (t.lives || 0) - 1);
                projectiles.splice(i, 1);
                break;
            }
        }
    }
}

function drawProjectiles() {
    for (let p of projectiles) {
        if (p.image) {
            try {
                pencil.drawImage(p.image, p.x, p.y, p.width, p.height);
            } catch (e) {
                // fallback if image not loaded
                pencil.fillStyle = "yellow";
                pencil.fillRect(p.x, p.y, p.width, p.height);
            }
        } else {
            pencil.fillStyle = "yellow";
            pencil.fillRect(p.x, p.y, p.width, p.height);
        }
    }
}

function rectsIntersect(a, b) {
    return !(a.x + a.width < b.x || a.x > b.x + b.width || a.y + a.height < b.y || a.y > b.y + b.height);
}
// -----------------------------------------------
// Character objects
// Zombie
let zombie = {
    x: 50,
    y: 150,
    width: 100,
    height: 100,
    speed: 10,
    upKey: "w",
    downKey: "s",
    sprite : {
        back : zombieBack, 
        front : zombieFront, 
        right : zombieRight, 
        left : zombieLeft,
    },
    currentSprite : zombieFront,
    lastDirection: "right",
    //fire rate in milliseconds and lastShot timestamp
    fireRate: 250,        // 250 ms between shots
    lastShot: 0,
    // lives system
    maxLives: 3,
    lives: 3,
    draw: function() {
        if (this.lives > 0) {
            pencil.drawImage(this.currentSprite, this.x, this.y, this.width, this.height);
        }
    },
    // only up/down movement
    move: function(keysPressed) {
        if (keysPressed[this.upKey]) {
            this.y -= this.speed;
            this.currentSprite = this.sprite.back;
            this.lastDirection = "up";
        } else if (keysPressed[this.downKey]){
            this.y += this.speed;
            this.currentSprite = this.sprite.front;
            this.lastDirection = "down";
        }
        // clamp to canvas (x locked so horizontal position won't change)
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
    }
};

// Bush
let bush = {
    x: 450,
    y: 150,
    width: 100,
    height: 100,
    speed: 10,
    upKey: "ArrowUp",
    downKey: "ArrowDown",
    sprite : {
        back : bushBack, 
        front : bushFront, 
        right : bushRight, 
        left : bushLeft,
    },
    currentSprite : bushFront,
    lastDirection: "left",
    
    fireRate: 250,        
    lastShot: 0,
    // lives system
    maxLives: 3,
    lives: 3,
    draw: function() {
        if (this.lives > 0) {
            pencil.drawImage(this.currentSprite, this.x, this.y, this.width, this.height);
        }
    },
    // only up/down movement
    move: function(keysPressed) {
        if (keysPressed[this.upKey]) {
            this.y -= this.speed;
            this.currentSprite = this.sprite.back;
            this.lastDirection = "up";
        } else if (keysPressed[this.downKey]){
            this.y += this.speed;
            this.currentSprite = this.sprite.front;
            this.lastDirection = "down";
        }
        // clamp to canvas (x locked)
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
    }
};

// -----------------------------------------------
// Track pressed keys + firing
let keysPressed = {};
window.addEventListener("keydown", function(e) {
    keysPressed[e.key] = true;
    // firing keys: zombie = 'f', bush = 'm'
    if (e.key === "f") spawnProjectile(zombie);
    if (e.key === "m") spawnProjectile(bush);
});
window.addEventListener("keyup", function(e) {
    keysPressed[e.key] = false;
});

// -----------------------------------------------
// Utility function
function getDistance(a, b) {
    let dx = (a.x + a.width/2) - (b.x + b.width/2);
    let dy = (a.y + a.height/2) - (b.y + b.height/2);
    return Math.sqrt(dx*dx + dy*dy);
}

// draw lives (hearts) UI
function drawLives() {
    const heartW = 24;
    const heartH = 24;
    const spacing = 6;
    const margin = 8;

    // zombie - top left
    for (let i = 0; i < zombie.lives; i++) {
        const x = margin + i * (heartW + spacing);
        const y = margin;
        if (heart) {
            try { pencil.drawImage(heart, x, y, heartW, heartH); } catch (e) {
                pencil.fillStyle = "red"; pencil.fillRect(x, y, heartW, heartH);
            }
        } else {
            pencil.fillStyle = "red"; pencil.fillRect(x, y, heartW, heartH);
        }
    }

    // bush - top right (draw from right edge inward)
    for (let i = 0; i < bush.lives; i++) {
        const x = canvas.width - margin - heartW - i * (heartW + spacing);
        const y = margin;
        if (heart) {
            try { pencil.drawImage(heart, x, y, heartW, heartH); } catch (e) {
                pencil.fillStyle = "red"; pencil.fillRect(x, y, heartW, heartH);
            }
        } else {
            pencil.fillStyle = "red"; pencil.fillRect(x, y, heartW, heartH);
        }
    }
}

// -----------------------------------------------
// Game loop
function gameLoop() {
    // Draw background (fallback if undefined)
    pencil.clearRect(0, 0, canvas.width, canvas.height);
    if (typeof background !== "undefined") {
        pencil.drawImage(background, 0, 0, canvas.width, canvas.height);
    } else {
        pencil.fillStyle = "#88c";
        pencil.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw lives UI
    drawLives();

    // Move characters (only up/down)
    zombie.move(keysPressed);
    bush.move(keysPressed);

    // Update and draw projectiles
    updateProjectiles();

    // Draw characters
    zombie.draw();
    bush.draw();

    // Draw projectiles on top
    drawProjectiles();

    
}
setInterval(gameLoop, 50);

let gameStarted = false;
const titleButton = {
    x: Math.floor(canvas.width / 2 - 100),
    y: Math.floor(canvas.height / 2 + 40),
    w: 200,
    h: 40
};

function drawTitleScreen() {
    // clear & background
    pencil.clearRect(0, 0, canvas.width, canvas.height);
    pencil.fillStyle = "#031227";
    pencil.fillRect(0, 0, canvas.width, canvas.height);

    // title
    pencil.fillStyle = "#fff";
    pencil.font = "36px sans-serif";
    pencil.textAlign = "center";
    pencil.fillText("Robo Battle", canvas.width / 2, canvas.height / 2 - 20);

    // instructions
    pencil.font = "16px sans-serif";
    pencil.fillStyle = "#ddd";
    pencil.fillText("W/S and ↑/↓ to move. F and M to shoot.", canvas.width / 2, canvas.height / 2 + 10);
    pencil.fillText("Click Start or press Enter/Space to begin", canvas.width / 2, canvas.height / 2 + 34);

    // start button
    pencil.fillStyle = "#2a8";
    pencil.fillRect(titleButton.x, titleButton.y, titleButton.w, titleButton.h);
    pencil.strokeStyle = "#0a5";
    pencil.strokeRect(titleButton.x, titleButton.y, titleButton.w, titleButton.h);

    pencil.fillStyle = "#002";
    pencil.font = "20px sans-serif";
    pencil.fillText("Start Game", canvas.width / 2, titleButton.y + 26);
}

function startGame() {
    if (gameStarted) return;
    // reset minimal state so game starts clean
    projectiles.length = 0;
    if (zombie) { zombie.lives = zombie.maxLives; zombie.x = 50; zombie.y = 150; zombie.lastShot = 0; }
    if (bush)   { bush.lives   = bush.maxLives;   bush.x   = 450; bush.y   = 150; bush.lastShot   = 0; }
    gameStarted = true;
}

// click inside canvas Start button detection (handles high-DPI/scaled canvas)
canvas.addEventListener("click", function (e) {
    if (gameStarted) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    if (cx >= titleButton.x && cx <= titleButton.x + titleButton.w &&
        cy >= titleButton.y && cy <= titleButton.y + titleButton.h) {
        startGame();
    }
});

// keyboard start (Enter / Space)
window.addEventListener("keydown", function (e) {
    if (!gameStarted && (e.key === "Enter" || e.key === " ")) startGame();
});

// replace the last setInterval call so it draws title until started,
// then calls the existing gameLoop (gameLoop itself is unchanged)
setInterval(function () {
    if (!gameStarted) {
        drawTitleScreen();
    } else {
        gameLoop();
    }
}, 50);

(function ensureSingleIntervalController() {
    const last = window.setInterval(() => {}, 1);
    for (let i = 1; i <= last; i++) clearInterval(i);
})();

// only define globals if not already present
if (typeof gameStarted === "undefined") window.gameStarted = false;
if (typeof gameOver === "undefined") window.gameOver = false;
if (typeof winner === "undefined") window.winner = null;

// Title / win button rectangles (canvas coords)
if (typeof titleButton === "undefined") {
    window.titleButton = {
        x: Math.floor(canvas.width / 2 - 100),
        y: Math.floor(canvas.height / 2 + 40),
        w: 200,
        h: 40
    };
}
if (typeof winButton === "undefined") {
    window.winButton = {
        x: Math.floor(canvas.width / 2 - 90),
        y: Math.floor(canvas.height / 2 + 40),
        w: 180,
        h: 36
    };
}

// safe-define drawTitleScreen if not present
if (typeof drawTitleScreen === "undefined") {
    window.drawTitleScreen = function () {
        pencil.clearRect(0, 0, canvas.width, canvas.height);
        pencil.fillStyle = "#031227";
        pencil.fillRect(0, 0, canvas.width, canvas.height);

        pencil.fillStyle = "#fff";
        pencil.font = "36px sans-serif";
        pencil.textAlign = "center";
        pencil.fillText("Zombie vs Bush", canvas.width / 2, canvas.height / 2 - 20);

        pencil.font = "16px sans-serif";
        pencil.fillStyle = "#ddd";
        pencil.fillText("W/S and ↑/↓ to move. F and M to shoot.", canvas.width / 2, canvas.height / 2 + 10);
        pencil.fillText("Click Start or press Enter/Space to begin", canvas.width / 2, canvas.height / 2 + 34);

        pencil.fillStyle = "#2a8";
        pencil.fillRect(titleButton.x, titleButton.y, titleButton.w, titleButton.h);
        pencil.strokeStyle = "#0a5";
        pencil.strokeRect(titleButton.x, titleButton.y, titleButton.w, titleButton.h);

        pencil.fillStyle = "#002";
        pencil.font = "20px sans-serif";
        pencil.fillText("Start Game", canvas.width / 2, titleButton.y + 26);
    };
}

// safe-define drawWinScreen if not present
if (typeof drawWinScreen === "undefined") {
    window.drawWinScreen = function () {
        pencil.clearRect(0, 0, canvas.width, canvas.height);
        pencil.fillStyle = "#001217";
        pencil.fillRect(0, 0, canvas.width, canvas.height);

        pencil.fillStyle = "#fff";
        pencil.font = "34px sans-serif";
        pencil.textAlign = "center";

        let msg = "Draw!";
        if (winner === "Zombie") msg = "Player 1 Wins!";
        else if (winner === "Bush") msg = "Player 2 Wins!";

        pencil.fillText(msg, canvas.width / 2, canvas.height / 2 - 10);

        pencil.font = "16px sans-serif";
        pencil.fillStyle = "#ddd";
        pencil.fillText("Click Restart or press Enter/Space to play again", canvas.width / 2, canvas.height / 2 + 14);

        pencil.fillStyle = "#f57";
        pencil.fillRect(winButton.x, winButton.y, winButton.w, winButton.h);
        pencil.strokeStyle = "#d34";
        pencil.strokeRect(winButton.x, winButton.y, winButton.w, winButton.h);
        pencil.fillStyle = "#200";
        pencil.font = "18px sans-serif";
        pencil.fillText("Restart", canvas.width / 2, winButton.y + 24);
    };
}

// ensure updateProjectiles sets gameOver/winner when lives fall to 0
// (wrap existing function by replacing with a thin wrapper that calls original)
if (typeof window._original_updateProjectiles === "undefined") {
    window._original_updateProjectiles = updateProjectiles;
    window.updateProjectiles = function () {
        // call original to apply damage and remove projectiles
        window._original_updateProjectiles();

        // check for winner (first to reach 0 lives loses)
        if (!gameOver) {
            if (zombie && zombie.lives === 0) {
                gameOver = true;
                winner = "Bush";
            } else if (bush && bush.lives === 0) {
                gameOver = true;
                winner = "Zombie";
            }
        }
    };
}

// reset helper
if (typeof resetGameState === "undefined") {
    window.resetGameState = function () {
        projectiles.length = 0;
        if (zombie) {
            zombie.lives = zombie.maxLives;
            zombie.x = 50; zombie.y = 150; zombie.lastShot = 0;
        }
        if (bush) {
            bush.lives = bush.maxLives;
            bush.x = 450; bush.y = 150; bush.lastShot = 0;
        }
        gameOver = false;
        winner = null;
    };
}

// start and restart helpers
if (typeof startGame === "undefined") {
    window.startGame = function () {
        if (gameStarted) return;
        resetGameState();
        gameStarted = true;
    };
}
if (typeof restartGame === "undefined") {
    window.restartGame = function () {
        resetGameState();
        gameStarted = false;
        drawTitleScreen();
    };
}

// canvas click handler for title/win buttons (adds on top of any existing listeners)
canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (gameOver) {
        if (cx >= winButton.x && cx <= winButton.x + winButton.w &&
            cy >= winButton.y && cy <= winButton.y + winButton.h) {
            restartGame();
        }
        return;
    }

    if (!gameStarted) {
        if (cx >= titleButton.x && cx <= titleButton.x + titleButton.w &&
            cy >= titleButton.y && cy <= titleButton.y + titleButton.h) {
            startGame();
        }
    }
});

// keyboard start/restart (doesn't remove existing key handling)
window.addEventListener("keydown", function (e) {
    if (gameOver && (e.key === "Enter" || e.key === " ")) {
        restartGame();
        return;
    }
    if (!gameStarted && (e.key === "Enter" || e.key === " ")) {
        startGame();
        return;
    }
});

// single controlling interval: shows title until started, runs gameLoop while playing, shows win when over
window._mainControllerInterval = setInterval(function () {
    if (gameOver) {
        drawWinScreen();
    } else if (!gameStarted) {
        drawTitleScreen();
    } else {
        // call the existing gameLoop (unchanged)
        try { gameLoop(); } catch (err) { console.error(err); }
    }
}, 50);

