const game = document.querySelector("#game");
const playArea = document.querySelector("#playArea");
const player = document.querySelector("#player");
const muzzle = document.querySelector("#muzzle");
const scoreText = document.querySelector("#score");
const missesText = document.querySelector("#misses");
const finalScoreText = document.querySelector("#finalScore");
const gameOverPanel = document.querySelector("#gameOver");
const restartButton = document.querySelector("#restartButton");
const gameOverRestartButton = document.querySelector("#gameOverRestartButton");

const maxMisses = 5;
const spawnDelay = 880;
const baseSpeed = 138;
const worldSpeed = 130;
const targetWidth = 58;
const targetHeight = 94;
const playerDangerRadius = 58;
const targetColors = ["target-magenta", "target-cyan", "target-green", "target-red"];

// Patrones ordenados: el juego los recorre en ciclo para que haya variedad sin caos.
const enemyPatterns = [
  { side: "right-ground", mode: "jump", aimY: -20, speed: 1.0 },
  { side: "right-air", mode: "fly", aimY: -64, speed: 0.92 },
  { side: "top-right", mode: "fly", aimY: -46, speed: 1.08 },
  { side: "top-center", mode: "drop", aimY: -34, speed: 1.02 },
  { side: "bottom-right", mode: "leap", aimY: -24, speed: 1.16 },
  { side: "left-air", mode: "fly", aimY: -52, speed: 0.95 },
  { side: "right-high", mode: "fly", aimY: -70, speed: 1.0 },
];

let score = 0;
let misses = 0;
let targets = [];
let spawnIndex = 0;
let skyScroll = 0;
let buildingScroll = 0;
let groundScroll = 0;
let lastFrameTime = 0;
let spawnTimer = 0;
let animationId = 0;
let gameRunning = false;

function startGame() {
  score = 0;
  misses = 0;
  spawnIndex = 0;
  targets.forEach((target) => target.element.remove());
  targets = [];

  clearShotEffects();
  resetParallax();
  updateHud();
  gameOverPanel.hidden = true;
  gameRunning = true;
  player.classList.add("is-running");
  createTarget();
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

// Crea un enemigo con elementos HTML, sin canvas.
function createTarget() {
  const pattern = enemyPatterns[spawnIndex % enemyPatterns.length];
  const startPoint = getPatternStart(pattern);
  const colorClass = targetColors[spawnIndex % targetColors.length];
  spawnIndex += 1;

  const element = document.createElement("div");
  element.className = `target ${colorClass} target-${pattern.mode}`;
  element.style.left = "0px";
  element.style.top = "0px";
  element.innerHTML = `
    <span class="target-tag">${pattern.mode.toUpperCase()}</span>
    <span class="target-flame"></span>
    <span class="target-head"></span>
    <span class="target-body"></span>
    <span class="target-arm target-arm-left"></span>
    <span class="target-arm target-arm-right"></span>
    <span class="target-leg target-leg-left"></span>
    <span class="target-leg target-leg-right"></span>
  `;

  const target = {
    element,
    mode: pattern.mode,
    aimY: pattern.aimY,
    width: targetWidth,
    height: targetHeight,
    x: startPoint.x,
    y: startPoint.y,
    displayY: startPoint.y,
    age: 0,
    speed: randomNumber(baseSpeed, baseSpeed + 48) * pattern.speed,
    bobAmount: randomNumber(10, 24),
    bobSpeed: randomNumber(5, 8),
    hopAmount: randomNumber(28, 54),
    hopSpeed: randomNumber(5, 8),
    phase: randomNumber(0, 628) / 100,
  };

  // Pointer events funcionan con raton, stylus y pantalla tactil.
  element.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    hitTarget(target);
  });

  playArea.appendChild(element);
  targets.push(target);
  renderTarget(target);
}

function getPatternStart(pattern) {
  const areaWidth = playArea.clientWidth;
  const areaHeight = playArea.clientHeight;
  const floorTop = getFloorTop();

  if (pattern.side === "right-ground") {
    return { x: areaWidth - targetWidth * 0.3, y: floorTop - targetHeight };
  }

  if (pattern.side === "right-air") {
    return { x: areaWidth - targetWidth * 0.15, y: areaHeight * 0.25 };
  }

  if (pattern.side === "top-right") {
    return { x: areaWidth * 0.78, y: -targetHeight - 36 };
  }

  if (pattern.side === "top-center") {
    return { x: areaWidth * 0.48, y: -targetHeight - 42 };
  }

  if (pattern.side === "bottom-right") {
    return { x: areaWidth * 0.76, y: areaHeight + targetHeight + 20 };
  }

  if (pattern.side === "left-air") {
    return { x: -targetWidth - 90, y: areaHeight * 0.2 };
  }

  return { x: areaWidth - targetWidth * 0.2, y: areaHeight * 0.14 };
}

// Al tocar/clicar un enemigo, el personaje dispara y suma un punto.
function hitTarget(target) {
  if (!gameRunning) {
    return;
  }

  const hitPoint = getTargetCenter(target.element);

  score += 1;
  showShot(hitPoint.x, hitPoint.y);
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

  // Limitamos el salto de tiempo si el navegador pausa la pestana.
  const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.05);
  lastFrameTime = currentTime;
  spawnTimer += deltaTime * 1000;

  if (spawnTimer >= spawnDelay) {
    spawnTimer = 0;
    createTarget();
  }

  updateParallax(deltaTime);
  moveTargets(deltaTime);
  animationId = requestAnimationFrame(gameLoop);
}

// Mueve todos los enemigos hacia el jugador con vuelo, caida o saltos.
function moveTargets(deltaTime) {
  const playerPoint = getPlayerPoint();

  targets.slice().forEach((target) => {
    target.age += deltaTime;
    moveTargetTowardPlayer(target, playerPoint, deltaTime);
    renderTarget(target);

    if (isTouchingPlayer(target, playerPoint)) {
      missTarget(target, playerPoint);
    }
  });

  if (misses >= maxMisses) {
    endGame();
  }
}

function moveTargetTowardPlayer(target, playerPoint, deltaTime) {
  const targetCenterX = target.x + target.width / 2;
  const targetCenterY = target.y + target.height / 2;
  const goalX = playerPoint.x;
  const goalY = playerPoint.y + target.aimY;
  const deltaX = goalX - targetCenterX;
  const deltaY = goalY - targetCenterY;
  const distance = Math.max(Math.hypot(deltaX, deltaY), 1);
  const travel = target.speed * deltaTime;

  target.x += (deltaX / distance) * travel;
  target.y += (deltaY / distance) * travel;
}

function renderTarget(target) {
  let extraY = 0;

  if (target.mode === "jump" || target.mode === "leap") {
    extraY = -Math.abs(Math.sin(target.age * target.hopSpeed + target.phase)) * target.hopAmount;
  } else {
    extraY = Math.sin(target.age * target.bobSpeed + target.phase) * target.bobAmount;
  }

  target.displayY = target.y + extraY;
  target.element.style.transform = `translate(${target.x}px, ${target.displayY}px)`;
}

function isTouchingPlayer(target, playerPoint) {
  const enemyCenterX = target.x + target.width / 2;
  const enemyCenterY = target.displayY + target.height / 2;
  const distanceToPlayer = Math.hypot(enemyCenterX - playerPoint.x, enemyCenterY - playerPoint.y);

  return distanceToPlayer < playerDangerRadius;
}

function missTarget(target, playerPoint) {
  misses += 1;
  showPlayerHit(playerPoint.x, playerPoint.y);
  removeTarget(target);
  updateHud();
}

function endGame() {
  gameRunning = false;
  player.classList.remove("is-running");
  cancelAnimationFrame(animationId);
  gameOverPanel.hidden = false;
}

// Las tres capas se mueven a velocidades diferentes para crear parallax.
function updateParallax(deltaTime) {
  skyScroll = wrapScroll(skyScroll, worldSpeed * 0.12, deltaTime, 430);
  buildingScroll = wrapScroll(buildingScroll, worldSpeed * 0.45, deltaTime, 620);
  groundScroll = wrapScroll(groundScroll, worldSpeed, deltaTime, 224);

  game.style.setProperty("--sky-scroll", `${skyScroll}px`);
  game.style.setProperty("--building-scroll", `${buildingScroll}px`);
  game.style.setProperty("--ground-scroll", `${groundScroll}px`);
}

function resetParallax() {
  skyScroll = 0;
  buildingScroll = 0;
  groundScroll = 0;
  updateParallax(0);
}

// Dibuja un disparo mas dramatico desde el arma hasta el enemigo tocado.
function showShot(endX, endY) {
  const start = getMuzzlePoint();
  const deltaX = endX - start.x;
  const deltaY = endY - start.y;
  const length = Math.hypot(deltaX, deltaY);
  const angle = Math.atan2(deltaY, deltaX);

  createShotLine(start, length, angle, "shot-line-glow", -4);
  createShotLine(start, length, angle, "shot-line-core", 0);
  createShotLine(start, length * 0.86, angle, "shot-line-hot", 4);
  createImpact(endX, endY);

  game.classList.remove("is-shaking");
  player.classList.remove("is-firing");
  void game.offsetWidth;
  game.classList.add("is-shaking");
  player.classList.add("is-firing");

  setTimeout(() => {
    game.classList.remove("is-shaking");
  }, 180);
}

function createShotLine(start, length, angle, className, offsetY) {
  const line = document.createElement("div");
  line.className = `shot-line ${className}`;
  line.style.left = `${start.x}px`;
  line.style.top = `${start.y + offsetY}px`;
  line.style.width = `${length}px`;
  line.style.transform = `rotate(${angle}rad)`;

  playArea.appendChild(line);
  setTimeout(() => line.remove(), 240);
}

function createImpact(x, y) {
  const particles = [];
  const ring = document.createElement("div");
  ring.className = "hit-ring";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  playArea.appendChild(ring);

  const spark = document.createElement("div");
  spark.className = "hit-spark";
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  playArea.appendChild(spark);

  for (let index = 0; index < 10; index += 1) {
    const particle = document.createElement("div");
    const angle = (Math.PI * 2 * index) / 10;
    const distance = randomNumber(32, 72);

    particle.className = "hit-particle";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    playArea.appendChild(particle);
    particles.push(particle);
  }

  setTimeout(() => {
    ring.remove();
    spark.remove();
    particles.forEach((particle) => particle.remove());
  }, 420);
}

function showPlayerHit(x, y) {
  const spark = document.createElement("div");
  spark.className = "player-hit";
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  playArea.appendChild(spark);

  game.classList.remove("is-shaking");
  player.classList.remove("is-hit");
  void game.offsetWidth;
  game.classList.add("is-shaking");
  player.classList.add("is-hit");

  setTimeout(() => {
    spark.remove();
    game.classList.remove("is-shaking");
    player.classList.remove("is-hit");
  }, 260);
}

function clearShotEffects() {
  document
    .querySelectorAll(".shot-line, .hit-spark, .hit-ring, .hit-particle, .player-hit")
    .forEach((effect) => effect.remove());
  game.classList.remove("is-shaking");
  player.classList.remove("is-firing", "is-hit");
}

function getMuzzlePoint() {
  const areaRect = playArea.getBoundingClientRect();
  const muzzleRect = muzzle.getBoundingClientRect();

  return {
    x: muzzleRect.left + muzzleRect.width / 2 - areaRect.left,
    y: muzzleRect.top + muzzleRect.height / 2 - areaRect.top,
  };
}

function getPlayerPoint() {
  const areaRect = playArea.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();

  return {
    x: playerRect.left + playerRect.width * 0.58 - areaRect.left,
    y: playerRect.top + playerRect.height * 0.52 - areaRect.top,
  };
}

function getTargetCenter(element) {
  const areaRect = playArea.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();

  return {
    x: targetRect.left + targetRect.width / 2 - areaRect.left,
    y: targetRect.top + targetRect.height / 2 - areaRect.top,
  };
}

function getFloorTop() {
  const compactHeight = playArea.clientHeight <= 620;
  return playArea.clientHeight - (compactHeight ? 124 : 150);
}

function wrapScroll(currentScroll, speed, deltaTime, tileWidth) {
  return (currentScroll - speed * deltaTime) % tileWidth;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

restartButton.addEventListener("click", startGame);
gameOverRestartButton.addEventListener("click", startGame);

startGame();
