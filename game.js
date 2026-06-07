const playArea = document.querySelector("#playArea");
const playerElement = document.querySelector("#player");
const playerCharge = playerElement.querySelector(".player-charge");
const parallaxTracks = Array.from(document.querySelectorAll(".city-track"));
const scoreText = document.querySelector("#score");
const livesText = document.querySelector("#lives");
const finalScoreText = document.querySelector("#finalScore");
const gameOverPanel = document.querySelector("#gameOver");
const restartButton = document.querySelector("#restartButton");
const gameOverRestartButton = document.querySelector("#gameOverRestartButton");
const remotePopup = document.querySelector("#remotePopup");
const remotePopupMessage = document.querySelector("#remotePopupMessage");
const remotePopupClose = document.querySelector("#remotePopupClose");

const SOCKET_SERVER_URL = "https://pinlee-game2.onrender.com/";

const maxLives = 5;
const maxTargets = 4;
const maxEnemyProjectiles = 6;
const maxDeltaTime = 1 / 30;
const playerProjectileHitRadius = 46;
const playerProjectileBlockMultiplier = 3.4;
const floorHeight = 150;
const compactFloorHeight = 124;
const spawnDelay = 1250;
const baseSpeed = 104;
const worldSpeed = 104;
const enemyProjectileSpeed = 330;
const parallaxLayerSpeeds = [0.1, 0.32, 0.56, 0.72];
const parallaxStripRatio = 4608 / 324;

const playerProfile = createPlayerProfile("destroyer", {
  idle: ["Idle.png", 128, 128, 5, 0.75],
  walk: ["Walk.png", 128, 128, 8, 0.72],
  shot1: ["Shot_1.png", 128, 128, 8, 0.46],
  shot2: ["Shot_2.png", 128, 128, 8, 0.46],
  attack1: ["Attack_1.png", 128, 128, 4, 0.46],
  attack2: ["Attack_2.png", 128, 128, 3, 0.43],
  hurt: ["Hurt.png", 128, 128, 3, 0.34],
  dead: ["Dead.png", 128, 128, 7, 0.88],
  enable: ["Enabling.png", 128, 128, 3, 0.45],
  shutdown: ["Shutdown.png", 128, 128, 5, 0.7],
}, {
  charge1: ["Charge_1.png", 32, 32, 4, 0.24],
  charge2: ["Charge_2.png", 64, 64, 5, 0.34],
});

const enemyProfiles = [
  createEnemyProfile(
    "swordsman",
    {
      idle: ["Idle.png", 128, 128, 5, 0.72],
      walk: ["Idle.png", 128, 128, 5, 0.72],
      attack1: ["Attack_1.png", 128, 128, 4, 0.46],
      attack2: ["Attack_2.png", 128, 128, 2, 0.34],
      attack3: ["Attack_3.png", 128, 128, 2, 0.34],
      attack4: ["Attack_4.png", 128, 128, 4, 0.48],
      pickUp: ["Pick_Up.png", 128, 128, 8, 0.74],
      hurt: ["Hurt.png", 128, 128, 3, 0.34],
      dead: ["Dead.png", 128, 128, 4, 0.62],
      enable: ["Enabling.png", 128, 128, 5, 0.52],
      shutdown: ["Shutdown.png", 128, 128, 5, 0.58],
    },
    {},
    {
      scale: 1.34,
      speed: 1.08,
      canShoot: true,
      jumpiness: 0.85,
      closeAttacks: ["attack1", "attack2", "attack3", "attack4"],
      shotAnimations: [],
      chargeAnimations: [],
    }
  ),
  createEnemyProfile(
    "infantryman",
    {
      idle: ["Idle.png", 128, 128, 6, 0.78],
      walk: ["Walk.png", 128, 128, 6, 0.58],
      shot1: ["Shot_1.png", 128, 128, 11, 0.54],
      shot2: ["Shot_2.png", 128, 128, 5, 0.42],
      attack1: ["Attack_1.png", 128, 128, 17, 0.82],
      attack2: ["Attack_2.png", 128, 128, 4, 0.4],
      hurt: ["Hurt.png", 128, 128, 4, 0.32],
      dead: ["Dead.png", 128, 128, 5, 0.64],
      enable: ["Enabling.png", 128, 128, 6, 0.46],
      shutdown: ["Shutdown.png", 128, 128, 6, 0.58],
    },
    {
      charge1: ["Charge_1.png", 32, 32, 4, 0.24],
      charge2: ["Charge_2.png", 32, 32, 3, 0.28],
    },
    {
      scale: 1.28,
      speed: 1.26,
      canShoot: true,
      jumpiness: 1.45,
      closeAttacks: ["attack1", "attack2"],
      shotAnimations: ["shot1", "shot2"],
      chargeAnimations: ["charge1", "charge2"],
    }
  ),
];

const droneProfiles = [
  createDroneProfile("1", 48, 48, 1.85, "Walk.png", "Idle.png", "Death.png", 4, 4, 6),
  createDroneProfile("2", 96, 96, 1.0, "Drop.png", "Drop.png", "Drop.png", 6, 6, 6),
  createDroneProfile("3", 48, 48, 1.85, "Forward.png", "Idle.png", "Death.png", 4, 4, 8),
  createDroneProfile("4", 96, 96, 1.1, "Walk.png", "Idle.png", "Death.png", 4, 4, 6),
  createDroneProfile("5", 72, 72, 1.35, "Walk.png", "Idle.png", "Death.png", 4, 4, 6),
  createDroneProfile("5_2", 48, 48, 1.85, "Walk.png", "Idle.png", "Death.png", 4, 4, 6),
  createDroneProfile("6", 48, 48, 1.85, "Walk.png", "Walk2.png", "Drop.png", 4, 4, 6),
];

const spawnSequence = ["drone", "swordsman", "infantryman", "drone", "infantryman", "swordsman"];

const bombVariants = [
  createSpriteSheet("assets/ordnance/1 Bombs/1.png", 16, 16, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/2.png", 16, 16, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/2_1.png", 16, 16, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/3.png", 16, 16, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/4.png", 16, 16, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/4_1.png", 16, 16, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/5.png", 24, 24, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/5_1.png", 24, 24, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/6.png", 24, 24, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/6_1.png", 24, 24, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/7.png", 24, 24, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/7_1.png", 24, 24, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/8.png", 24, 24, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/8_1.png", 24, 24, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/9.png", 16, 16, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/9_1.png", 16, 16, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/10.png", 16, 16, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/11.png", 16, 16, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/11_1.png", 16, 16, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/12.png", 16, 16, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/12_1.png", 16, 16, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/13.png", 24, 24, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/13_1.png", 24, 24, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/14.png", 24, 24, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/14_1.png", 24, 24, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/15.png", 24, 24, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/15_1.png", 24, 24, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/16.png", 24, 24, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/16_1.png", 24, 24, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/17.png", 32, 48, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/17_1.png", 32, 48, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/18.png", 32, 48, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/18_1.png", 32, 48, 4, 0.34),
  createSpriteSheet("assets/ordnance/1 Bombs/19.png", 32, 48, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/20.png", 32, 48, 1, 0.36),
  createSpriteSheet("assets/ordnance/1 Bombs/20_1.png", 32, 48, 4, 0.34),
];

const shotEffectVariants = [
  createSpriteSheet("assets/ordnance/3 Effects/1 Tiny/1.png", 32, 32, 8, 0.42),
  createSpriteSheet("assets/ordnance/3 Effects/1 Tiny/2.png", 32, 32, 8, 0.42),
  createSpriteSheet("assets/ordnance/3 Effects/1 Tiny/3.png", 32, 32, 10, 0.48),
  createSpriteSheet("assets/ordnance/3 Effects/2 Low/1.png", 48, 48, 8, 0.44),
  createSpriteSheet("assets/ordnance/3 Effects/2 Low/2.png", 48, 48, 8, 0.44),
  createSpriteSheet("assets/ordnance/3 Effects/2 Low/3.png", 48, 48, 10, 0.5),
  createSpriteSheet("assets/ordnance/3 Effects/3 Middle/1.png", 72, 72, 8, 0.46),
  createSpriteSheet("assets/ordnance/3 Effects/3 Middle/2.png", 72, 72, 8, 0.46),
  createSpriteSheet("assets/ordnance/3 Effects/3 Middle/3.png", 72, 72, 10, 0.52),
  createSpriteSheet("assets/ordnance/3 Effects/4 High/1.png", 96, 96, 8, 0.48),
  createSpriteSheet("assets/ordnance/3 Effects/4 High/2.png", 96, 96, 8, 0.48),
  createSpriteSheet("assets/ordnance/3 Effects/4 High/3.png", 96, 96, 10, 0.54),
];

const beamPalettes = ["beam-cyan", "beam-magenta", "beam-lime", "beam-amber"];

let score = 0;
let lives = maxLives;
let targets = [];
let enemyProjectiles = [];
let bombVariantBag = [];
let shotEffectVariantBag = [];
let spawnIndex = 0;
let droneSpawnIndex = 0;
let parallaxScroll = [];
let parallaxTileWidth = 0;
let lastFrameTime = 0;
let spawnTimer = 0;
let animationId = 0;
let gameOverTimer = 0;
let gameRunning = false;

const playerState = {
  x: 0,
  y: 0,
  width: 128,
  height: 128,
  scale: 1.55,
  targetX: 0,
  speed: 42,
  locked: false,
  dead: false,
  shotIndex: 0,
  attackIndex: 0,
  animationTimer: 0,
  chargeTimer: 0,
  invulnerableTimer: 0,
};

function startGame() {
  score = 0;
  lives = maxLives;
  spawnIndex = 0;
  droneSpawnIndex = 0;
  bombVariantBag = [];
  shotEffectVariantBag = [];

  clearTimeout(gameOverTimer);
  targets.forEach((target) => removeTarget(target));
  targets = [];
  enemyProjectiles.forEach((projectile) => removeEnemyProjectile(projectile));
  enemyProjectiles = [];

  clearShotEffects();
  resetParallax();
  resetPlayer();
  updateHud();
  gameOverPanel.hidden = true;
  gameRunning = true;
  createTarget();
  spawnTimer = 0;
  lastFrameTime = performance.now();

  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

function updateHud() {
  scoreText.textContent = score;
  livesText.textContent = lives;
  finalScoreText.textContent = score;
}

function createPlayerProfile(folder, bodySpecs, chargeSpecs) {
  return {
    folder,
    body: createAnimationMap(`assets/${folder}`, bodySpecs),
    charge: createAnimationMap(`assets/${folder}`, chargeSpecs),
  };
}

function createEnemyProfile(folder, animationSpecs, chargeSpecs, options) {
  return {
    id: folder,
    kind: "ground",
    width: 160,
    height: 160,
    frameWidth: 128,
    frameHeight: 128,
    spriteLeft: 16,
    spriteTop: 32,
    scale: options.scale,
    speed: options.speed,
    jumpiness: options.jumpiness,
    canShoot: options.canShoot,
    closeAttacks: options.closeAttacks,
    shotAnimations: options.shotAnimations,
    chargeAnimations: options.chargeAnimations,
    animations: createAnimationMap(`assets/${folder}`, animationSpecs),
    charge: createAnimationMap(`assets/${folder}`, chargeSpecs),
  };
}

function createDroneProfile(folder, frameWidth, frameHeight, scale, flyFile, idleFile, deathFile, flyFrames, idleFrames, deathFrames) {
  const width = Math.ceil(frameWidth * scale) + 34;
  const height = Math.ceil(frameHeight * scale) + 34;

  return {
    id: `drone-${folder}`,
    kind: "drone",
    width,
    height,
    frameWidth,
    frameHeight,
    spriteLeft: Math.round((width - frameWidth) / 2),
    spriteTop: Math.round((height - frameHeight) / 2),
    scale,
    speed: 1.08,
    canShoot: true,
    closeAttacks: [],
    animations: {
      idle: createSpriteSheet(`assets/drones/${folder}/${idleFile}`, frameWidth, frameHeight, idleFrames, 0.68),
      walk: createSpriteSheet(`assets/drones/${folder}/${flyFile}`, frameWidth, frameHeight, flyFrames, 0.56),
      hurt: createSpriteSheet(`assets/drones/${folder}/${deathFile}`, frameWidth, frameHeight, deathFrames, 0.48),
      dead: createSpriteSheet(`assets/drones/${folder}/${deathFile}`, frameWidth, frameHeight, deathFrames, 0.48),
      enable: createSpriteSheet(`assets/drones/${folder}/${idleFile}`, frameWidth, frameHeight, idleFrames, 0.42),
    },
  };
}

function createAnimationMap(basePath, animationSpecs) {
  const animations = {};

  Object.entries(animationSpecs).forEach(([name, spec]) => {
    animations[name] = createSpriteSheet(`${basePath}/${spec[0]}`, spec[1], spec[2], spec[3], spec[4]);
  });

  return animations;
}

function createSpriteSheet(url, frameWidth, frameHeight, frames, duration) {
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

function applyCharacterAnimation(element, profile, animationName) {
  const animation = profile.animations[animationName] || profile.animations.idle;

  applySpriteVariant(element, animation, "enemy");
}

function getAnimationDuration(animation, fallback) {
  return animation ? Math.ceil(animation.duration * 1000) : fallback;
}

function resetPlayer() {
  clearTimeout(playerState.animationTimer);
  clearTimeout(playerState.chargeTimer);
  playerState.x = Math.round(playArea.clientWidth * 0.045);
  playerState.targetX = Math.round(playArea.clientWidth * 0.145);
  playerState.y = getPlayerTopForBlueLine();
  playerState.locked = true;
  playerState.dead = false;
  playerState.shotIndex = 0;
  playerState.attackIndex = 0;
  playerState.invulnerableTimer = 0;
  playerElement.classList.remove("is-hit");
  playerCharge.hidden = true;
  renderPlayer();
  playPlayerAnimation("enable", getAnimationDuration(playerProfile.body.enable, 450), () => {
    playPlayerAnimation("idle", 220, () => setPlayerAnimation("walk"));
  });
}

function renderPlayer() {
  playerState.y = getPlayerTopForBlueLine();
  playerElement.style.transform =
    `translate3d(${playerState.x}px, ${playerState.y}px, 0) scale(${playerState.scale})`;
}

function updatePlayer(deltaTime) {
  if (playerState.dead) {
    return;
  }

  if (playerState.x < playerState.targetX) {
    playerState.x = Math.min(playerState.targetX, playerState.x + playerState.speed * deltaTime);
  }

  if (playerState.invulnerableTimer > 0) {
    playerState.invulnerableTimer = Math.max(0, playerState.invulnerableTimer - deltaTime * 1000);
  }

  if (!playerState.locked) {
    setPlayerAnimation("walk");
  }

  renderPlayer();
}

function playPlayerAnimation(animationName, duration, onComplete) {
  playerState.locked = true;
  setPlayerAnimation(animationName);
  clearTimeout(playerState.animationTimer);

  playerState.animationTimer = setTimeout(() => {
    playerState.locked = false;
    if (onComplete) {
      onComplete();
    } else if (gameRunning && !playerState.dead) {
      setPlayerAnimation("walk");
    }
  }, duration);
}

function setPlayerAnimation(animationName) {
  if (playerElement.dataset.state === animationName) {
    return;
  }

  const animation = playerProfile.body[animationName] || playerProfile.body.idle;

  playerElement.dataset.state = animationName;
  applySpriteVariant(playerElement, animation, "sprite");
}

function showPlayerCharge(chargeName, angle) {
  const animation = playerProfile.charge[chargeName];

  if (!animation) {
    return;
  }

  playerCharge.hidden = false;
  playerCharge.dataset.state = chargeName;
  playerCharge.style.setProperty("--charge-angle", `${angle}rad`);
  playerCharge.style.setProperty("--charge-scale", chargeName === "charge2" ? 1.1 : 1.35);
  applySpriteVariant(playerCharge, animation, "charge");
  clearTimeout(playerState.chargeTimer);
  playerState.chargeTimer = setTimeout(() => {
    playerCharge.hidden = true;
  }, getAnimationDuration(animation, 260) + 50);
}

function createTarget() {
  const spawnKind = spawnSequence[spawnIndex % spawnSequence.length];
  const profile =
    spawnKind === "drone"
      ? droneProfiles[droneSpawnIndex++ % droneProfiles.length]
      : enemyProfiles[spawnIndex % enemyProfiles.length];
  const width = profile.width;
  const height = profile.height;
  const startPoint = profile.kind === "drone" ? getDroneStart(width, height) : getPatternStart(width, height);

  spawnIndex += 1;

  const element = document.createElement("div");
  element.className = `target target-${profile.kind} target-${profile.id}`;
  element.dataset.animation = "spawn";
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.innerHTML = '<span class="enemy-sprite"></span><span class="enemy-charge" hidden></span>';

  const target = {
    element,
    charge: element.querySelector(".enemy-charge"),
    kind: profile.kind,
    profile,
    canCloseAttack: profile.kind !== "drone" && profile.closeAttacks.length > 0,
    canShoot: profile.canShoot,
    width,
    height,
    x: startPoint.x,
    y: startPoint.y,
    displayY: startPoint.y,
    goalY: startPoint.goalY || startPoint.y,
    age: 0,
    speed: randomNumber(baseSpeed, baseSpeed + 30) * profile.speed,
    jumpiness: profile.jumpiness || 1,
    hopAmount: Math.round(randomNumber(10, 24) * (profile.jumpiness || 1)),
    hopTimer: randomNumber(500, 1700),
    hopAge: 0,
    hopDuration: 0,
    phase: randomNumber(0, 628) / 100,
    closeAttackTimer: randomNumber(500, 1200),
    closeAttackIndex: 0,
    shotIndex: 0,
    shootTimer: randomNumber(900, 1700),
    shootCooldown: randomNumber(2100, 3400),
    animationLocked: true,
    animationTimer: 0,
    chargeTimer: 0,
    pendingShotTimer: 0,
    dead: false,
  };

  element.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    hitTarget(target);
  });

  playArea.appendChild(element);
  targets.push(target);
  renderTarget(target);
  playEnemyAnimation(target, "enable", getAnimationDuration(target.profile.animations.enable, 430));
}

function getPatternStart(width, height) {
  const areaWidth = playArea.clientWidth;
  const floorTop = getFloorTop();
  const spawnOffset = randomNumber(0, Math.round(areaWidth * 0.16));

  return { x: areaWidth + spawnOffset, y: floorTop - height };
}

function getDroneStart(width, height) {
  const areaWidth = playArea.clientWidth;
  const areaHeight = playArea.clientHeight;
  const minY = Math.round(areaHeight * 0.16);
  const maxY = Math.round(areaHeight * 0.48);
  const y = randomNumber(minY, maxY);

  return {
    x: areaWidth + randomNumber(0, Math.round(areaWidth * 0.18)),
    y,
    goalY: randomNumber(minY, maxY) - height * 0.1,
  };
}

function hitTarget(target) {
  if (!gameRunning || target.dead || playerState.dead) {
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
  clearTimeout(target.chargeTimer);
  clearTimeout(target.pendingShotTimer);
  target.element.remove();
  targets = targets.filter((currentTarget) => currentTarget !== target);
}

function gameLoop(currentTime) {
  if (!gameRunning) {
    return;
  }

  const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, maxDeltaTime);
  lastFrameTime = currentTime;
  spawnTimer += deltaTime * 1000;

  if (spawnTimer >= spawnDelay && targets.length < maxTargets) {
    spawnTimer = 0;
    createTarget();
  }

  updateParallax(deltaTime);
  updatePlayer(deltaTime);
  moveTargets(deltaTime);
  moveEnemyProjectiles(deltaTime);
  animationId = requestAnimationFrame(gameLoop);
}

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

    if (!target.dead && target.kind === "drone" && hasEscapedLeft(target)) {
      damagePlayer();
      removeTarget(target);
    } else if (!target.dead && target.kind !== "drone" && isTouchingPlayer(target, playerPoint)) {
      damagePlayer();
      defeatTarget(target);
    }
  });

  updatePlayerCloseAttack(hasCloseTarget);
}

function moveTargetTowardPlayer(target, playerPoint, deltaTime) {
  if (target.kind === "drone") {
    target.x -= target.speed * deltaTime;
    target.y += (target.goalY - target.y) * Math.min(deltaTime * 1.8, 1);
    return;
  }

  const targetCenterX = target.x + target.width / 2;
  const goalX = playerPoint.x + 16;
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
      target.hopTimer = Math.round(randomNumber(900, 2300) / target.jumpiness);
    }

    return;
  }

  target.hopTimer -= deltaTime * 1000;

  if (target.hopTimer <= 0) {
    target.hopDuration = Math.round(randomNumber(260, 430) / Math.min(target.jumpiness, 1.25));
    target.hopAmount = Math.round(randomNumber(12, 28) * target.jumpiness);
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
  if (!target.canShoot || target.dead) {
    return;
  }

  const targetPoint = getTargetPoint(target);
  const distanceToPlayer = Math.hypot(targetPoint.x - playerPoint.x, targetPoint.y - playerPoint.y);

  target.shootTimer -= deltaTime * 1000;

  if (target.shootTimer > 0 || target.animationLocked || distanceToPlayer < 170 || distanceToPlayer > 1200) {
    return;
  }

  enemyShoot(target, playerPoint);
  target.shootTimer = target.shootCooldown;
  target.shootCooldown = randomNumber(2100, 3600);
}

function enemyShoot(target, playerPoint) {
  const shotAnimations = target.profile.shotAnimations || [];
  const chargeAnimations = target.profile.chargeAnimations || [];
  const shotAnimation = shotAnimations[target.shotIndex % Math.max(shotAnimations.length, 1)];
  const chargeAnimation = chargeAnimations[target.shotIndex % Math.max(chargeAnimations.length, 1)];
  const start = getTargetPoint(target);
  const angle = Math.atan2(playerPoint.y - start.y, playerPoint.x - start.x);

  target.shotIndex += 1;
  showEnemyCharge(target, chargeAnimation, angle);

  if (shotAnimation) {
    playEnemyAnimation(target, shotAnimation, getAnimationDuration(target.profile.animations[shotAnimation], 480));
  }

  clearTimeout(target.pendingShotTimer);
  target.pendingShotTimer = setTimeout(() => {
    if (gameRunning && !target.dead && targets.includes(target)) {
      createEnemyProjectile(target, playerPoint);
    }
  }, shotAnimation ? 170 : 0);
}

function showEnemyCharge(target, chargeName, angle) {
  const animation = target.profile.charge?.[chargeName];

  if (!animation || !target.charge) {
    return;
  }

  target.charge.hidden = false;
  target.charge.style.setProperty("--charge-angle", `${angle}rad`);
  target.charge.style.setProperty("--charge-scale", chargeName === "charge2" ? 1.05 : 1.2);
  applySpriteVariant(target.charge, animation, "charge");
  clearTimeout(target.chargeTimer);
  target.chargeTimer = setTimeout(() => {
    target.charge.hidden = true;
  }, getAnimationDuration(animation, 260) + 50);
}

function createEnemyProjectile(target, playerPoint) {
  if (enemyProjectiles.length >= maxEnemyProjectiles) {
    removeEnemyProjectile(enemyProjectiles[0]);
  }

  const start = getTargetPoint(target);
  const deltaX = playerPoint.x - start.x;
  const deltaY = playerPoint.y - start.y;
  const angle = Math.atan2(deltaY, deltaX);
  const variant = pickBombVariant();
  const projectile = document.createElement("div");

  projectile.className = "bomb-projectile enemy-projectile";
  applySpriteVariant(projectile, variant, "bomb");
  projectile.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    hitEnemyProjectile(projectileState);
  });
  playArea.appendChild(projectile);

  const projectileState = {
    element: projectile,
    scale: variant.frameHeight > 32 ? 1.0 : 1.45,
    radius: Math.max(14, variant.frameHeight * 0.7),
    x: start.x,
    y: start.y,
    vx: Math.cos(angle) * enemyProjectileSpeed,
    vy: Math.sin(angle) * enemyProjectileSpeed,
    angle,
    spinAngle: 0,
    spinSpeed: getRandomProjectileSpinSpeed(),
    age: 0,
  };

  renderEnemyProjectile(projectileState);
  enemyProjectiles.push(projectileState);
}

function moveEnemyProjectiles(deltaTime) {
  const playerPoint = getPlayerPoint();

  for (let index = enemyProjectiles.length - 1; index >= 0; index -= 1) {
    const projectile = enemyProjectiles[index];

    projectile.age += deltaTime;
    projectile.x += projectile.vx * deltaTime;
    projectile.y += projectile.vy * deltaTime;
    projectile.spinAngle += projectile.spinSpeed * deltaTime;
    renderEnemyProjectile(projectile);

    const distanceToPlayer = Math.hypot(projectile.x - playerPoint.x, projectile.y - playerPoint.y);
    const blockRadius = playerProjectileHitRadius * playerProjectileBlockMultiplier;

    if (isPlayerBlockingProjectiles() && distanceToPlayer < projectile.radius + blockRadius) {
      blockEnemyProjectile(projectile);
    } else if (distanceToPlayer < projectile.radius + playerProjectileHitRadius) {
      createShotEffect(projectile.x, projectile.y, projectile.angle, 0.9);
      removeEnemyProjectile(projectile);
      damagePlayer();
    } else if (
      projectile.age > 3 ||
      projectile.x < -80 ||
      projectile.x > playArea.clientWidth + 80 ||
      projectile.y < -80 ||
      projectile.y > playArea.clientHeight + 80
    ) {
      removeEnemyProjectile(projectile);
    }
  }
}

function hitEnemyProjectile(projectile) {
  if (!gameRunning || playerState.dead || !enemyProjectiles.includes(projectile)) {
    return;
  }

  score += 1;
  showShot(projectile.x, projectile.y);
  createShotEffect(projectile.x, projectile.y, projectile.angle, 1.0);
  removeEnemyProjectile(projectile);
  updateHud();
}

function blockEnemyProjectile(projectile) {
  createShotEffect(projectile.x, projectile.y, projectile.angle, 1.1);
  removeEnemyProjectile(projectile);
}

function removeEnemyProjectile(projectile) {
  projectile.element.remove();
  enemyProjectiles = enemyProjectiles.filter((currentProjectile) => currentProjectile !== projectile);
}

function renderEnemyProjectile(projectile) {
  projectile.element.style.transform =
    `translate3d(${projectile.x}px, ${projectile.y}px, 0) translate(-50%, -50%) rotate(${projectile.angle + projectile.spinAngle}rad) scale(${projectile.scale})`;
}

function renderTarget(target) {
  let extraY = 0;

  if (target.kind === "drone") {
    extraY = Math.sin(target.age * 5.4 + target.phase) * 10;
  } else if (target.hopDuration > 0) {
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
  if (!target.animationLocked) {
    setEnemyAnimation(target, "walk");
  }
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
  applyCharacterAnimation(target.element, target.profile, animationName);
  target.element.style.setProperty("--enemy-scale", target.profile.scale);
  target.element.style.setProperty("--enemy-left", `${target.profile.spriteLeft}px`);
  target.element.style.setProperty("--enemy-top", `${target.profile.spriteTop}px`);
}

function isTouchingPlayer(target, playerPoint) {
  const targetPoint = getTargetPoint(target);
  const distanceToPlayer = Math.hypot(targetPoint.x - playerPoint.x, targetPoint.y - playerPoint.y);

  return distanceToPlayer < 64;
}

function isCloseToPlayer(target, playerPoint) {
  const targetPoint = getTargetPoint(target);
  const distanceToPlayer = Math.hypot(targetPoint.x - playerPoint.x, targetPoint.y - playerPoint.y);

  return distanceToPlayer < 230;
}

function updatePlayerCloseAttack(hasCloseTarget) {
  if (!hasCloseTarget) {
    return;
  }

  triggerPlayerShortAttack();
}

function triggerPlayerShortAttack() {
  if (!gameRunning || playerState.locked || playerState.dead) {
    return;
  }

  const animationName = playerState.attackIndex % 2 === 0 ? "attack1" : "attack2";

  playerState.attackIndex += 1;
  playPlayerAnimation(animationName, getAnimationDuration(playerProfile.body[animationName], 460));
}

function isPlayerBlockingProjectiles() {
  const state = playerElement.dataset.state;
  return state === "attack1" || state === "attack2";
}

function damagePlayer() {
  if (playerState.dead || playerState.invulnerableTimer > 0) {
    return;
  }

  lives = Math.max(0, lives - 1);
  updateHud();

  if (lives <= 0) {
    endGame();
    return;
  }

  playerState.invulnerableTimer = 950;
  playerElement.classList.add("is-hit");
  playPlayerAnimation("hurt", getAnimationDuration(playerProfile.body.hurt, 360), () => {
    playerElement.classList.remove("is-hit");
    setPlayerAnimation("walk");
  });
}

function hasEscapedLeft(target) {
  return target.x < -target.width - 20;
}

function endGame() {
  if (playerState.dead) {
    return;
  }

  gameRunning = false;
  playerState.dead = true;
  cancelAnimationFrame(animationId);
  clearTimeout(playerState.animationTimer);
  playPlayerAnimation("shutdown", getAnimationDuration(playerProfile.body.shutdown, 700), () => {
    playerState.locked = true;
    setPlayerAnimation("dead");
  });
  gameOverTimer = setTimeout(() => {
    if (!gameRunning) {
      gameOverPanel.hidden = false;
    }
  }, 1300);
}

function updateParallax(deltaTime) {
  if (!parallaxTileWidth) {
    updateParallaxMetrics();
  }

  for (let index = 0; index < parallaxTracks.length; index += 1) {
    const speed = parallaxLayerSpeeds[index] || parallaxLayerSpeeds[parallaxLayerSpeeds.length - 1];

    parallaxScroll[index] =
      (parallaxScroll[index] - worldSpeed * speed * deltaTime) % parallaxTileWidth;
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
  parallaxScroll = parallaxTracks.map(() => 0);
  updateParallaxMetrics();
  updateParallax(0);
}

function showShot(endX, endY) {
  const start = getMuzzlePoint();
  const deltaX = endX - start.x;
  const deltaY = endY - start.y;
  const length = Math.hypot(deltaX, deltaY);
  const angle = Math.atan2(deltaY, deltaX);
  const shotAnimation = playerState.shotIndex % 2 === 0 ? "shot1" : "shot2";
  const chargeAnimation = playerState.shotIndex % 2 === 0 ? "charge1" : "charge2";

  playerState.shotIndex += 1;
  showPlayerCharge(chargeAnimation, angle);
  playPlayerAnimation(shotAnimation, getAnimationDuration(playerProfile.body[shotAnimation], 470));
  createCyberBeam(start, length, angle);
  createShotEffect(start.x, start.y, angle, 0.72);
  createProjectileTrail(start, length, angle);
  createShotEffect(endX, endY, angle, 1.05);
}

function createCyberBeam(start, length, angle) {
  const beam = document.createElement("div");
  const palette = beamPalettes[randomNumber(0, beamPalettes.length - 1)];

  beam.className = `shot-beam ${palette}`;
  beam.innerHTML = '<span class="beam-pulse"></span><span class="beam-head"></span>';
  beam.style.left = `${start.x}px`;
  beam.style.top = `${start.y}px`;
  beam.style.width = `${length}px`;
  beam.style.setProperty("--angle", `${angle}rad`);
  playArea.appendChild(beam);

  setTimeout(() => beam.remove(), 560);
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
    sprite.style.setProperty("--spin-duration", `${randomNumber(180, 620)}ms`);
    sprite.style.setProperty("--spin-turn", randomNumber(0, 1) === 0 ? "1turn" : "-1turn");
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
  effect.style.setProperty("--scale", scale * 4);
  playArea.appendChild(effect);

  setTimeout(() => effect.remove(), Math.ceil(variant.duration * 1000) + 80);
}

function clearShotEffects() {
  clearTimeout(playerState.chargeTimer);
  document
    .querySelectorAll(".bomb-projectile, .shot-effect, .shot-beam")
    .forEach((effect) => effect.remove());
  playerCharge.hidden = true;
}

function getRandomProjectileSpinSpeed() {
  const direction = randomNumber(0, 1) === 0 ? -1 : 1;

  return direction * randomNumber(5, 14);
}

function getMuzzlePoint() {
  return {
    x: playerState.x + 111 * playerState.scale,
    y: playerState.y + 58 * playerState.scale,
  };
}

function getPlayerPoint() {
  return {
    x: playerState.x + 72 * playerState.scale,
    y: playerState.y + 72 * playerState.scale,
  };
}

function getTargetPoint(target) {
  return {
    x: target.x + target.width / 2,
    y: target.displayY + target.height / 2,
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
  return playArea.clientHeight - (compactHeight ? compactFloorHeight : floorHeight);
}

function getPlayerTopForBlueLine() {
  return getFloorTop() - playerState.height * playerState.scale - 2;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showRemotePopup(message) {
  remotePopupMessage.textContent = message || "";
  remotePopup.hidden = false;
}

function hideRemotePopup() {
  remotePopup.hidden = true;
}

function setupRemotePopupSocket() {
  if (typeof io !== "function") {
    console.warn("[socket] Socket.IO client is not available");
    return;
  }

  const socket = io(SOCKET_SERVER_URL);

  socket.on("popup:show", (data = {}) => {
    showRemotePopup(data.message);
  });

  socket.on("popup:hide", () => {
    hideRemotePopup();
  });

  socket.on("connect_error", (error) => {
    console.warn("[socket] connection error:", error.message);
  });
}

restartButton.addEventListener("click", startGame);
gameOverRestartButton.addEventListener("click", startGame);
remotePopupClose.addEventListener("click", hideRemotePopup);
playArea.addEventListener("pointerdown", (event) => {
  if (event.target !== playArea) {
    return;
  }

  event.preventDefault();
  triggerPlayerShortAttack();
});
window.addEventListener("resize", () => {
  updateParallaxMetrics();
  renderPlayer();
}, { passive: true });
document.querySelectorAll(".city-track img").forEach((image) => {
  image.addEventListener("load", updateParallaxMetrics, { once: true });
});

setupRemotePopupSocket();
startGame();
