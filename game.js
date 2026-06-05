const game = document.querySelector("#game");
const playArea = document.querySelector("#playArea");
const player = document.querySelector("#player");
const muzzle = document.querySelector("#muzzle");
const parallaxTracks = Array.from(document.querySelectorAll(".city-track"));
const scoreText = document.querySelector("#score");
const missesText = document.querySelector("#misses");
const finalScoreText = document.querySelector("#finalScore");
const gameOverPanel = document.querySelector("#gameOver");
const restartButton = document.querySelector("#restartButton");
const gameOverRestartButton = document.querySelector("#gameOverRestartButton");

const maxMisses = 5;
const maxTargets = 4;
const maxEnemyProjectiles = 4;
const maxDeltaTime = 1 / 30;
const spawnDelay = 1250;
const baseSpeed = 104;
const worldSpeed = 104;
const parallaxLayerSpeeds = [0.1, 0.32, 0.72];
const parallaxStripRatio = 4608 / 324;
const targetWidth = 160;
const targetHeight = 160;
const playerDangerRadius = 64;
const playerCloseAttackRadius = 250;
const playerCloseAttackDelay = 1100;
const enemyProjectileSpeed = 430;

const playerProfile = createRobotProfile("destroyer", {
  idle: ["Idle.png", 5, 0.75],
  walk: ["Walk.png", 8, 0.72],
  shot1: ["Shot_1.png", 8, 0.46],
  shot2: ["Shot_2.png", 8, 0.46],
  attack1: ["Attack_1.png", 4, 0.46],
  attack2: ["Attack_2.png", 3, 0.43],
  hurt: ["Hurt.png", 3, 0.34],
  dead: ["Dead.png", 7, 0.88],
  enable: ["Enabling.png", 3, 0.45],
  shutdown: ["Shutdown.png", 5, 0.7],
});

const enemyProfiles = [
  createEnemyProfile(
    "infantryman",
    {
      idle: ["Idle.png", 6, 0.78],
      walk: ["Walk.png", 6, 0.7],
      shot1: ["Shot_1.png", 11, 0.54],
      shot2: ["Shot_2.png", 5, 0.42],
      attack1: ["Attack_1.png", 17, 0.82],
      attack2: ["Attack_2.png", 4, 0.4],
      hurt: ["Hurt.png", 4, 0.32],
      dead: ["Dead.png", 5, 0.64],
      enable: ["Enabling.png", 6, 0.46],
      shutdown: ["Shutdown.png", 6, 0.58],
    },
    { canShoot: true, scale: 1.28, speed: 1.0, closeAttacks: ["attack1", "attack2"] }
  ),
  createEnemyProfile(
    "swordsman",
    {
      idle: ["Idle.png", 5, 0.72],
      walk: ["Idle.png", 5, 0.72],
      attack1: ["Attack_1.png", 4, 0.46],
      attack2: ["Attack_2.png", 2, 0.34],
      attack3: ["Attack_3.png", 2, 0.34],
      attack4: ["Attack_4.png", 4, 0.48],
      pickUp: ["Pick_Up.png", 8, 0.74],
      hurt: ["Hurt.png", 3, 0.34],
      dead: ["Dead.png", 4, 0.62],
      enable: ["Enabling.png", 5, 0.52],
      shutdown: ["Shutdown.png", 5, 0.58],
    },
    { canShoot: false, scale: 1.34, speed: 1.08, closeAttacks: ["attack1", "attack2", "attack3", "attack4"] }
  ),
];

const bombVariants = [
  createOrdnanceVariant("assets/ordnance/1 Bombs/1.png", 16, 16, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/2.png", 16, 16, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/2_1.png", 16, 16, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/3.png", 16, 16, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/4.png", 16, 16, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/4_1.png", 16, 16, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/5.png", 24, 24, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/5_1.png", 24, 24, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/6.png", 24, 24, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/6_1.png", 24, 24, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/7.png", 24, 24, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/7_1.png", 24, 24, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/8.png", 24, 24, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/8_1.png", 24, 24, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/9.png", 16, 16, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/9_1.png", 16, 16, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/10.png", 16, 16, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/11.png", 16, 16, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/11_1.png", 16, 16, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/12.png", 16, 16, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/12_1.png", 16, 16, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/13.png", 24, 24, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/13_1.png", 24, 24, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/14.png", 24, 24, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/14_1.png", 24, 24, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/15.png", 24, 24, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/15_1.png", 24, 24, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/16.png", 24, 24, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/16_1.png", 24, 24, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/17.png", 32, 48, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/17_1.png", 32, 48, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/18.png", 32, 48, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/18_1.png", 32, 48, 4, 0.34),
  createOrdnanceVariant("assets/ordnance/1 Bombs/19.png", 32, 48, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/20.png", 32, 48, 1, 0.36),
  createOrdnanceVariant("assets/ordnance/1 Bombs/20_1.png", 32, 48, 4, 0.34),
];

const shotEffectVariants = [
  createOrdnanceVariant("assets/ordnance/3 Effects/1 Tiny/1.png", 32, 32, 8, 0.42),
  createOrdnanceVariant("assets/ordnance/3 Effects/1 Tiny/2.png", 32, 32, 8, 0.42),
  createOrdnanceVariant("assets/ordnance/3 Effects/1 Tiny/3.png", 32, 32, 10, 0.48),
  createOrdnanceVariant("assets/ordnance/3 Effects/2 Low/1.png", 48, 48, 8, 0.44),
  createOrdnanceVariant("assets/ordnance/3 Effects/2 Low/2.png", 48, 48, 8, 0.44),
  createOrdnanceVariant("assets/ordnance/3 Effects/2 Low/3.png", 48, 48, 10, 0.5),
  createOrdnanceVariant("assets/ordnance/3 Effects/3 Middle/1.png", 72, 72, 8, 0.46),
  createOrdnanceVariant("assets/ordnance/3 Effects/3 Middle/2.png", 72, 72, 8, 0.46),
  createOrdnanceVariant("assets/ordnance/3 Effects/3 Middle/3.png", 72, 72, 10, 0.52),
  createOrdnanceVariant("assets/ordnance/3 Effects/4 High/1.png", 96, 96, 8, 0.48),
  createOrdnanceVariant("assets/ordnance/3 Effects/4 High/2.png", 96, 96, 8, 0.48),
  createOrdnanceVariant("assets/ordnance/3 Effects/4 High/3.png", 96, 96, 10, 0.54),
];

const beamPalettes = ["beam-cyan", "beam-magenta", "beam-lime", "beam-amber"];

let score = 0;
let misses = 0;
let targets = [];
let enemyProjectiles = [];
let bombVariantBag = [];
let shotEffectVariantBag = [];
let spawnIndex = 0;
let shotIndex = 0;
let playerAttackIndex = 0;
let parallaxScroll = [0, 0, 0];
let parallaxTileWidth = 0;
let playerCloseAttackTimer = 0;
let playerAnimationLocked = false;
let playerAnimationTimer = 0;
let lastFrameTime = 0;
let spawnTimer = 0;
let animationId = 0;
let shotEffectTimer = 0;
let firingResetTimer = 0;
let gameOverTimer = 0;
let gameRunning = false;

function startGame() {
  score = 0;
  misses = 0;
  spawnIndex = 0;
  shotIndex = 0;
  playerAttackIndex = 0;
  playerCloseAttackTimer = 0;
  playerAnimationLocked = false;
  bombVariantBag = [];
  shotEffectVariantBag = [];

  clearTimeout(gameOverTimer);
  targets.forEach((target) => removeTarget(target));
  targets = [];
  enemyProjectiles.forEach((projectile) => projectile.element.remove());
  enemyProjectiles = [];

  clearShotEffects();
  resetParallax();
  updateHud();
  gameOverPanel.hidden = true;
  gameRunning = true;
  player.classList.add("is-running");
  playPlayerAnimation("enable", getAnimationDuration(playerProfile.animations.enable, 450));
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

function createRobotProfile(folder, animationSpecs) {
  const animations = {};

  Object.entries(animationSpecs).forEach(([name, spec]) => {
    animations[name] = createRobotAnimation(`assets/${folder}/${spec[0]}`, spec[1], spec[2]);
  });

  return {
    folder,
    animations,
  };
}

function createEnemyProfile(folder, animationSpecs, options) {
  return {
    ...createRobotProfile(folder, animationSpecs),
    id: folder,
    width: 160,
    height: 160,
    frameWidth: 128,
    frameHeight: 128,
    spriteLeft: 16,
    spriteTop: 32,
    canShoot: options.canShoot,
    scale: options.scale,
    speed: options.speed,
    closeAttacks: options.closeAttacks,
  };
}

function createRobotAnimation(url, frames, duration) {
  return createOrdnanceVariant(url, 128, 128, frames, duration);
}

function createOrdnanceVariant(url, frameWidth, frameHeight, frames, duration) {
  return {
    url,
    frameWidth,
    frameHeight,
    frames,
    steps: Math.max(frames - 1, 1),
    end: -frameWidth * Math.max(frames - 1, 0),
    stripWidth: frameWidth * frames,
    duration,
  };
}

function pickBombVariant() {
  return pickVariantFromBag(bombVariants, bombVariantBag);
}

function pickShotEffectVariant() {
  return pickVariantFromBag(shotEffectVariants, shotEffectVariantBag);
}

function pickVariantFromBag(variants, bag) {
  if (!bag.length) {
    variants.forEach((_, index) => bag.push(index));
  }

  const bagIndex = randomNumber(0, bag.length - 1);
  const variantIndex = bag.splice(bagIndex, 1)[0];

  return variants[variantIndex];
}

function applySpriteVariant(element, variant, prefix) {
  element.style.setProperty(`--${prefix}-url`, `url("${variant.url}")`);
  element.style.setProperty(`--${prefix}-frame-width`, `${variant.frameWidth}px`);
  element.style.setProperty(`--${prefix}-frame-height`, `${variant.frameHeight}px`);
  element.style.setProperty(`--${prefix}-strip-width`, `${variant.stripWidth}px`);
  element.style.setProperty(`--${prefix}-end`, `${variant.end}px`);
  element.style.setProperty(`--${prefix}-steps`, variant.steps);
  element.style.setProperty(`--${prefix}-duration`, `${variant.duration}s`);
}

function applyCharacterAnimation(element, profile, animationName, prefix) {
  const animation = profile.animations[animationName] || profile.animations.idle;

  applySpriteVariant(element, animation, prefix);
}

function getAnimationDuration(animation, fallback) {
  return animation ? Math.ceil(animation.duration * 1000) : fallback;
}

// Crea un enemigo sprite-sheet con estados de animacion propios.
function createTarget() {
  const currentSpawnIndex = spawnIndex;
  const profile = enemyProfiles[currentSpawnIndex % enemyProfiles.length];
  const width = profile.width;
  const height = profile.height;
  const startPoint = getPatternStart(width, height);
  spawnIndex += 1;

  const element = document.createElement("div");
  element.className = `target target-ground target-${profile.id}`;
  element.dataset.animation = "spawn";
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.innerHTML = `
    <span class="enemy-sprite"></span>
    ${profile.canShoot ? '<span class="enemy-muzzle"></span><span class="enemy-muzzle-flash"></span>' : ""}
  `;

  const target = {
    element,
    sprite: element.querySelector(".enemy-sprite"),
    muzzle: element.querySelector(".enemy-muzzle"),
    kind: profile.id,
    profile,
    canShoot: profile.canShoot,
    canCloseAttack: true,
    mode: "ground",
    width,
    height,
    x: startPoint.x,
    y: startPoint.y,
    displayY: startPoint.y,
    age: 0,
    speed: randomNumber(baseSpeed, baseSpeed + 30) * profile.speed,
    hopAmount: randomNumber(10, 24),
    hopTimer: randomNumber(500, 1700),
    hopAge: 0,
    hopDuration: 0,
    phase: randomNumber(0, 628) / 100,
    shootTimer: randomNumber(900, 1500),
    shootCooldown: randomNumber(2400, 3600),
    closeAttackTimer: randomNumber(500, 1200),
    closeAttackIndex: 0,
    shotVariant: 0,
    animationLocked: true,
    animationTimer: 0,
    pendingShotTimer: 0,
    dead: false,
  };

  // Pointer events funcionan con raton, stylus y pantalla tactil.
  element.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    hitTarget(target);
  });

  playArea.appendChild(element);
  targets.push(target);
  renderTarget(target);

  playEnemyAnimation(target, "enable", getAnimationDuration(target.profile.animations.enable, 430));
}

function getPatternStart(width = targetWidth, height = targetHeight) {
  const areaWidth = playArea.clientWidth;
  const floorTop = getFloorTop();
  const spawnOffset = randomNumber(0, Math.round(areaWidth * 0.16));

  return { x: areaWidth + spawnOffset, y: floorTop - height };
}

// Al tocar/clicar un enemigo, el jugador dispara y el enemigo muere con animacion.
function hitTarget(target) {
  if (!gameRunning || target.dead) {
    return;
  }

  const hitPoint = getTargetCenter(target.element);

  score += 1;
  showShot(hitPoint.x, hitPoint.y);
  defeatTarget(target);
  updateHud();
}

function defeatTarget(target) {
  target.dead = true;
  target.element.classList.add("is-defeated");
  target.element.style.pointerEvents = "none";
  clearTimeout(target.animationTimer);
  clearTimeout(target.pendingShotTimer);

  setEnemyAnimation(target, "hurt");

  target.animationTimer = setTimeout(() => {
    setEnemyAnimation(target, "dead");
  }, getAnimationDuration(target.profile.animations.hurt, 160));

  setTimeout(() => {
    removeTarget(target);
  }, getAnimationDuration(target.profile.animations.dead, 640) + 220);
}

function removeTarget(target) {
  clearTimeout(target.animationTimer);
  clearTimeout(target.pendingShotTimer);
  target.element.remove();
  targets = targets.filter((currentTarget) => currentTarget !== target);
}

function gameLoop(currentTime) {
  if (!gameRunning) {
    return;
  }

  // Se pinta en cada requestAnimationFrame. Si el navegador se retrasa,
  // limitamos el delta para que los sprites no den saltos largos.
  const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, maxDeltaTime);
  lastFrameTime = currentTime;
  spawnTimer += deltaTime * 1000;

  if (spawnTimer >= spawnDelay && targets.length < maxTargets) {
    spawnTimer = 0;
    createTarget();
  }

  updateParallax(deltaTime);
  updatePlayerAnimation(deltaTime);
  playerCloseAttackTimer = Math.max(0, playerCloseAttackTimer - deltaTime * 1000);
  moveTargets(deltaTime);
  moveEnemyProjectiles(deltaTime);
  animationId = requestAnimationFrame(gameLoop);
}

function updatePlayerAnimation(deltaTime) {
  if (playerAnimationLocked) {
    return;
  }

  setPlayerAnimation("walk");
}

// Mueve todos los enemigos hacia el jugador y gestiona sus disparos.
function moveTargets(deltaTime) {
  const playerPoint = getPlayerPoint();
  let hasCloseTarget = false;

  targets.slice().forEach((target) => {
    target.age += deltaTime;

    if (!target.dead) {
      updateEnemyFacing(target, playerPoint);
      updateEnemyAnimation(target);
      updateEnemyCloseAttack(target, playerPoint, deltaTime);
      updateEnemyShooting(target, playerPoint, deltaTime);
      moveTargetTowardPlayer(target, playerPoint, deltaTime);
      hasCloseTarget = hasCloseTarget || (target.canCloseAttack && isCloseToPlayer(target, playerPoint));
    }

    renderTarget(target);

    if (!target.dead && isTouchingPlayer(target, playerPoint)) {
      missTarget(target, playerPoint);
    }
  });

  updatePlayerCloseAttack(hasCloseTarget);

  if (misses >= maxMisses) {
    endGame();
  }
}

function moveTargetTowardPlayer(target, playerPoint, deltaTime) {
  const targetCenterX = target.x + target.width / 2;
  const goalX = playerPoint.x + 10;
  const travel = target.speed * deltaTime;
  const direction = targetCenterX > goalX ? -1 : -0.25;

  target.x += direction * travel;
  target.y = getFloorTop() - target.height;
  updateGroundHop(target, deltaTime);
}

function updateGroundHop(target, deltaTime) {
  if (target.hopDuration > 0) {
    target.hopAge += deltaTime * 1000;

    if (target.hopAge >= target.hopDuration) {
      target.hopAge = 0;
      target.hopDuration = 0;
      target.hopTimer = randomNumber(1100, 2600);
    }

    return;
  }

  target.hopTimer -= deltaTime * 1000;

  if (target.hopTimer <= 0) {
    target.hopDuration = randomNumber(280, 460);
    target.hopAmount = randomNumber(10, 24);
    target.hopAge = 0;
  }
}

function updateEnemyCloseAttack(target, playerPoint, deltaTime) {
  if (!target.canCloseAttack || target.animationLocked) {
    return;
  }

  target.closeAttackTimer = Math.max(0, target.closeAttackTimer - deltaTime * 1000);

  if (target.closeAttackTimer > 0 || !isCloseToPlayer(target, playerPoint)) {
    return;
  }

  const attacks = target.profile.closeAttacks || ["attack1"];
  const animationName = attacks[target.closeAttackIndex % attacks.length];

  target.closeAttackIndex += 1;
  target.closeAttackTimer = randomNumber(850, 1500);
  playEnemyAnimation(target, animationName, getAnimationDuration(target.profile.animations[animationName], 460));
}

function updateEnemyShooting(target, playerPoint, deltaTime) {
  if (!target.canShoot) {
    return;
  }

  const enemyCenterX = target.x + target.width / 2;
  const enemyCenterY = target.displayY + target.height / 2;
  const distanceToPlayer = Math.hypot(enemyCenterX - playerPoint.x, enemyCenterY - playerPoint.y);

  target.shootTimer -= deltaTime * 1000;

  if (target.shootTimer > 0 || target.animationLocked || distanceToPlayer < 130 || distanceToPlayer > 1500) {
    return;
  }

  enemyShoot(target, playerPoint);
  target.shootTimer = target.shootCooldown;
  target.shootCooldown = randomNumber(2400, 3800);
}

function enemyShoot(target, playerPoint) {
  const animationName = target.shotVariant % 2 === 0 ? "shot1" : "shot2";
  target.shotVariant += 1;
  target.element.classList.add("is-shooting");
  playEnemyAnimation(target, animationName, getAnimationDuration(target.profile.animations[animationName], 520));
  clearTimeout(target.pendingShotTimer);

  target.pendingShotTimer = setTimeout(() => {
    if (!gameRunning || target.dead || !targets.includes(target)) {
      return;
    }

    createEnemyProjectile(target, playerPoint);
    target.element.classList.remove("is-shooting");
  }, 190);
}

function createEnemyProjectile(target, playerPoint) {
  if (enemyProjectiles.length >= maxEnemyProjectiles) {
    removeEnemyProjectile(enemyProjectiles[0]);
  }

  const start = getEnemyMuzzlePoint(target);
  const deltaX = playerPoint.x - start.x;
  const deltaY = playerPoint.y - start.y;
  const angle = Math.atan2(deltaY, deltaX);
  const projectile = document.createElement("div");
  const variant = pickBombVariant();

  createShotEffect(start.x, start.y, angle, 0.58);

  projectile.className = "bomb-projectile enemy-projectile";
  applySpriteVariant(projectile, variant, "bomb");
  playArea.appendChild(projectile);

  const projectileState = {
    element: projectile,
    scale: variant.frameHeight > 32 ? 1.0 : 1.45,
    x: start.x,
    y: start.y,
    vx: Math.cos(angle) * enemyProjectileSpeed,
    vy: Math.sin(angle) * enemyProjectileSpeed,
    angle,
    age: 0,
  };

  renderEnemyProjectile(projectileState);
  enemyProjectiles.push(projectileState);
}

function moveEnemyProjectiles(deltaTime) {
  for (let index = enemyProjectiles.length - 1; index >= 0; index -= 1) {
    const projectile = enemyProjectiles[index];

    projectile.age += deltaTime;
    projectile.x += projectile.vx * deltaTime;
    projectile.y += projectile.vy * deltaTime;
    renderEnemyProjectile(projectile);

    if (
      projectile.age > 2.4 ||
      projectile.x < -80 ||
      projectile.x > playArea.clientWidth + 80 ||
      projectile.y < -80 ||
      projectile.y > playArea.clientHeight + 80
    ) {
      removeEnemyProjectile(projectile);
    }
  }

  if (misses >= maxMisses) {
    endGame();
  }
}

function renderEnemyProjectile(projectile) {
  projectile.element.style.transform =
    `translate3d(${projectile.x}px, ${projectile.y}px, 0) translate(-50%, -50%) rotate(${projectile.angle}rad) scale(${projectile.scale})`;
}

function renderTarget(target) {
  let extraY = 0;

  if (target.hopDuration > 0) {
    const progress = Math.min(target.hopAge / target.hopDuration, 1);
    extraY = -Math.sin(progress * Math.PI) * target.hopAmount;
  }

  target.displayY = target.dead ? target.displayY : target.y + extraY;
  target.element.style.transform = `translate3d(${target.x}px, ${target.displayY}px, 0)`;
}

function updateEnemyFacing(target, playerPoint) {
  const targetCenterX = target.x + target.width / 2;
  target.element.classList.toggle("is-facing-left", targetCenterX > playerPoint.x);
}

function updateEnemyAnimation(target) {
  if (target.animationLocked) {
    return;
  }

  setEnemyAnimation(target, "walk");
}

function playEnemyAnimation(target, animationName, duration) {
  target.animationLocked = true;
  setEnemyAnimation(target, animationName);
  clearTimeout(target.animationTimer);

  target.animationTimer = setTimeout(() => {
    target.animationLocked = false;

    if (!target.dead && gameRunning) {
      updateEnemyAnimation(target);
    }
  }, duration);
}

function setEnemyAnimation(target, animationName) {
  if (target.element.dataset.animation === animationName) {
    return;
  }

  target.element.dataset.animation = animationName;
  applyCharacterAnimation(target.element, target.profile, animationName, "enemy");
  target.element.style.setProperty("--enemy-scale", target.profile.scale);
  target.element.style.setProperty("--enemy-left", `${target.profile.spriteLeft}px`);
  target.element.style.setProperty("--enemy-top", `${target.profile.spriteTop}px`);
}

function isTouchingPlayer(target, playerPoint) {
  const enemyCenterX = target.x + target.width / 2;
  const enemyCenterY = target.displayY + target.height / 2;
  const distanceToPlayer = Math.hypot(enemyCenterX - playerPoint.x, enemyCenterY - playerPoint.y);

  return distanceToPlayer < playerDangerRadius;
}

function isCloseToPlayer(target, playerPoint) {
  const enemyCenterX = target.x + target.width / 2;
  const enemyCenterY = target.displayY + target.height / 2;
  const distanceToPlayer = Math.hypot(enemyCenterX - playerPoint.x, enemyCenterY - playerPoint.y);

  return distanceToPlayer < playerCloseAttackRadius;
}

function updatePlayerCloseAttack(hasCloseTarget) {
  const isBusy = playerAnimationLocked || player.classList.contains("is-firing");

  if (!hasCloseTarget || isBusy || playerCloseAttackTimer > 0) {
    return;
  }

  const animationName = playerAttackIndex % 2 === 0 ? "attack1" : "attack2";

  playerAttackIndex += 1;
  playerCloseAttackTimer = playerCloseAttackDelay;
  playPlayerAnimation(animationName, getAnimationDuration(playerProfile.animations[animationName], 460));
}

function missTarget(target, playerPoint) {
  misses += 1;
  showPlayerHit(playerPoint.x, playerPoint.y);
  defeatTarget(target);
  updateHud();
}

function removeEnemyProjectile(projectile) {
  projectile.element.remove();
  enemyProjectiles = enemyProjectiles.filter((currentProjectile) => currentProjectile !== projectile);
}

function endGame() {
  gameRunning = false;
  player.classList.remove("is-running");
  clearTimeout(playerAnimationTimer);
  playerAnimationLocked = true;
  setPlayerAnimation("dead");
  cancelAnimationFrame(animationId);
  gameOverTimer = setTimeout(() => {
    if (!gameRunning) {
      gameOverPanel.hidden = false;
    }
  }, 650);
}

// Las cinco capas se mueven a velocidades diferentes para crear parallax.
function updateParallax(deltaTime) {
  if (!parallaxTileWidth) {
    updateParallaxMetrics();
  }

  for (let index = 0; index < parallaxTracks.length; index += 1) {
    parallaxScroll[index] =
      (parallaxScroll[index] - worldSpeed * parallaxLayerSpeeds[index] * deltaTime) % parallaxTileWidth;
    parallaxTracks[index].style.transform = `translate3d(${parallaxScroll[index]}px, 0, 0)`;
  }
}

function updateParallaxMetrics() {
  const firstStrip = parallaxTracks[0]?.querySelector("img");
  const measuredWidth = firstStrip?.getBoundingClientRect().width || 0;
  const fallbackWidth = (playArea.clientHeight || window.innerHeight || 800) * parallaxStripRatio;

  parallaxTileWidth = measuredWidth || fallbackWidth;
}

function resetParallax() {
  parallaxScroll = [0, 0, 0];
  updateParallaxMetrics();
  updateParallax(0);
}

// Dibuja un disparo mas dramatico desde el arma hasta el enemigo tocado.
function showShot(endX, endY) {
  const shotAnimation = shotIndex % 2 === 0 ? "shot1" : "shot2";

  shotIndex += 1;
  playPlayerAnimation(shotAnimation, getAnimationDuration(playerProfile.animations[shotAnimation], 470));
  player.classList.add("is-firing");
  clearTimeout(shotEffectTimer);
  clearTimeout(firingResetTimer);

  shotEffectTimer = setTimeout(() => {
    const start = getMuzzlePoint();
    const deltaX = endX - start.x;
    const deltaY = endY - start.y;
    const length = Math.hypot(deltaX, deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    createCyberBeam(start, length, angle);
    createShotEffect(start.x, start.y, angle, 0.72);
    createProjectileTrail(start, length, angle);
    createShotEffect(endX, endY, angle, 1.05);
  }, 180);

  firingResetTimer = setTimeout(() => {
    player.classList.remove("is-firing");
  }, 360);
}

function createCyberBeam(start, length, angle) {
  const beam = document.createElement("div");
  const palette = beamPalettes[randomNumber(0, beamPalettes.length - 1)];

  beam.className = `shot-beam ${palette}`;
  beam.style.left = `${start.x}px`;
  beam.style.top = `${start.y}px`;
  beam.style.width = `${length}px`;
  beam.style.setProperty("--angle", `${angle}rad`);
  playArea.appendChild(beam);

  setTimeout(() => beam.remove(), 260);
}

function createProjectileTrail(start, length, angle) {
  const count = Math.max(1, Math.min(2, Math.floor(length / 420) + 1));
  const directionX = Math.cos(angle);
  const directionY = Math.sin(angle);
  const normalX = -directionY;
  const normalY = directionX;

  for (let index = 0; index < count; index += 1) {
    const progress = (index + 0.45) / count;
    const wave = Math.sin(index * 1.7) * 7;
    const sprite = document.createElement("div");
    const variant = pickBombVariant();
    const x = start.x + directionX * length * progress + normalX * wave;
    const y = start.y + directionY * length * progress + normalY * wave;
    const scale = variant.frameHeight > 32 ? 0.86 : 1.28;

    sprite.className = "bomb-projectile shot-projectile";
    applySpriteVariant(sprite, variant, "bomb");
    sprite.style.left = `${x}px`;
    sprite.style.top = `${y}px`;
    sprite.style.setProperty("--angle", `${angle}rad`);
    sprite.style.setProperty("--scale", `${scale * (1.08 - progress * 0.28)}`);
    playArea.appendChild(sprite);
    setTimeout(() => sprite.remove(), 360 + index * 18);
  }
}

function createShotEffect(x, y, angle, scale) {
  const effect = document.createElement("div");
  const variant = pickShotEffectVariant();

  effect.className = "shot-effect";
  applySpriteVariant(effect, variant, "effect");
  effect.style.left = `${x}px`;
  effect.style.top = `${y}px`;
  effect.style.setProperty("--angle", `${angle}rad`);
  effect.style.setProperty("--scale", scale * 2);
  playArea.appendChild(effect);

  setTimeout(() => effect.remove(), Math.ceil(variant.duration * 1000) + 80);
}

function showPlayerHit(x, y) {
  const spark = document.createElement("div");
  spark.className = "player-hit";
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  playArea.appendChild(spark);

  player.classList.remove("is-hit");
  player.classList.add("is-hit");
  playPlayerAnimation("hurt", getAnimationDuration(playerProfile.animations.hurt, 360));

  setTimeout(() => {
    spark.remove();
    player.classList.remove("is-hit");
  }, 260);
}

function clearShotEffects() {
  clearTimeout(playerAnimationTimer);
  clearTimeout(shotEffectTimer);
  clearTimeout(firingResetTimer);
  playerCloseAttackTimer = 0;
  document
    .querySelectorAll(
      ".bomb-projectile, .shot-effect, .shot-beam, .player-hit, .enemy-projectile"
    )
    .forEach((effect) => effect.remove());
  player.classList.remove("is-firing", "is-hit");
  playerAnimationLocked = false;
  setPlayerAnimation("idle");
}

function playPlayerAnimation(animationName, duration) {
  playerAnimationLocked = true;
  setPlayerAnimation(animationName);
  clearTimeout(playerAnimationTimer);

  playerAnimationTimer = setTimeout(() => {
    playerAnimationLocked = false;

    if (gameRunning) {
      updatePlayerAnimation(0);
    }
  }, duration);
}

function setPlayerAnimation(animationName) {
  if (player.dataset.animation === animationName) {
    return;
  }

  player.dataset.animation = animationName;
  applyCharacterAnimation(player, playerProfile, animationName, "sprite");
}

function getMuzzlePoint() {
  const areaRect = playArea.getBoundingClientRect();
  const muzzleRect = muzzle.getBoundingClientRect();

  return {
    x: muzzleRect.left + muzzleRect.width / 2 - areaRect.left,
    y: muzzleRect.top + muzzleRect.height / 2 - areaRect.top,
  };
}

function getEnemyMuzzlePoint(target) {
  const areaRect = playArea.getBoundingClientRect();
  const muzzleRect = target.muzzle.getBoundingClientRect();

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

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

restartButton.addEventListener("click", startGame);
gameOverRestartButton.addEventListener("click", startGame);
window.addEventListener("resize", updateParallaxMetrics, { passive: true });
document.querySelectorAll(".city-track img").forEach((image) => {
  image.addEventListener("load", updateParallaxMetrics, { once: true });
});

startGame();
