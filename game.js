// ============================================================
//  SETUP
// ============================================================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 480;
canvas.height = 640;

// ============================================================
//  GAME STATE
// ============================================================
let score = 0;
let gameOver = false;
let bullets = [];
let enemies = [];
let enemySpawnTimer = 0;
const ENEMY_SPAWN_INTERVAL = 60; // frames between spawns

// Track which keys are currently held down
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  // prevent page scroll on space/arrows
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => { keys[e.key] = false; });

// ============================================================
//  PLAYER
//  -> Challenge: replace the rectangle with a sprite!
// ============================================================
const player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 60,
  width: 30,
  height: 30,
  speed: 5,
  shootCooldown: 0,
  SHOOT_DELAY: 10, // frames between shots
};

function updatePlayer() {
  // movement — WASD and arrow keys
  if (keys["ArrowLeft"]  || keys["a"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
  if (keys["ArrowUp"]    || keys["w"]) player.y -= player.speed;
  if (keys["ArrowDown"]  || keys["s"]) player.y += player.speed;

  // keep player inside the canvas
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

  // shooting
  if (player.shootCooldown > 0) player.shootCooldown--;
  if (keys[" "] && player.shootCooldown === 0) {
    spawnBullet(player.x + player.width / 2 - 2, player.y);
    player.shootCooldown = player.SHOOT_DELAY;
    // -> Challenge: play a shooting sound here!
  }
}

function drawPlayer() {
  // -> Challenge: draw a sprite image instead of a rectangle!
  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// ============================================================
//  BULLETS
//  -> Challenge: add particle trails behind each bullet!
// ============================================================
function spawnBullet(x, y) {
  bullets.push({ x, y, width: 4, height: 12, speed: 7 });
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;
    // remove bullets that leave the screen
    if (bullets[i].y + bullets[i].height < 0) {
      bullets.splice(i, 1);
    }
  }
}

function drawBullets() {
  ctx.fillStyle = "#fff";
  for (const b of bullets) {
    // -> Challenge: replace with a glowing sprite or particle!
    ctx.fillRect(b.x, b.y, b.width, b.height);
  }
}

// ============================================================
//  ENEMIES
//  -> Challenge: add different enemy types with varying size/speed!
// ============================================================
function spawnEnemy() {
  const width = 30;
  const x = Math.random() * (canvas.width - width);
  enemies.push({ x, y: -30, width, height: 30, speed: 2 + Math.random() * 2 });
}

function updateEnemies() {
  // spawn on a timer
  enemySpawnTimer++;
  if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed;

    // enemy reached the bottom — game over
    if (enemies[i].y > canvas.height) {
      gameOver = true;
      // -> Challenge: play a game-over sound here!
    }
  }
}

function drawEnemies() {
  ctx.fillStyle = "#fff";
  for (const e of enemies) {
    // -> Challenge: replace with enemy sprites, add hit animations!
    ctx.fillRect(e.x, e.y, e.width, e.height);
  }
}

// ============================================================
//  COLLISIONS
//  -> Challenge: spawn an explosion particle effect on hit!
// ============================================================
function checkCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (rectsOverlap(bullets[i], enemies[j])) {
        // -> Challenge: add screen shake here!
        // -> Challenge: spawn explosion particles here!
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        score += 100;
        break;
      }
    }
  }

  // check player-enemy collision
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (rectsOverlap(player, enemies[i])) {
      gameOver = true;
      // -> Challenge: play an explosion sound and show particles!
    }
  }
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ============================================================
//  HUD (heads-up display)
//  -> Challenge: add a health bar, combo counter, high score!
// ============================================================
function drawHUD() {
  ctx.fillStyle = "#fff";
  ctx.font = "18px monospace";
  ctx.textAlign = "left";
  ctx.fillText("SCORE: " + score, 10, 28);
}

// ============================================================
//  GAME OVER SCREEN
//  -> Challenge: add a restart animation or transition!
// ============================================================
function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "36px monospace";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

  ctx.font = "18px monospace";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 50);
}

function restartGame() {
  score = 0;
  gameOver = false;
  bullets = [];
  enemies = [];
  enemySpawnTimer = 0;
  player.x = canvas.width / 2 - 15;
  player.y = canvas.height - 60;
}

// ============================================================
//  MAIN GAME LOOP
// ============================================================
function gameLoop() {
  // -> Challenge: add a starfield background instead of plain black!
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    updatePlayer();
    updateBullets();
    updateEnemies();
    checkCollisions();

    drawPlayer();
    drawBullets();
    drawEnemies();
    drawHUD();
  } else {
    // still draw everything frozen behind the overlay
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawHUD();
    drawGameOver();

    if (keys["r"]) restartGame();
  }

  requestAnimationFrame(gameLoop);
}

// kick it off
gameLoop();
