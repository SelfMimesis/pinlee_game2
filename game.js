const playArea = document.querySelector("#playArea");
const scoreText = document.querySelector("#score");
const missesText = document.querySelector("#misses");
const finalScoreText = document.querySelector("#finalScore");
const gameOverPanel = document.querySelector("#gameOver");
const restartButton = document.querySelector("#restartButton");
const gameOverRestartButton = document.querySelector("#gameOverRestartButton");

const maxMisses = 5;
const spawnDelay = 900;
const baseSpeed = 170;

let score = 0;
let misses = 0;
let targets = [];
let lastFrameTime = 0;
let spawnTimer = 0;
let animationId = 0;
let gameRunning = false;

function startGame() {
  score = 0;
  misses = 0;
  targets.forEach((target) => target.element.remove());
  targets = [];

  updateHud();
  gameOverPanel.hidden = true;
  gameRunning = true;
  spawnTimer = 0;
  lastFrameTime = performance.now();

  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

function updateHud() {
  scoreText.textContent = score;
  missesText.textContent = misses;
  finalScoreText.textContent = score;
}

function createTarget() {
  const areaWidth = playArea.clientWidth;
  const areaHeight = playArea.clientHeight;
  const size = randomNumber(54, 92);
  const hudSpace = 88;
  const minTop = hudSpace;
  const maxTop = Math.max(minTop, areaHeight - size - 24);
  const top = randomNumber(minTop, maxTop);

  const element = document.createElement("div");
  element.className = "target";
  element.style.setProperty("--size", `${size}px`);
  element.style.left = `${areaWidth}px`;
  element.style.top = `${top}px`;

  const target = {
    element,
    size,
    x: areaWidth,
    speed: randomNumber(baseSpeed, baseSpeed + 90),
  };

  // Pointer events funcionan igual con raton, stylus y pantalla tactil.
  element.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    hitTarget(target);
  });

  playArea.appendChild(element);
  targets.push(target);
}

function hitTarget(target) {
  if (!gameRunning) {
    return;
  }

  score += 1;
  removeTarget(target);
  updateHud();
}

function removeTarget(target) {
  target.element.remove();
  targets = targets.filter((currentTarget) => currentTarget !== target);
}

function gameLoop(currentTime) {
  if (!gameRunning) {
    return;
  }

  const deltaTime = (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;
  spawnTimer += deltaTime * 1000;

  if (spawnTimer >= spawnDelay) {
    spawnTimer = 0;
    createTarget();
  }

  moveTargets(deltaTime);
  animationId = requestAnimationFrame(gameLoop);
}

function moveTargets(deltaTime) {
  targets.slice().forEach((target) => {
    target.x -= target.speed * deltaTime;
    target.element.style.left = `${target.x}px`;

    if (target.x + target.size < 0) {
      misses += 1;
      removeTarget(target);
      updateHud();
    }
  });

  if (misses >= maxMisses) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  gameOverPanel.hidden = false;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

restartButton.addEventListener("click", startGame);
gameOverRestartButton.addEventListener("click", startGame);

startGame();
