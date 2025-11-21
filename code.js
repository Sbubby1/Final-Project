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
// Utility function (kept for other use)
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