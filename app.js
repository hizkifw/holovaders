let canvas = null;
let ctx = null;
let gameState = {
  playerX: 400,
  playerY: 500,
  isPlayerDead: false,
};
let keyStates = {
  ArrowLeft: false,
  ArrowRight: false,
};
// Bullet info
// [x, y]
let bullets = [];
let enemies = [];
// Offset in units (not pixels)
// 0 => horizontal movement, positive goes right
// 1 => vertical movement, positive goes down
let enemyOffset = [0, 0];
const enemyOffsetStep = [10, 5];
const enemyStepsX = 5;
let drawFrame = 0;
let physicsFrame = 0;

window.onkeydown = (e) => {
  keyStates[e.key] = true;
  if (e.key === " ") handleShoot();
};
window.onkeyup = (e) => {
  keyStates[e.key] = false;
};

window.onload = () => {
  initCanvas();
  initEnemies();

  drawLoop();
  physicsLoop();
};

const handleShoot = () => {
  bullets.push([gameState.playerX, gameState.playerY]);
};

const initCanvas = () => {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
};

const initEnemies = () => {
  const nEnemiesX = 11;
  const enemySize = 64;
  const enemyRowWidth = nEnemiesX * enemySize;
  const totalTravelX = enemyStepsX * enemyOffsetStep[0];
  const offsetX = (canvas.width - enemyRowWidth - totalTravelX) / 2;
  for (let i = 0; i < nEnemiesX; i++) {
    for (let layer = 1; layer < 5; layer++) {
      enemies.push({
        x: offsetX + i * enemySize,
        y: layer * enemySize,
        sprite: document.getElementById("img" + layer),
      });
    }
  }
};

const physicsLoop = () => {
  physicsFrame++;
  setTimeout(physicsLoop, 1000 / 60);

  if (gameState.isPlayerDead) return;

  // Handle key down
  if (keyStates.ArrowLeft) {
    gameState.playerX -= 5;
  }
  if (keyStates.ArrowRight) {
    gameState.playerX += 5;
  }

  // Prevent player going off screen
  if (gameState.playerX > canvas.width) gameState.playerX = canvas.width;
  else if (gameState.playerX < 0) gameState.playerX = 0;

  // Update bullet positions and remove off-screen ones
  bullets = bullets
    .map((bullet) => [bullet[0], bullet[1] - 5])
    .filter((bullet) => bullet[1] > 0);

  enemies.forEach((enemy, iE) => {
    // Check for bullet-enemy collision
    bullets.forEach((bullet, iB) => {
      if (checkPointEnemyCollision(bullet[0], bullet[1], enemy)) {
        // Enemy hit by bullet
        // Destroy bullet
        bullets[iB][1] = -1;
        // Destroy enemy
        enemies[iE].y = -9999;
      }
    });

    // Check for player-enemy collision
    if (checkPointEnemyCollision(gameState.playerX, gameState.playerY, enemy)) {
      // Player is dead
      gameState.isPlayerDead = true;
    }
  });

  // Clean up enemies
  enemies = enemies.filter((enemy) => enemy.y >= 0);

  // Update enemy positions
  if (physicsFrame % 30 === 0) {
    if (enemyOffset[1] % 2 === 0) enemyOffset[0]++;
    else enemyOffset[0]--;
    if (enemyOffset[0] >= enemyStepsX || enemyOffset[0] <= 0) enemyOffset[1]++;
  }
};

const checkPointEnemyCollision = (pointX, pointY, enemy) => {
  const enemyX = enemy.x + enemyOffset[0] * enemyOffsetStep[0];
  const enemyY = enemy.y + enemyOffset[1] * enemyOffsetStep[1];
  return (
    pointX > enemyX &&
    pointY > enemyY &&
    pointX < enemyX + enemy.sprite.width &&
    pointY < enemyY + enemy.sprite.height
  );
};

const drawLoop = () => {
  drawFrame++;
  requestAnimationFrame(drawLoop);

  // Clear screen
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player
  const imgPlayer = document.getElementById("imgPlayer");
  ctx.drawImage(
    imgPlayer,
    gameState.playerX - imgPlayer.width / 2,
    gameState.playerY
  );

  // Draw bullets
  ctx.fillStyle = "#0D0";
  bullets.forEach((bullet) => ctx.fillRect(bullet[0], bullet[1], 5, 5));

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.drawImage(
      enemy.sprite,
      enemy.x + enemyOffset[0] * enemyOffsetStep[0],
      enemy.y + enemyOffset[1] * enemyOffsetStep[1]
    );
  });

  // Game over screen
  if (gameState.isPlayerDead) {
    ctx.font = "48px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 70);
    ctx.fillStyle = "#000";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    ctx.font = "24px monospace";
    ctx.fillText(
      "Refresh to restart",
      canvas.width / 2,
      canvas.height / 2 + 24
    );
  }
};
