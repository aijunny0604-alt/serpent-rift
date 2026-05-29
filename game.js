const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;
const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
canvas.width = W * DPR;
canvas.height = H * DPR;
canvas.style.width = `${W}px`;
canvas.style.height = `${H}px`;
ctx.scale(DPR, DPR);

const bg = new Image();
bg.src = "./assets/serpent-arena.png";

const stages = [
  { id: "forest", name: "Elderwood Ruins", image: bg, tint: "rgba(37, 255, 170, .10)", enemyColor: "#ffd965" },
  { id: "volcano", name: "Obsidian Gate", image: loadImage("./assets/stage-volcano.png"), tint: "rgba(255, 86, 24, .16)", enemyColor: "#ff8b3d" },
  { id: "frost", name: "Frozen Citadel", image: loadImage("./assets/stage-frost.png"), tint: "rgba(90, 214, 255, .16)", enemyColor: "#8dfffb" },
  { id: "void", name: "Astral Void", image: loadImage("./assets/stage-void.png"), tint: "rgba(190, 88, 255, .18)", enemyColor: "#d66bff" },
];

const sprites = {
  player: loadImage("./assets/player.png"),
  playerSheet: loadImage("./assets/player-action-sheet.png"),
  skillIcons: loadImage("./assets/skill-icons.png"),
  itemIcons: loadImage("./assets/item-icons.png"),
  uiPanel: loadImage("./assets/ui-panel.png"),
  runeEffects: loadImage("./assets/rune-effects.png"),
  lootIcons: loadImage("./assets/loot-icons.png"),
  elementFx: loadImage("./assets/element-fx.png"),
  shade: loadImage("./assets/shade.png"),
  shadeSheet: loadImage("./assets/shade-action-sheet.png"),
  elite: loadImage("./assets/elite.png"),
  eliteSheet: loadImage("./assets/elite-action-sheet.png"),
  boss: loadImage("./assets/boss.png"),
  bossSheet: loadImage("./assets/boss-action-sheet.png"),
};

const playerSheet = {
  frameW: 160,
  frameH: 160,
  cols: 6,
  rows: {
    idle: 0,
    walk: 1,
    attack: 2,
    hurt: 3,
    cast: 4,
  },
};

const enemySheet = {
  frameW: 128,
  frameH: 128,
  cols: 6,
  rows: { idle: 0, walk: 1, attack: 2, hurt: 3 },
};

const SPRITE_BLEED = 0.5;

function hexAlpha(hex, a) {
  if (!hex || hex[0] !== "#") return `rgba(255,255,255,${a})`;
  const v = hex.slice(1);
  const n = v.length === 3
    ? parseInt(v[0] + v[0] + v[1] + v[1] + v[2] + v[2], 16)
    : parseInt(v, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

const _tintCanvas = document.createElement("canvas");
const _tintCtx = _tintCanvas.getContext("2d");

function drawSheetFrameTinted(sheet, sx, sy, sw, sh, dx, dy, dw, dh, tints) {
  const ow = Math.max(8, Math.ceil(sw));
  const oh = Math.max(8, Math.ceil(sh));
  if (_tintCanvas.width !== ow) _tintCanvas.width = ow;
  if (_tintCanvas.height !== oh) _tintCanvas.height = oh;
  _tintCtx.globalCompositeOperation = "source-over";
  _tintCtx.clearRect(0, 0, ow, oh);
  _tintCtx.drawImage(sheet, sx, sy, sw, sh, 0, 0, ow, oh);
  if (tints && tints.length) {
    _tintCtx.globalCompositeOperation = "source-atop";
    for (const t of tints) {
      if (!t) continue;
      _tintCtx.fillStyle = t;
      _tintCtx.fillRect(0, 0, ow, oh);
    }
    _tintCtx.globalCompositeOperation = "source-over";
  }
  ctx.drawImage(_tintCanvas, dx, dy, dw, dh);
}

function drawSpriteTinted(sprite, dx, dy, dw, dh, tints) {
  if (!sprite.complete || sprite.naturalWidth <= 0) return false;
  const sw = sprite.naturalWidth;
  const sh = sprite.naturalHeight;
  const ow = Math.max(8, Math.ceil(sw));
  const oh = Math.max(8, Math.ceil(sh));
  if (_tintCanvas.width !== ow) _tintCanvas.width = ow;
  if (_tintCanvas.height !== oh) _tintCanvas.height = oh;
  _tintCtx.globalCompositeOperation = "source-over";
  _tintCtx.clearRect(0, 0, ow, oh);
  _tintCtx.drawImage(sprite, 0, 0, ow, oh);
  if (tints && tints.length) {
    _tintCtx.globalCompositeOperation = "source-atop";
    for (const t of tints) {
      if (!t) continue;
      _tintCtx.fillStyle = t;
      _tintCtx.fillRect(0, 0, ow, oh);
    }
    _tintCtx.globalCompositeOperation = "source-over";
  }
  ctx.drawImage(_tintCanvas, dx, dy, dw, dh);
  return true;
}

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const state = {
  t: 0,
  screen: "title",
  paused: false,
  shake: 0,
  score: 0,
  kills: 0,
  wave: 1,
  stageIndex: 0,
  stageIntro: 3,
  bossMode: false,
  message: "SERPENT RIFT",
  messageTime: 3,
  gold: 0,
  lootFlash: 0,
  hitStop: 0,
  powerFlash: 0,
  shockwave: 0,
  autoSkillTimer: 0.8,
  ultimateCharge: 0,
  comboText: "",
  comboTime: 0,
  panel: null,
  soundOn: false,
};

const audio = {
  ctx: null,
  master: null,
  musicGain: null,
  sfxGain: null,
  musicTimer: null,
  step: 0,
  enabled: true,
};

const player = {
  x: W * 0.48,
  y: H * 0.73,
  r: 17,
  hp: 120,
  maxHp: 120,
  mp: 100,
  maxMp: 100,
  level: 1,
  exp: 0,
  nextExp: 80,
  atk: 13,
  speed: 245,
  targetX: W * 0.48,
  targetY: H * 0.73,
  slashCd: 0,
  invuln: 0,
  facing: -Math.PI / 2,
  attackAnim: 0,
  castAnim: 0,
  castColor: "#ffd965",
  hurtAnim: 0,
  stepAnim: 0,
  footstepTimer: 0,
  isMoving: false,
};

const skills = [
  { id: "nova", name: "Nova", icon: "✦", cd: 0, maxCd: 5.2, cost: 22, color: "#ffd965" },
  { id: "lance", name: "Lance", icon: "◆", cd: 0, maxCd: 3.4, cost: 16, color: "#57dfff" },
  { id: "rift", name: "Rift", icon: "●", cd: 0, maxCd: 8.4, cost: 34, color: "#d66bff" },
];

const enemies = [];
const particles = [];
const hits = [];
const hazards = [];
const pickups = [];
const lootDrops = [];
const projectiles = [];

const inventoryItems = [
  { name: "Astral Blade", type: "Weapon", icon: 0, power: "+128 ATK", rarity: "#57dfff" },
  { name: "Sunplate", type: "Armor", icon: 1, power: "+920 HP", rarity: "#ffd965" },
  { name: "Void Ring", type: "Relic", icon: 2, power: "+18% Crit", rarity: "#d66bff" },
  { name: "Gale Boots", type: "Boots", icon: 3, power: "+24 SPD", rarity: "#8dfffb" },
  { name: "Ruby Core", type: "Gem", icon: 4, power: "+Fire", rarity: "#ff7184" },
  { name: "Rune Codex", type: "Scroll", icon: 5, power: "+Skill", rarity: "#fff2a5" },
  { name: "Mana Orb", type: "Orb", icon: 6, power: "+MP Regen", rarity: "#8aa6ff" },
  { name: "Crown Helm", type: "Helm", icon: 7, power: "+Boss DMG", rarity: "#ff9c37" },
];

skills[0].icon = "*";
skills[0].maxCd = 4.8;
skills[0].cost = 18;
skills[1].icon = "/";
skills[1].maxCd = 2.6;
skills[1].cost = 13;
skills[2].icon = "o";
skills[2].maxCd = 6.6;
skills[2].cost = 26;
skills.push(
  { id: "storm", name: "Storm", icon: "Z", cd: 0, maxCd: 5.8, cost: 22, color: "#8dfffb" },
  { id: "meteor", name: "Meteor", icon: "M", cd: 0, maxCd: 7.8, cost: 30, color: "#ff8b3d" },
  { id: "blink", name: "Phantom", icon: "X", cd: 0, maxCd: 4.2, cost: 24, color: "#ffffff" },
  { id: "thunder", name: "Thunderfall", icon: "T", cd: 0, maxCd: 6.2, cost: 28, color: "#73f5ff" },
  { id: "inferno", name: "Inferno", icon: "F", cd: 0, maxCd: 7.2, cost: 32, color: "#ff5a2e" },
);

const skillPalettes = {
  nova: ["#ffd965", "#ffffff", "#ff7a4a", "#ffeeb0"],
  lance: ["#57dfff", "#ffffff", "#2b7cff", "#9df8ff"],
  rift: ["#d66bff", "#ff7df2", "#7338ff", "#ffffff"],
  storm: ["#8dfffb", "#6fff7b", "#ffffff", "#37a5ff"],
  meteor: ["#ff8b3d", "#ffd35a", "#ff3d4f", "#ffffff"],
  blink: ["#ffffff", "#8dfffb", "#ffd965", "#d66bff"],
  thunder: ["#ffffff", "#73f5ff", "#297dff", "#fff26e"],
  inferno: ["#ff5a2e", "#ffd45a", "#ffffff", "#a70028"],
  ultimate: ["#ffffff", "#ffd965", "#57dfff", "#d66bff", "#ff3d4f"],
};

const input = {
  down: false,
  pointerX: player.x,
  pointerY: player.y,
  joyActive: false,
  joyStartX: 82,
  joyStartY: H - 156,
  joyX: 82,
  joyY: H - 156,
  moveX: 0,
  moveY: 0,
  keys: new Set(),
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function dist(a, b, c, d) {
  return Math.hypot(a - c, b - d);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function currentStage() {
  return stages[state.stageIndex % stages.length];
}

function syncStageForWave() {
  const nextIndex = Math.floor((state.wave - 1) / 3) % stages.length;
  if (nextIndex !== state.stageIndex) {
    state.stageIndex = nextIndex;
    state.stageIntro = 3;
    state.message = currentStage().name.toUpperCase();
    state.messageTime = 2;
    state.powerFlash = Math.max(state.powerFlash, 0.55);
    state.shockwave = 1;
    state.shake = Math.max(state.shake, 16);
  }
}

function ensureAudio() {
  return;
  if (!state.soundOn) return;
  if (!audio.ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audio.ctx = new AudioContext();
    audio.master = audio.ctx.createGain();
    audio.musicGain = audio.ctx.createGain();
    audio.sfxGain = audio.ctx.createGain();
    audio.master.gain.value = 0.7;
    audio.musicGain.gain.value = 0.18;
    audio.sfxGain.gain.value = 0.55;
    audio.musicGain.connect(audio.master);
    audio.sfxGain.connect(audio.master);
    audio.master.connect(audio.ctx.destination);
  }
  if (audio.ctx.state === "suspended") audio.ctx.resume();
  if (!audio.musicTimer) startBgm();
}

function tone(freq, duration, type = "sine", gain = 0.2, dest = audio.sfxGain, when = 0, slideTo = null) {
  if (!audio.ctx || !state.soundOn) return;
  const now = audio.ctx.currentTime + when;
  const osc = audio.ctx.createOscillator();
  const amp = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), now + duration);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp);
  amp.connect(dest);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function noise(duration, gain = 0.18, when = 0, filterFreq = 1200) {
  if (!audio.ctx || !state.soundOn) return;
  const now = audio.ctx.currentTime + when;
  const buffer = audio.ctx.createBuffer(1, audio.ctx.sampleRate * duration, audio.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const src = audio.ctx.createBufferSource();
  const filter = audio.ctx.createBiquadFilter();
  const amp = audio.ctx.createGain();
  src.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.9;
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  src.connect(filter);
  filter.connect(amp);
  amp.connect(audio.sfxGain);
  src.start(now);
}

function playSfx(kind) {
  ensureAudio();
  if (!audio.ctx || !state.soundOn) return;
  if (kind === "hit") {
    tone(180, 0.09, "square", 0.12, audio.sfxGain, 0, 90);
    noise(0.08, 0.12, 0, 1800);
  }
  if (kind === "crit") {
    tone(130, 0.16, "sawtooth", 0.2, audio.sfxGain, 0, 55);
    tone(760, 0.13, "triangle", 0.16, audio.sfxGain, 0.02, 1180);
    noise(0.18, 0.22, 0, 2400);
  }
  if (kind === "slash") {
    tone(620, 0.11, "sawtooth", 0.11, audio.sfxGain, 0, 1100);
    noise(0.12, 0.1, 0, 5200);
  }
  if (kind === "spell") {
    tone(392, 0.18, "triangle", 0.12, audio.sfxGain, 0, 784);
    tone(988, 0.22, "sine", 0.08, audio.sfxGain, 0.04, 1480);
  }
  if (kind === "meteor") {
    tone(260, 0.32, "sawtooth", 0.18, audio.sfxGain, 0, 60);
    noise(0.3, 0.22, 0.06, 650);
  }
  if (kind === "ultimate") {
    tone(98, 0.55, "sawtooth", 0.24, audio.sfxGain, 0, 42);
    tone(523, 0.42, "triangle", 0.16, audio.sfxGain, 0.05, 1046);
    tone(1568, 0.55, "sine", 0.12, audio.sfxGain, 0.16, 2093);
    noise(0.5, 0.28, 0.12, 1900);
  }
}

function startBgm() {
  if (!audio.ctx || audio.musicTimer) return;
  const bass = [55, 55, 65.41, 73.42, 82.41, 73.42, 65.41, 49];
  const lead = [220, 246.94, 261.63, 329.63, 293.66, 261.63, 246.94, 196];
  const tick = () => {
    if (!state.soundOn || !audio.ctx) return;
    const i = audio.step % bass.length;
    tone(bass[i], 0.34, "sawtooth", 0.09, audio.musicGain, 0, bass[i] * 0.5);
    if (i % 2 === 0) tone(lead[i], 0.18, "triangle", 0.045, audio.musicGain, 0.02, lead[i] * 1.5);
    if (i % 4 === 0) noise(0.05, 0.035, 0.01, 9000);
    audio.step += 1;
  };
  tick();
  audio.musicTimer = window.setInterval(tick, 260);
}

function toggleSound() {
  state.soundOn = false;
  audio.enabled = state.soundOn;
  if (audio.master) audio.master.gain.value = state.soundOn ? 0.7 : 0;
}

function spawnEnemy(kind = "shade") {
  const edge = Math.floor(rand(0, 4));
  const pos = [
    [rand(50, W - 50), 120],
    [rand(50, W - 50), H - 240],
    [38, rand(180, H - 260)],
    [W - 38, rand(180, H - 260)],
  ][edge];
  const elite = kind === "elite";
  const stagePower = 1 + state.stageIndex * 0.18 + Math.floor((state.wave - 1) / stages.length) * 0.08;
  enemies.push({
    kind,
    x: pos[0],
    y: pos[1],
    r: elite ? 21 : 15,
    hp: Math.floor((elite ? 74 + state.wave * 16 : 34 + state.wave * 8) * stagePower),
    maxHp: Math.floor((elite ? 74 + state.wave * 16 : 34 + state.wave * 8) * stagePower),
    atk: Math.floor((elite ? 13 : 7) * stagePower),
    speed: (elite ? 58 : 78) + state.stageIndex * 4,
    hit: 0,
    attackAnim: 0,
    knockX: 0,
    knockY: 0,
    walkAnim: rand(0, 10),
    moving: false,
    pulse: rand(0, 9),
  });
}

function spawnBoss() {
  state.bossMode = true;
  state.message = "ANCIENT SERPENT AWAKENS";
  state.messageTime = 2.2;
  enemies.length = 0;
  enemies.push({
    kind: "boss",
    x: W * 0.55,
    y: H * 0.33,
    r: 58,
    hp: 720 + state.wave * 90,
    maxHp: 720 + state.wave * 90,
    atk: 18 + state.wave * 2,
    speed: 28,
    hit: 0,
    attackAnim: 0,
    knockX: 0,
    knockY: 0,
    walkAnim: 0,
    moving: false,
    pulse: 0,
    pattern: 2,
  });
}

function addParticle(x, y, color, amount = 10, power = 1) {
  for (let i = 0; i < amount; i += 1) {
    const a = rand(0, Math.PI * 2);
    const s = rand(40, 180) * power;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(0.25, 0.75),
      max: rand(0.35, 0.8),
      size: rand(2, 6) * power,
      color,
    });
  }
}

function addPrismaticBurst(x, y, palette, amount = 28, power = 1) {
  for (let i = 0; i < amount; i += 1) {
    const color = palette[i % palette.length];
    const a = rand(0, Math.PI * 2);
    const s = rand(80, 260) * power;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(0.34, 0.95),
      max: rand(0.5, 1.05),
      size: rand(2.5, 8) * power,
      color,
    });
  }
}

function spawnSkillAura(x, y, skillId, radius = 110, life = 0.7) {
  const palette = skillPalettes[skillId] || [currentStage().enemyColor, "#ffffff"];
  hazards.push({
    type: "skillAura",
    x,
    y,
    radius,
    life,
    max: life,
    palette,
    spin: rand(-1, 1),
  });
  addPrismaticBurst(x, y, palette, 22, 0.9);
}

function spawnLoot(x, y, enemyKind) {
  const count = enemyKind === "boss" ? 16 : enemyKind === "elite" ? 8 : 4;
  for (let i = 0; i < count; i += 1) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(80, enemyKind === "boss" ? 230 : 170);
    const rareRoll = Math.random();
    const icon = enemyKind === "boss" && rareRoll < 0.28 ? 3 : rareRoll < 0.18 ? 1 : rareRoll < 0.25 ? 2 : 0;
    const value = icon === 0 ? rand(2, 9) : icon === 3 ? 80 : rand(18, 40);
    lootDrops.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - rand(80, 170),
      life: 2.8,
      age: 0,
      icon,
      value: Math.floor(value),
      spin: rand(0, Math.PI * 2),
      scale: icon === 3 ? 1.1 : rand(0.78, 0.96),
      picked: false,
      rarity: icon === 3 ? "#d66bff" : icon === 0 ? "#ffd965" : "#57dfff",
    });
  }
}

function damageEnemy(enemy, amount, color = "#fff2a5", sourceX = player.x, sourceY = player.y) {
  const finalAmount = Math.floor(amount);
  const crit = finalAmount >= player.atk * 1.75 || Math.random() < 0.18;
  const heavy = crit || finalAmount >= player.atk * 1.25;
  enemy.hp -= amount;
  enemy.hit = heavy ? 0.42 : 0.3;
  const kx = enemy.x - sourceX;
  const ky = enemy.y - sourceY;
  const kd = Math.hypot(kx, ky) || 1;
  const force = (enemy.kind === "boss" ? 95 : enemy.kind === "elite" ? 230 : 330) * (heavy ? 1.35 : 1);
  enemy.knockX += (kx / kd) * force;
  enemy.knockY += (ky / kd) * force;
  hits.push({
    x: enemy.x + rand(-12, 12),
    y: enemy.y - enemy.r - (crit ? 10 : 0),
    vx: rand(-18, 18),
    vy: crit ? -155 : -108,
    text: finalAmount,
    life: crit ? 1.2 : 0.92,
    max: crit ? 1.2 : 0.92,
    color,
    crit,
    spin: rand(-0.16, 0.16),
  });
  hazards.push({ type: "impact", x: enemy.x, y: enemy.y - enemy.r * 0.1, life: crit ? 0.58 : 0.38, max: crit ? 0.58 : 0.38, color, crit, heavy });
  hazards.push({ type: "powerBurst", x: enemy.x, y: enemy.y, angle: Math.atan2(enemy.y - sourceY, enemy.x - sourceX), life: heavy ? 0.34 : 0.22, max: heavy ? 0.34 : 0.22, color, crit, heavy });
  addParticle(enemy.x, enemy.y, color, crit ? 42 : 22, crit ? 1.7 : 1.12);
  state.shake = Math.max(state.shake, crit ? 22 : heavy ? 14 : 8);
  state.hitStop = Math.max(state.hitStop, crit ? 0.075 : heavy ? 0.045 : 0.025);
  state.powerFlash = Math.max(state.powerFlash, crit ? 0.42 : 0.24);
  state.shockwave = Math.max(state.shockwave, crit ? 1 : 0.55);
  playSfx(crit ? "crit" : "hit");
  if (enemy.hp <= 0) {
    const gain = enemy.kind === "boss" ? 160 : enemy.kind === "elite" ? 36 : 18;
    player.exp += gain;
    state.gold += enemy.kind === "boss" ? 90 : enemy.kind === "elite" ? 14 : 6;
    state.score += gain * 5;
    state.kills += 1;
    pickups.push({ x: enemy.x, y: enemy.y, life: 1.3, value: gain });
    spawnLoot(enemy.x, enemy.y, enemy.kind);
    addParticle(enemy.x, enemy.y, enemy.kind === "boss" ? "#95ff70" : "#ffd965", enemy.kind === "boss" ? 42 : 16, 1.15);
    if (enemy.kind === "boss") {
      state.bossMode = false;
      state.wave += 1;
      syncStageForWave();
      state.message = `WAVE ${state.wave}`;
      state.messageTime = 2;
      state.lootFlash = 2;
      player.hp = Math.min(player.maxHp, player.hp + 42);
      player.mp = player.maxMp;
    }
  }
}

function levelUp() {
  while (player.exp >= player.nextExp) {
    player.exp -= player.nextExp;
    player.level += 1;
    player.nextExp = Math.floor(player.nextExp * 1.35 + 30);
    player.maxHp += 18;
    player.maxMp += 8;
    player.atk += 5;
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    state.message = `LEVEL ${player.level}`;
    state.messageTime = 1.8;
    addParticle(player.x, player.y, "#ffd965", 46, 1.25);
  }
}

function nearestEnemy() {
  let best = null;
  let bestD = Infinity;
  for (const e of enemies) {
    const d = dist(player.x, player.y, e.x, e.y);
    if (d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return { enemy: best, d: bestD };
}

function enemiesInRange(x, y, radius) {
  return enemies.filter((e) => dist(x, y, e.x, e.y) <= radius);
}

function blinkTargets(originX, originY) {
  return enemies
    .slice()
    .sort((a, b) => dist(originX, originY, a.x, a.y) - dist(originX, originY, b.x, b.y))
    .slice(0, 7);
}

function autoCastSkills(dt) {
  if (player.hp <= 0 || enemies.length === 0) return;
  state.autoSkillTimer -= dt;
  state.ultimateCharge = Math.min(100, state.ultimateCharge + dt * 5 + enemies.length * dt * 0.7);
  if (state.ultimateCharge >= 100) {
    state.ultimateCharge = 0;
    castUltimate();
    return;
  }
  if (state.autoSkillTimer > 0) return;
  state.autoSkillTimer = rand(0.34, 0.72);
  const ready = skills
    .map((skill, index) => ({ skill, index }))
    .filter(({ skill }) => skill.cd <= 0 && player.mp >= skill.cost);
  if (ready.length === 0) return;
  ready.sort((a, b) => b.skill.cost - a.skill.cost);
  castSkill(ready[0].index);
}

function castUltimate() {
  playSfx("ultimate");
  const target = nearestEnemy().enemy || { x: W / 2, y: H * 0.42 };
  player.castAnim = 0.7;
  player.attackAnim = 0.58;
  player.castColor = "#ffffff";
  state.message = "CELESTIAL OVERDRIVE";
  state.messageTime = 1.4;
  state.powerFlash = 0.75;
  state.shockwave = 1;
  state.shake = Math.max(state.shake, 26);
  state.hitStop = Math.max(state.hitStop, 0.08);
  spawnSkillAura(target.x, target.y, "ultimate", 230, 1.3);
  hazards.push({ type: "ultimate", x: target.x, y: target.y, life: 1.35, max: 1.35, color: "#ffffff", tick: 0 });
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8;
    projectiles.push({ type: "comet", x: target.x + Math.cos(angle) * 260, y: target.y - 360 + Math.sin(angle) * 90, tx: target.x, ty: target.y, life: 0.72 + i * 0.035, max: 0.72 + i * 0.035, color: i % 2 ? "#ffd965" : "#57dfff" });
  }
}

function castSkill(index) {
  const s = skills[index];
  if (!s || s.cd > 0 || player.mp < s.cost || player.hp <= 0) return;
  playSfx(s.id === "meteor" ? "meteor" : s.id === "lance" ? "slash" : "spell");
  s.cd = s.maxCd;
  player.mp -= s.cost;
  state.comboText = `${s.name.toUpperCase()}!`;
  state.comboTime = 0.8;
  const target = nearestEnemy().enemy;
  if (target) player.facing = Math.atan2(target.y - player.y, target.x - player.x);
  player.castAnim = 0.48;
  player.castColor = s.color;
  if (s.id === "nova") {
    player.attackAnim = 0.38;
    spawnSkillAura(player.x, player.y, "nova", 160, 0.72);
    addParticle(player.x, player.y, s.color, 52, 1.2);
    for (const e of enemies) {
      const d = dist(player.x, player.y, e.x, e.y);
      if (d < 150) damageEnemy(e, player.atk * 3.2 + rand(6, 18), s.color);
    }
    hazards.push({ type: "friendlyRing", x: player.x, y: player.y, r: 26, maxR: 150, life: 0.42, color: s.color });
  }
  if (s.id === "lance" && target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    player.attackAnim = 0.42;
    spawnSkillAura(player.x + Math.cos(angle) * 72, player.y + Math.sin(angle) * 72, "lance", 95, 0.5);
    for (const e of enemies) {
      const along = (e.x - player.x) * Math.cos(angle) + (e.y - player.y) * Math.sin(angle);
      const side = Math.abs((e.x - player.x) * Math.sin(angle) - (e.y - player.y) * Math.cos(angle));
      if (along > 0 && along < 390 && side < 34) damageEnemy(e, player.atk * 2.4 + rand(8, 22), s.color);
    }
    hazards.push({ type: "beam", x: player.x, y: player.y, angle, life: 0.28, color: s.color });
    projectiles.push({ type: "lance", x: player.x, y: player.y, vx: Math.cos(angle) * 820, vy: Math.sin(angle) * 820, angle, life: 0.44, max: 0.44, color: s.color });
    addParticle(player.x + Math.cos(angle) * 90, player.y + Math.sin(angle) * 90, s.color, 20, 1);
  }
  if (s.id === "rift" && target) {
    player.attackAnim = 0.34;
    spawnSkillAura(target.x, target.y, "rift", 128, 1.05);
    hazards.push({ type: "rift", x: target.x, y: target.y, r: 22, maxR: 118, life: 1.1, tick: 0, color: s.color });
    projectiles.push({ type: "orb", x: player.x, y: player.y, tx: target.x, ty: target.y, life: 0.5, max: 0.5, color: s.color });
    addParticle(target.x, target.y, s.color, 34, 1.15);
  }
  if (s.id === "storm" && target) {
    player.attackAnim = 0.42;
    spawnSkillAura(target.x, target.y, "storm", 142, 1.05);
    hazards.push({ type: "storm", x: target.x, y: target.y, life: 1.2, max: 1.2, tick: 0, color: s.color });
    for (let i = 0; i < 5; i += 1) {
      const angle = (Math.PI * 2 * i) / 5 + state.t;
      projectiles.push({ type: "blade", x: target.x, y: target.y, angle, radius: 32 + i * 13, life: 0.85, max: 0.85, color: s.color });
    }
  }
  if (s.id === "meteor" && target) {
    player.attackAnim = 0.5;
    spawnSkillAura(target.x, target.y, "meteor", 150, 0.9);
    hazards.push({ type: "meteorMark", x: target.x, y: target.y, life: 0.68, max: 0.68, color: s.color });
    for (let i = 0; i < 4; i += 1) {
      projectiles.push({ type: "comet", x: target.x + rand(-130, 130), y: target.y - rand(260, 420), tx: target.x + rand(-45, 45), ty: target.y + rand(-28, 28), life: 0.56 + i * 0.08, max: 0.56 + i * 0.08, color: s.color });
    }
  }
  if (s.id === "blink" && target) {
    const targets = blinkTargets(player.x, player.y);
    if (targets.length > 0) {
      playSfx("ultimate");
      player.invuln = Math.max(player.invuln, 0.9);
      player.attackAnim = 0.58;
      player.castAnim = 0.34;
      hazards.push({
        type: "blinkDance",
        targets,
        index: 0,
        timer: 0.02,
        prevX: player.x,
        prevY: player.y,
        life: 1.05,
        max: 1.05,
        color: "#ffffff",
      });
      state.hitStop = Math.max(state.hitStop, 0.035);
      state.powerFlash = Math.max(state.powerFlash, 0.28);
      spawnSkillAura(player.x, player.y, "blink", 135, 0.75);
      state.comboText = "PHANTOM SLASH!";
      state.comboTime = 1;
    }
  }
  if (s.id === "thunder") {
    player.attackAnim = 0.5;
    player.castAnim = 0.52;
    spawnSkillAura(W / 2, H * 0.45, "thunder", 190, 0.95);
    hazards.push({ type: "thunderStorm", life: 1.15, max: 1.15, tick: 0, color: s.color, strikes: [] });
    for (let i = 0; i < 9; i += 1) {
      const x = rand(64, W - 64);
      const y = rand(150, H - 220);
      hazards.push({ type: "lightningStrike", x, y, life: 0.42 + i * 0.035, max: 0.42 + i * 0.035, color: s.color, delay: i * 0.045 });
    }
    state.powerFlash = Math.max(state.powerFlash, 0.42);
    state.shake = Math.max(state.shake, 16);
  }
  if (s.id === "inferno") {
    player.attackAnim = 0.5;
    player.castAnim = 0.55;
    spawnSkillAura(W / 2, H * 0.48, "inferno", 210, 1.1);
    hazards.push({ type: "infernoField", x: W / 2, y: H * 0.5, life: 1.45, max: 1.45, tick: 0, color: s.color });
    for (let i = 0; i < 7; i += 1) {
      hazards.push({ type: "flamePillar", x: rand(58, W - 58), y: rand(190, H - 180), life: 0.9 + i * 0.04, max: 0.9 + i * 0.04, color: s.color, delay: i * 0.06, scale: rand(0.75, 1.2) });
    }
    state.powerFlash = Math.max(state.powerFlash, 0.35);
    state.shake = Math.max(state.shake, 18);
  }
}

function update(dt) {
  state.t += dt;
  if (!Number.isFinite(state.hitStop)) state.hitStop = 0;
  if (state.hitStop > 0.25) state.hitStop = 0.25;
  if (state.hitStop > 0) {
    state.hitStop = Math.max(0, state.hitStop - dt);
    state.powerFlash = Math.max(0, state.powerFlash - dt * 1.8);
    state.shockwave = Math.max(0, state.shockwave - dt * 2.4);
    return;
  }
  if (particles.length > 600) particles.splice(0, particles.length - 600);
  if (hazards.length > 80) hazards.splice(0, hazards.length - 80);
  if (hits.length > 200) hits.splice(0, hits.length - 200);
  if (lootDrops.length > 120) lootDrops.splice(0, lootDrops.length - 120);
  if (projectiles.length > 80) projectiles.splice(0, projectiles.length - 80);
  state.messageTime = Math.max(0, state.messageTime - dt);
  state.stageIntro = Math.max(0, state.stageIntro - dt);
  state.comboTime = Math.max(0, state.comboTime - dt);
  state.shake = Math.max(0, state.shake - dt * 18);
  state.lootFlash = Math.max(0, state.lootFlash - dt);
  state.powerFlash = Math.max(0, state.powerFlash - dt * 1.8);
  state.shockwave = Math.max(0, state.shockwave - dt * 2.4);
  player.invuln = Math.max(0, player.invuln - dt);
  player.slashCd = Math.max(0, player.slashCd - dt);
  player.attackAnim = Math.max(0, player.attackAnim - dt);
  player.castAnim = Math.max(0, player.castAnim - dt);
  player.hurtAnim = Math.max(0, player.hurtAnim - dt);
  player.footstepTimer = Math.max(0, player.footstepTimer - dt);
  player.mp = Math.min(player.maxMp, player.mp + dt * 8);

  for (const s of skills) s.cd = Math.max(0, s.cd - dt);
  autoCastSkills(dt);

  player.isMoving = false;
  let moveX = input.moveX;
  let moveY = input.moveY;
  if (input.keys.has("arrowleft") || input.keys.has("a")) moveX -= 1;
  if (input.keys.has("arrowright") || input.keys.has("d")) moveX += 1;
  if (input.keys.has("arrowup") || input.keys.has("w")) moveY -= 1;
  if (input.keys.has("arrowdown") || input.keys.has("s")) moveY += 1;
  const moveLen = Math.hypot(moveX, moveY);
  if (moveLen > 0.05) {
    moveX /= moveLen;
    moveY /= moveLen;
    player.x += moveX * player.speed * dt;
    player.y += moveY * player.speed * dt;
    player.targetX = player.x;
    player.targetY = player.y;
    player.facing = Math.atan2(moveY, moveX);
    player.stepAnim += dt * 14;
    player.isMoving = true;
  } else {
    const dx = player.targetX - player.x;
    const dy = player.targetY - player.y;
    const md = Math.hypot(dx, dy);
    if (md > 2) {
      const step = Math.min(md, player.speed * dt);
      player.x += (dx / md) * step;
      player.y += (dy / md) * step;
      player.facing = Math.atan2(dy, dx);
      player.stepAnim += dt * 12;
      player.isMoving = true;
    }
  }
  if (player.isMoving && player.footstepTimer <= 0) {
    player.footstepTimer = 0.13;
    hazards.push({ type: "dust", x: player.x - Math.cos(player.facing) * 16 + rand(-5, 5), y: player.y - Math.sin(player.facing) * 10 + 22, life: 0.42, max: 0.42, color: "#d7c68b" });
  }
  player.x = clamp(player.x, 38, W - 38);
  player.y = clamp(player.y, 150, H - 135);

  if (!state.bossMode && state.kills > 0 && state.kills % 14 === 0 && !enemies.some((e) => e.kind === "boss")) {
    spawnBoss();
    state.kills += 1;
  }

  const maxRegular = state.bossMode ? 1 : Math.min(8, 3 + state.wave);
  if (!state.bossMode && enemies.length < maxRegular && Math.random() < dt * 1.55) {
    spawnEnemy(Math.random() < 0.18 ? "elite" : "shade");
  }

  const n = nearestEnemy();
  if (n.enemy && n.d < 92 && player.slashCd <= 0) {
    player.slashCd = 0.55;
    player.attackAnim = 0.46;
    player.facing = Math.atan2(n.enemy.y - player.y, n.enemy.x - player.x);
    damageEnemy(n.enemy, player.atk + rand(3, 9), "#fff3a3");
    hazards.push({ type: "slash", x: player.x, y: player.y, tx: n.enemy.x, ty: n.enemy.y, life: 0.24, color: "#fff3a3" });
  }

  for (const e of enemies) {
    e.hit = Math.max(0, e.hit - dt);
    e.attackAnim = Math.max(0, e.attackAnim - dt);
    e.pulse += dt;
    if (e.kind === "boss") {
      e.pattern -= dt;
      if (e.pattern <= 0) {
        e.pattern = rand(2.2, 3.5);
        hazards.push({ type: "danger", x: player.x + rand(-26, 26), y: player.y + rand(-26, 26), r: 18, maxR: 86, life: 1.1, armed: 0.65, color: "#ff3d4f" });
        addParticle(e.x, e.y, "#8eff65", 10, 0.8);
      }
    }
    const ddx = player.x - e.x;
    const ddy = player.y - e.y;
    const d = Math.hypot(ddx, ddy) || 1;
    const beforeX = e.x;
    const beforeY = e.y;
    e.x += (ddx / d) * e.speed * dt + e.knockX * dt;
    e.y += (ddy / d) * e.speed * dt + e.knockY * dt;
    e.moving = Math.hypot(e.x - beforeX, e.y - beforeY) > 0.25;
    if (e.moving) e.walkAnim += dt * (e.kind === "boss" ? 5.5 : 10);
    e.knockX *= Math.pow(0.035, dt);
    e.knockY *= Math.pow(0.035, dt);
    if (d < e.r + player.r + 4 && player.invuln <= 0) {
      player.hp -= e.atk;
      player.invuln = 0.55;
      player.hurtAnim = 0.38;
      e.attackAnim = 0.34;
      state.shake = 8;
      hits.push({ x: player.x, y: player.y - 24, vx: rand(-12, 12), vy: -86, text: `-${e.atk}`, life: 0.75, max: 0.75, color: "#ff7184", crit: false, spin: rand(-0.12, 0.12), playerHit: true });
      hazards.push({ type: "impact", x: player.x, y: player.y - 4, life: 0.32, max: 0.32, color: "#ff7184", crit: false });
      addParticle(player.x, player.y, "#ff7184", 12, 0.8);
    }
  }

  for (const h of hazards) {
    h.life -= dt;
    if (h.type === "rift") {
      h.tick -= dt;
      h.r = h.maxR * (1 - h.life / 1.1);
      if (h.tick <= 0) {
        h.tick = 0.18;
        for (const e of enemies) {
          if (dist(h.x, h.y, e.x, e.y) < h.maxR) damageEnemy(e, player.atk * 0.9 + rand(4, 11), h.color);
        }
      }
    }
    if (h.type === "storm") {
      h.tick -= dt;
      if (h.tick <= 0) {
        h.tick = 0.16;
        for (const e of enemiesInRange(h.x, h.y, 132)) {
          damageEnemy(e, player.atk * 0.86 + rand(5, 13), h.color, h.x, h.y);
        }
      }
    }
    if (h.type === "meteorMark" && h.life <= 0.14 && !h.done) {
      h.done = true;
      state.shake = Math.max(state.shake, 18);
      state.powerFlash = Math.max(state.powerFlash, 0.35);
      for (const e of enemiesInRange(h.x, h.y, 126)) {
        damageEnemy(e, player.atk * 3.8 + rand(18, 36), h.color, h.x, h.y - 200);
      }
      addParticle(h.x, h.y, h.color, 54, 1.6);
    }
    if (h.type === "ultimate") {
      h.tick -= dt;
      if (h.tick <= 0) {
        h.tick = 0.12;
        for (const e of enemiesInRange(h.x, h.y, 190)) {
          damageEnemy(e, player.atk * 1.5 + rand(8, 22), h.color, h.x, h.y);
        }
      }
    }
    if (h.type === "blinkDance") {
      h.timer -= dt;
      if (h.timer <= 0 && h.index < h.targets.length) {
        const target = h.targets[h.index];
        if (target && target.hp > 0) {
          const angle = Math.atan2(target.y - h.prevY, target.x - h.prevX);
          const nx = target.x - Math.cos(angle) * 28;
          const ny = target.y - Math.sin(angle) * 22;
          projectiles.push({ type: "ghost", x: player.x, y: player.y, life: 0.32, max: 0.32, color: "#ffffff", facing: player.facing });
          hazards.push({ type: "blinkLine", x1: h.prevX, y1: h.prevY - 24, x2: target.x, y2: target.y - 18, life: 0.36, max: 0.36, color: h.color });
          hazards.push({ type: "impact", x: target.x, y: target.y - target.r * 0.1, life: 0.36, max: 0.36, color: "#ffffff", crit: true, heavy: true });
          addParticle(target.x, target.y, "#ffffff", 28, 1.45);
          player.x = clamp(nx, 38, W - 38);
          player.y = clamp(ny, 150, H - 135);
          player.targetX = player.x;
          player.targetY = player.y;
          player.facing = angle;
          player.attackAnim = 0.46;
          damageEnemy(target, player.atk * 2.8 + rand(15, 32), "#ffffff", h.prevX, h.prevY);
          h.prevX = player.x;
          h.prevY = player.y;
          state.shake = Math.max(state.shake, 18);
          state.powerFlash = Math.max(state.powerFlash, 0.26);
        }
        h.index += 1;
        h.timer = 0.085;
      }
    }
    if (h.type === "thunderStorm") {
      h.tick -= dt;
      if (h.tick <= 0) {
        h.tick = 0.16;
        for (const e of enemies) damageEnemy(e, player.atk * 1.1 + rand(8, 18), h.color, e.x, e.y - 220);
      }
    }
    if (h.type === "infernoField") {
      h.tick -= dt;
      if (h.tick <= 0) {
        h.tick = 0.2;
        for (const e of enemies) damageEnemy(e, player.atk * 1.25 + rand(10, 24), h.color, h.x, h.y);
      }
    }
    if (h.type === "danger") {
      h.r = h.maxR * (1 - h.life / 1.1);
      if (h.life < h.armed && !h.done) {
        h.done = true;
        addParticle(h.x, h.y, "#ff475c", 30, 1.2);
        if (dist(player.x, player.y, h.x, h.y) < h.maxR && player.invuln <= 0) {
          player.hp -= 26 + state.wave * 2;
          player.invuln = 0.75;
          state.shake = 12;
        }
      }
    }
  }

  for (const p of particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.92;
    p.vy *= 0.92;
  }
  for (const p of projectiles) {
    p.life -= dt;
    if (p.type === "lance") {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    if (p.type === "orb") {
      const k = 1 - p.life / p.max;
      p.x += (p.tx - p.x) * dt * 8;
      p.y += (p.ty - p.y) * dt * 8;
      p.spin = k * Math.PI * 4;
    }
    if (p.type === "comet") {
      p.x += (p.tx - p.x) * dt * 7;
      p.y += (p.ty - p.y) * dt * 7;
      p.spin = (p.spin || 0) + dt * 12;
    }
    if (p.type === "blade") {
      p.angle += dt * 9;
      p.radius += dt * 80;
    }
    if (p.type === "ghost") {
      p.y -= dt * 18;
    }
  }
  for (const h of hits) {
    h.life -= dt;
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.vy += 95 * dt;
  }
  for (const p of pickups) {
    p.life -= dt;
    p.x += (player.x - p.x) * dt * 2.7;
    p.y += (player.y - p.y) * dt * 2.7;
  }
  for (const loot of lootDrops) {
    loot.age += dt;
    loot.life -= dt;
    if (!loot.picked) {
      loot.vy += 360 * dt;
      loot.vx *= Math.pow(0.12, dt);
      loot.vy *= Math.pow(0.55, dt);
      loot.x += loot.vx * dt;
      loot.y += loot.vy * dt;
      if (loot.y > H - 128) {
        loot.y = H - 128;
        loot.vy *= -0.32;
      }
      if (loot.age > 0.45 || dist(loot.x, loot.y, player.x, player.y) < 90) loot.picked = true;
    } else {
      loot.x += (player.x - loot.x) * dt * 8.5;
      loot.y += (player.y - 24 - loot.y) * dt * 8.5;
      loot.scale *= Math.pow(0.58, dt);
      if (dist(loot.x, loot.y, player.x, player.y - 24) < 20) {
        loot.life = 0;
        if (loot.icon === 0) state.gold += loot.value;
        else {
          state.gold += Math.floor(loot.value * 0.5);
          state.comboText = loot.icon === 3 ? "EPIC LOOT!" : "ITEM DROP!";
          state.comboTime = 0.9;
        }
        playSfx(loot.icon === 0 ? "hit" : "spell");
      }
    }
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) if (enemies[i].hp <= 0) enemies.splice(i, 1);
  for (let i = hazards.length - 1; i >= 0; i -= 1) if (hazards[i].life <= 0) hazards.splice(i, 1);
  for (let i = particles.length - 1; i >= 0; i -= 1) if (particles[i].life <= 0) particles.splice(i, 1);
  for (let i = hits.length - 1; i >= 0; i -= 1) if (hits[i].life <= 0) hits.splice(i, 1);
  for (let i = pickups.length - 1; i >= 0; i -= 1) if (pickups[i].life <= 0) pickups.splice(i, 1);
  for (let i = lootDrops.length - 1; i >= 0; i -= 1) if (lootDrops[i].life <= 0) lootDrops.splice(i, 1);
  for (let i = projectiles.length - 1; i >= 0; i -= 1) if (projectiles[i].life <= 0) projectiles.splice(i, 1);

  levelUp();

  if (player.hp <= 0) {
    state.message = "TAP TO REVIVE";
    state.messageTime = 9;
    player.hp = 0;
  }
}

function drawBar(x, y, w, h, v, max, fill, back = "rgba(0,0,0,.45)") {
  ctx.fillStyle = back;
  roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fill;
  roundRect(x, y, Math.max(h, w * clamp(v / max, 0, 1)), h, h / 2);
  ctx.fill();
}

function drawAtlas(img, index, frameW, frameH, x, y, w, h) {
  if (!img.complete || img.naturalWidth <= 0) return false;
  if ((index + 1) * frameW > img.naturalWidth) return false;
  const sx = index * frameW + SPRITE_BLEED;
  const sy = SPRITE_BLEED;
  const sw = frameW - SPRITE_BLEED * 2;
  const sh = frameH - SPRITE_BLEED * 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  return true;
}

function drawProceduralRune(radius, palette, alpha = 1) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 3; i += 1) {
    ctx.strokeStyle = palette[i % palette.length];
    ctx.lineWidth = 2 + i;
    ctx.shadowBlur = 14;
    ctx.shadowColor = palette[i % palette.length];
    ctx.beginPath();
    ctx.arc(0, 0, radius * (0.42 + i * 0.22), i * 0.8 + state.t, Math.PI * 1.55 + i * 0.8 + state.t * 0.4);
    ctx.stroke();
  }
  for (let i = 0; i < 12; i += 1) {
    const a = (Math.PI * 2 * i) / 12 + state.t * 0.7;
    const inner = radius * 0.38;
    const outer = radius * 0.78;
    ctx.strokeStyle = palette[(i + 1) % palette.length];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner * 0.72);
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer * 0.72);
    ctx.stroke();
  }
  ctx.restore();
}

function effectPalette(type, fallback = "#ffffff") {
  if (type === "beam" || type === "lance") return skillPalettes.lance;
  if (type === "rift") return skillPalettes.rift;
  if (type === "storm") return skillPalettes.storm;
  if (type === "meteorMark" || type === "flamePillar" || type === "infernoField") return skillPalettes.inferno;
  if (type === "ultimate") return skillPalettes.ultimate;
  if (type === "lightningStrike" || type === "thunderStorm") return skillPalettes.thunder;
  if (type === "blinkLine") return skillPalettes.blink;
  return [fallback, "#ffffff", "#ffd965", "#57dfff"];
}

function strokeMultiArc(cx, cy, radius, start, end, palette, width, alpha = 1) {
  palette.forEach((color, i) => {
    ctx.save();
    ctx.globalAlpha = alpha * (1 - i * 0.13);
    ctx.strokeStyle = color;
    ctx.shadowBlur = 18 + i * 4;
    ctx.shadowColor = color;
    ctx.lineWidth = Math.max(1, width - i * 2);
    ctx.beginPath();
    ctx.arc(cx, cy, radius + i * 6, start + i * 0.08, end + i * 0.08);
    ctx.stroke();
    ctx.restore();
  });
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground() {
  const stage = currentStage();
  const img = stage.image;
  const blur = Math.min(4, state.powerFlash * 3 + state.shockwave * 1.6 + (player.attackAnim > 0 ? 0.8 : 0));
  ctx.save();
  if (blur > 0.08) ctx.filter = `blur(${blur}px) saturate(${1 + blur * 0.08})`;
  if (img.complete) {
    const scale = Math.max(W / img.width, H / img.height);
    const bw = img.width * scale;
    const bh = img.height * scale;
    ctx.drawImage(img, (W - bw) / 2, (H - bh) / 2, bw, bh);
  } else {
    ctx.fillStyle = "#0c1e16";
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
  ctx.fillStyle = stage.tint;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(4, 12, 8, .54)");
  g.addColorStop(0.45, "rgba(0, 0, 0, 0)");
  g.addColorStop(1, "rgba(2, 5, 4, .7)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawEntity(e) {
  const boss = e.kind === "boss";
  const sprite = sprites[e.kind] || sprites.shade;
  const sheet = boss ? sprites.bossSheet : e.kind === "elite" ? sprites.eliteSheet : sprites.shadeSheet;
  const size = boss ? 172 : e.kind === "elite" ? 74 : 55;
  const stage = currentStage();
  ctx.save();
  const bob = Math.sin(e.pulse * (boss ? 2.1 : 6.2)) * (boss ? 4 : 3);
  const hitJerk = e.hit > 0 ? Math.sin(e.hit * 55) * 6 : 0;
  const lunge = e.attackAnim > 0 ? Math.sin((1 - e.attackAnim / 0.34) * Math.PI) * 10 : 0;
  const face = Math.atan2(player.y - e.y, player.x - e.x);
  ctx.translate(e.x + Math.cos(face) * lunge + hitJerk, e.y + bob + Math.sin(face) * lunge);
  ctx.globalAlpha = e.hit > 0 ? 0.82 : 1;
  ctx.shadowBlur = boss ? 32 : 16;
  ctx.shadowColor = boss ? stage.enemyColor : e.kind === "elite" ? "#d66bff" : stage.enemyColor;
  const hurtSquash = e.hit > 0 ? Math.sin(e.hit * 35) * 0.12 : 0;
  const pulse = Math.sin(e.pulse * 5) * 0.05 + 1 + (e.attackAnim > 0 ? 0.08 : 0);
  ctx.rotate((boss ? 0.035 : 0.08) * Math.sin(e.pulse * 4) + (e.hit > 0 ? 0.12 * Math.sin(e.hit * 80) : 0));
  ctx.scale(pulse + hurtSquash, pulse - hurtSquash * 0.6);
  ctx.fillStyle = boss ? "rgba(20, 54, 27, .46)" : "rgba(0, 0, 0, .32)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.27, size * 0.34, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  if (e.attackAnim > 0) {
    const phase = 1 - e.attackAnim / 0.34;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = Math.sin(phase * Math.PI) * 0.8;
    ctx.rotate(-0.2);
    ctx.strokeStyle = boss ? stage.enemyColor : "#ff7184";
    ctx.shadowBlur = 18;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.lineWidth = boss ? 9 : 5;
    ctx.beginPath();
    ctx.arc(18, -4, boss ? 76 : 34, -0.75, 0.55);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = boss ? 3 : 2;
    ctx.beginPath();
    ctx.arc(18, -4, boss ? 76 : 34, -0.55, 0.38);
    ctx.stroke();
    ctx.restore();
  }
  const stageTint = state.stageIndex > 0
    ? stage.tint.replace(".16", ".24").replace(".18", ".24").replace(".10", ".18")
    : null;
  const hitTint = e.hit > 0 ? "rgba(255, 247, 185, .55)" : null;
  const tints = [stageTint, hitTint].filter(Boolean);
  if (sheet && sheet.complete && sheet.naturalWidth > 0) {
    let action = "idle";
    if (e.hit > 0) action = "hurt";
    else if (e.attackAnim > 0) action = "attack";
    else if (e.moving) action = "walk";
    const frame =
      action === "hurt"
        ? Math.min(5, Math.floor((1 - e.hit / 0.42) * 6))
        : action === "attack"
          ? Math.min(5, Math.floor((1 - e.attackAnim / 0.34) * 6))
          : action === "walk"
            ? Math.floor(e.walkAnim) % 6
            : Math.floor(e.pulse * 3) % 6;
    const sx = frame * enemySheet.frameW + SPRITE_BLEED;
    const sy = enemySheet.rows[action] * enemySheet.frameH + SPRITE_BLEED;
    const sw = enemySheet.frameW - SPRITE_BLEED * 2;
    const sh = enemySheet.frameH - SPRITE_BLEED * 2;
    drawSheetFrameTinted(sheet, sx, sy, sw, sh, -size / 2, -size * 0.72, size, size, tints);
  } else if (sprite.complete && sprite.naturalWidth > 0) {
    drawSpriteTinted(sprite, -size / 2, -size * 0.72, size, size, tints);
  } else {
    ctx.fillStyle = boss ? "#173d28" : e.kind === "elite" ? "#52305e" : "#332a22";
    ctx.strokeStyle = e.hit > 0 ? "#fff6b0" : boss ? "#9aff70" : "#ffd76b";
    ctx.lineWidth = boss ? 4 : 2;
    ctx.beginPath();
    ctx.arc(0, 0, e.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
  drawBar(e.x - e.r, e.y - e.r - 14, e.r * 2, 5, e.hp, e.maxHp, boss ? "#8eff65" : "#f3b75f");
}

function drawSpriteCutout(sprite, size, tint = null) {
  if (sprite.complete && sprite.naturalWidth > 0) {
    if (tint) {
      drawSpriteTinted(sprite, -size / 2, -size * 0.76, size, size, [tint]);
    } else {
      ctx.drawImage(sprite, -size / 2, -size * 0.76, size, size);
    }
  } else {
    ctx.fillStyle = "#1d2d59";
    ctx.beginPath();
    ctx.arc(0, 0, player.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function playerActionFrame() {
  if (player.hurtAnim > 0) {
    return { action: "hurt", frame: Math.min(5, Math.floor((1 - player.hurtAnim / 0.38) * 6)) };
  }
  if (player.attackAnim > 0) {
    return { action: "attack", frame: Math.min(5, Math.floor((1 - player.attackAnim / 0.46) * 6)) };
  }
  if (player.castAnim > 0) {
    return { action: "cast", frame: Math.min(5, Math.floor((1 - player.castAnim / 0.48) * 6)) };
  }
  if (player.isMoving) {
    return { action: "walk", frame: Math.floor(player.stepAnim * 0.72) % 6 };
  }
  return { action: "idle", frame: Math.floor(state.t * 5) % 6 };
}

function drawPlayerSheetFrame(size, tint = null) {
  const sheet = sprites.playerSheet;
  if (!sheet.complete || sheet.naturalWidth <= 0) {
    drawSpriteCutout(sprites.player, size * 0.82, tint);
    return;
  }
  const anim = playerActionFrame();
  const sx = anim.frame * playerSheet.frameW + SPRITE_BLEED;
  const sy = playerSheet.rows[anim.action] * playerSheet.frameH + SPRITE_BLEED;
  const sw = playerSheet.frameW - SPRITE_BLEED * 2;
  const sh = playerSheet.frameH - SPRITE_BLEED * 2;
  if (tint) {
    drawSheetFrameTinted(sheet, sx, sy, sw, sh, -size / 2, -size * 0.76, size, size, [tint]);
  } else {
    ctx.drawImage(sheet, sx, sy, sw, sh, -size / 2, -size * 0.76, size, size);
  }
}

function drawSwordSwing(phase) {
  const eased = phase < 0.5 ? 2 * phase * phase : 1 - Math.pow(-2 * phase + 2, 2) / 2;
  const alpha = Math.sin(phase * Math.PI);
  const sweepStart = -1.35;
  const sweepEnd = 1.08;
  const bladeAngle = sweepStart + (sweepEnd - sweepStart) * eased;
  const baseRotation = player.facing + Math.PI / 2;

  ctx.save();
  ctx.rotate(baseRotation);
  ctx.globalCompositeOperation = "lighter";
  ctx.save();
  ctx.filter = "blur(9px)";
  ctx.globalAlpha = alpha * 0.34;
  ctx.fillStyle = "rgba(103, 231, 255, .58)";
  ctx.beginPath();
  ctx.ellipse(28, 8, 148, 64, bladeAngle * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const coreGradient = ctx.createRadialGradient(20, 4, 4, 20, 4, 132);
  coreGradient.addColorStop(0, `rgba(255, 255, 255, ${1.0 * alpha})`);
  coreGradient.addColorStop(0.24, `rgba(109, 238, 255, ${0.78 * alpha})`);
  coreGradient.addColorStop(0.55, `rgba(255, 226, 75, ${0.56 * alpha})`);
  coreGradient.addColorStop(0.82, `rgba(155, 73, 255, ${0.25 * alpha})`);
  coreGradient.addColorStop(1, "rgba(255, 120, 45, 0)");

  ctx.save();
  ctx.globalAlpha = clamp(alpha * 0.72, 0, 0.72);
  ctx.shadowBlur = 54;
  ctx.shadowColor = "#61e7ff";
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.ellipse(20, 4, 128, 54, bladeAngle * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Pseudo-3D energy ribbon: a thick curved surface with bright front edge and darker back edge.
  const ribbonPoints = [];
  for (let i = 0; i <= 18; i += 1) {
    const t = i / 18;
    const a = sweepStart + (bladeAngle - sweepStart) * t;
    const perspective = 0.7 + t * 0.55;
    const r = 64 + 48 * perspective + Math.sin(t * Math.PI) * 16;
    ribbonPoints.push({
      x: Math.cos(a) * r + t * 16,
      y: Math.sin(a) * r * (0.74 + t * 0.18) + 4,
      nx: Math.cos(a + Math.PI / 2),
      ny: Math.sin(a + Math.PI / 2),
      w: (34 + 32 * t) * alpha,
      t,
    });
  }
  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.shadowBlur = 46;
  ctx.shadowColor = "#8ff7ff";
  const ribbonGradient = ctx.createLinearGradient(-82, -80, 128, 98);
  ribbonGradient.addColorStop(0, "rgba(59, 220, 255, .18)");
  ribbonGradient.addColorStop(0.32, "rgba(255, 255, 255, .72)");
  ribbonGradient.addColorStop(0.58, "rgba(255, 224, 76, .62)");
  ribbonGradient.addColorStop(1, "rgba(138, 75, 255, .18)");
  ctx.fillStyle = ribbonGradient;
  ctx.beginPath();
  ribbonPoints.forEach((p, i) => {
    const x = p.x + p.nx * p.w;
    const y = p.y + p.ny * p.w * 0.42;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  for (let i = ribbonPoints.length - 1; i >= 0; i -= 1) {
    const p = ribbonPoints[i];
    ctx.lineTo(p.x - p.nx * p.w * 0.42, p.y - p.ny * p.w * 0.22);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.7)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = clamp(alpha * 0.75, 0, 0.75);
  ctx.strokeStyle = "rgba(65, 237, 255, .55)";
  ctx.lineWidth = 7;
  ctx.shadowBlur = 24;
  ctx.shadowColor = "#34e9ff";
  ctx.beginPath();
  ribbonPoints.forEach((p, i) => {
    const x = p.x + p.nx * p.w * 0.82;
    const y = p.y + p.ny * p.w * 0.34;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < 7; i += 1) {
    const trailPhase = clamp(eased - i * 0.07, 0, 1);
    const a = sweepStart + (sweepEnd - sweepStart) * trailPhase;
    const depth = 1 - i / 7;
    const radius = 88 - i * 6;
    ctx.save();
    ctx.globalAlpha = clamp(alpha * (0.82 - i * 0.07), 0, 0.82);
    ctx.shadowBlur = 26 + depth * 32;
    ctx.shadowColor = i < 2 ? "#ffffff" : i < 5 ? "#ffe070" : "#4ee8ff";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = i < 2 ? "rgba(255,255,255,.86)" : i < 5 ? "rgba(255,218,72,.55)" : "rgba(67,230,255,.38)";
    ctx.lineWidth = 28 * depth + 3;
    ctx.beginPath();
    ctx.arc(9 + i * 1.5, 7 + i * 0.8, radius, a - 0.18 - depth * 0.16, a + 0.26 + depth * 0.08);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = clamp(alpha * 0.95, 0, 0.95);
  ctx.strokeStyle = "rgba(255, 255, 255, .92)";
  ctx.lineWidth = 5;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#ffffff";
  ctx.beginPath();
  ctx.arc(7, 6, 96, bladeAngle - 0.16, bladeAngle + 0.23);
  ctx.stroke();
  ctx.restore();

  const handX = Math.cos(bladeAngle) * 20;
  const handY = Math.sin(bladeAngle) * 20 + 2;
  const tipX = Math.cos(bladeAngle) * 124;
  const tipY = Math.sin(bladeAngle) * 110 + 2;
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.shadowBlur = 26;
  ctx.shadowColor = "#8df5ff";
  ctx.strokeStyle = "rgba(255, 255, 255, .95)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  ctx.strokeStyle = "rgba(89, 224, 255, .86)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  for (let i = 0; i < 18; i += 1) {
    const sparkPhase = clamp(eased - i * 0.045, 0, 1);
    const a = sweepStart + (sweepEnd - sweepStart) * sparkPhase + Math.sin(i * 3.7) * 0.16;
    const r = 70 + (i % 6) * 13 + Math.sin(i) * 9;
    const x = Math.cos(a) * r + i * 0.7;
    const y = Math.sin(a) * r * 0.88 + 2;
    const len = 8 + (i % 4) * 6;
    ctx.save();
    ctx.globalAlpha = clamp(alpha * (0.9 - i * 0.035), 0, 0.9);
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);
    ctx.shadowBlur = 10;
    ctx.shadowColor = i % 3 === 0 ? "#ffffff" : "#65eaff";
    ctx.fillStyle = i % 3 === 0 ? "#ffffff" : i % 2 === 0 ? "#fff3a3" : "#76ecff";
    ctx.beginPath();
    ctx.moveTo(0, -len);
    ctx.lineTo(3, 0);
    ctx.lineTo(0, len);
    ctx.lineTo(-3, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = clamp(alpha * 0.42, 0, 0.42);
  ctx.strokeStyle = "rgba(160, 91, 255, .48)";
  ctx.lineWidth = 18;
  ctx.shadowBlur = 36;
  ctx.shadowColor = "#a05bff";
  ctx.beginPath();
  ctx.arc(5, 8, 118 + alpha * 14, bladeAngle - 0.6, bladeAngle + 0.72);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(255, 245, 150, .98)";
  ctx.beginPath();
  ctx.arc(tipX, tipY, 10 + alpha * 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  const size = 104;
  ctx.save();
  const moving = player.isMoving;
  const walkFrame = Math.sin(player.stepAnim);
  const walkBob = moving ? Math.abs(walkFrame) * -7 : Math.sin(state.t * 4) * 1.5;
  const attackPhase = player.attackAnim > 0 ? clamp(1 - player.attackAnim / 0.46, 0, 1) : 0;
  const slashPush = player.attackAnim > 0 ? Math.sin(attackPhase * Math.PI) * 30 : 0;
  const castLift = player.castAnim > 0 ? Math.sin((1 - player.castAnim / 0.48) * Math.PI) * -8 : 0;
  const hurtShake = player.hurtAnim > 0 ? Math.sin(player.hurtAnim * 95) * 8 : 0;
  ctx.translate(player.x + Math.cos(player.facing) * slashPush + hurtShake, player.y + walkBob + castLift + Math.sin(player.facing) * slashPush);
  const blink = player.invuln > 0 && Math.floor(state.t * 18) % 2 === 0;
  ctx.globalAlpha = blink ? 0.5 : 1;
  ctx.shadowBlur = 24;
  ctx.shadowColor = "#ffe66e";
  if (player.castAnim > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(player.castAnim / 0.48, 0, 1) * 0.9;
    ctx.strokeStyle = player.castColor;
    ctx.lineWidth = 3;
    ctx.rotate(state.t * 5);
    ctx.beginPath();
    ctx.arc(0, 4, 43, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = "rgba(0, 0, 0, .32)";
  ctx.beginPath();
  ctx.ellipse(0, 22, 25, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 232, 112, .78)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 4, 30 + Math.sin(state.t * 5) * 2, 0, Math.PI * 2);
  ctx.stroke();
  if (player.attackAnim > 0) {
    ctx.save();
    ctx.globalAlpha = 0.3 * Math.sin(attackPhase * Math.PI);
    ctx.translate(-Math.cos(player.facing) * 20, -Math.sin(player.facing) * 20);
    ctx.rotate(-0.28);
    drawPlayerSheetFrame(size, "rgba(97, 223, 255, .35)");
    ctx.restore();
  }
  if (player.hurtAnim > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(player.hurtAnim / 0.38, 0, 1);
    ctx.strokeStyle = "#ff5268";
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i += 1) {
      const a = (Math.PI * 2 * i) / 6 + state.t * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30);
      ctx.lineTo(Math.cos(a) * 48, Math.sin(a) * 48);
      ctx.stroke();
    }
    ctx.restore();
  }
  const attackLean = player.attackAnim > 0 ? 0.42 * Math.sin(attackPhase * Math.PI) : 0;
  const castScale = player.castAnim > 0 ? 1 + Math.sin((1 - player.castAnim / 0.48) * Math.PI) * 0.12 : 1;
  const hurtSquash = player.hurtAnim > 0 ? Math.sin(player.hurtAnim * 34) * 0.18 : 0;
  ctx.rotate(walkFrame * (moving ? 0.12 : 0.02) + attackLean);
  ctx.scale((1 + Math.abs(walkFrame) * (moving ? 0.04 : 0)) * castScale + hurtSquash, (1 - Math.abs(walkFrame) * (moving ? 0.05 : 0)) * castScale - hurtSquash * 0.35);
  const tint = player.hurtAnim > 0 ? "rgba(255, 70, 85, .45)" : player.castAnim > 0 ? "rgba(255, 236, 143, .22)" : null;
  drawPlayerSheetFrame(size, tint);
  if (player.attackAnim > 0) drawSwordSwing(attackPhase);
  ctx.restore();
}

function drawHazard(h) {
  ctx.save();
  if (h.type === "friendlyRing") {
    ctx.globalAlpha = clamp(h.life / 0.42, 0, 1);
    ctx.strokeStyle = h.color;
    ctx.lineWidth = 5;
    ctx.shadowBlur = 24;
    ctx.shadowColor = h.color;
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.maxR * (1 - h.life / 0.42), 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.maxR * 0.55 * (1 - h.life / 0.42), 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(state.t * 2);
    drawProceduralRune(92, [h.color, "#ffffff", "#ffd965"], clamp(h.life / 0.42, 0, 1) * 0.52);
    ctx.restore();
  }
  if (h.type === "skillAura") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    const main = h.palette[0] || "#ffd965";
    const accent = h.palette[1] || "#ffffff";
    const deep = h.palette[2] || main;
    const radius = h.radius * (0.55 + p * 0.55);
    ctx.translate(h.x, h.y);
    ctx.globalCompositeOperation = "lighter";

    ctx.globalAlpha = a * 0.6;
    const gOuter = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.45);
    gOuter.addColorStop(0, hexAlpha(accent, 0.9));
    gOuter.addColorStop(0.3, hexAlpha(main, 0.7));
    gOuter.addColorStop(0.7, hexAlpha(deep, 0.25));
    gOuter.addColorStop(1, hexAlpha(main, 0));
    ctx.fillStyle = gOuter;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.45, radius * 0.98, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = a;
    const gCore = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.55);
    gCore.addColorStop(0, "rgba(255,255,255,1)");
    gCore.addColorStop(0.4, hexAlpha(accent, 0.85));
    gCore.addColorStop(1, hexAlpha(main, 0));
    ctx.fillStyle = gCore;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(state.t * (1.4 + h.spin));
    ctx.fillStyle = hexAlpha(accent, 0.55);
    ctx.globalAlpha = a * 0.7;
    const rayCount = 6;
    const rayInner = radius * 0.3;
    for (let i = 0; i < rayCount; i += 1) {
      const angle = (Math.PI * 2 * i) / rayCount;
      const rayLen = radius * (1.05 + Math.sin(state.t * 3.5 + i) * 0.18);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const px = -sin * 5;
      const py = cos * 5;
      ctx.beginPath();
      ctx.moveTo(cos * rayInner + px, sin * rayInner + py);
      ctx.lineTo(cos * rayLen, sin * rayLen);
      ctx.lineTo(cos * rayInner - px, sin * rayInner - py);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.globalAlpha = a * 0.95;
    ctx.fillStyle = hexAlpha(accent, 0.95);
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i += 1) {
      const angle = (Math.PI * 2 * i) / sparkCount - state.t * 2.4;
      const orbit = radius * (0.92 + Math.sin(state.t * 4.2 + i) * 0.08);
      const sx = Math.cos(angle) * orbit;
      const sy = Math.sin(angle) * orbit * 0.68;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (h.type === "beam") {
    ctx.globalAlpha = clamp(h.life / 0.28, 0, 1);
    ctx.globalCompositeOperation = "lighter";
    const palette = effectPalette("beam", h.color);
    const ex = h.x + Math.cos(h.angle) * 460;
    const ey = h.y + Math.sin(h.angle) * 460;
    palette.forEach((color, i) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 22 - i * 4;
      ctx.shadowBlur = 28;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.moveTo(h.x + Math.sin(h.angle) * i * 3, h.y - Math.cos(h.angle) * i * 3);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    });
  }
  if (h.type === "rift") {
    ctx.globalAlpha = clamp(h.life, 0, 1) * 0.7;
    const palette = effectPalette("rift", h.color);
    const g = ctx.createRadialGradient(h.x, h.y, 4, h.x, h.y, h.maxR);
    g.addColorStop(0, "rgba(255,255,255,.38)");
    g.addColorStop(0.35, "rgba(255,125,242,.24)");
    g.addColorStop(0.7, "rgba(115,56,255,.18)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.maxR, 0, Math.PI * 2);
    ctx.fill();
    strokeMultiArc(h.x, h.y, h.maxR * 0.72, state.t * 1.8, Math.PI * 1.65 + state.t * 1.8, palette, 7, 0.85);
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(-state.t * 2.4);
    drawProceduralRune(h.maxR, [h.color, "#ffffff", "#7338ff"], clamp(h.life, 0, 1) * 0.58);
    ctx.restore();
  }
  if (h.type === "storm") {
    const p = 1 - h.life / h.max;
    const palette = effectPalette("storm", h.color);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = clamp(h.life / h.max, 0, 1) * 0.85;
    ctx.translate(h.x, h.y);
    ctx.rotate(state.t * 3.4);
    ctx.shadowBlur = 32;
    for (let i = 0; i < 5; i += 1) {
      ctx.strokeStyle = palette[i % palette.length];
      ctx.shadowColor = palette[i % palette.length];
      ctx.lineWidth = 5 - i * 0.45;
      ctx.beginPath();
      ctx.arc(0, 0, 48 + i * 18 + p * 28, i * 1.2, i * 1.2 + Math.PI * 0.9);
      ctx.stroke();
    }
    for (let i = 0; i < 7; i += 1) {
      const a = (Math.PI * 2 * i) / 7 + state.t * 5;
      ctx.strokeStyle = palette[i % palette.length];
      ctx.shadowColor = palette[(i + 1) % palette.length];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
      ctx.lineTo(Math.cos(a + 0.2) * 118, Math.sin(a + 0.2) * 118);
      ctx.stroke();
    }
    ctx.globalAlpha = clamp(h.life / h.max, 0, 1) * 0.45;
    ctx.rotate(-state.t * 4.1);
    drawProceduralRune(110, palette, 0.62);
  }
  if (h.type === "meteorMark") {
    const p = 1 - h.life / h.max;
    const palette = effectPalette("meteorMark", h.color);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = clamp(h.life / h.max, 0, 1);
    ctx.shadowBlur = 28;
    strokeMultiArc(h.x, h.y, 28 + p * 88, 0, Math.PI * 2, palette, 8, 0.95);
    strokeMultiArc(h.x, h.y, 70 - p * 46, 0, Math.PI * 2, palette.slice().reverse(), 4, 0.75);
  }
  if (h.type === "ultimate") {
    const p = 1 - h.life / h.max;
    const palette = effectPalette("ultimate", h.color);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = clamp(h.life / h.max, 0, 1);
    ctx.translate(h.x, h.y);
    ctx.rotate(state.t * 1.8);
    ctx.shadowBlur = 54;
    for (let i = 0; i < 4; i += 1) {
      ctx.strokeStyle = palette[i % palette.length];
      ctx.shadowColor = palette[(i + 1) % palette.length];
      ctx.lineWidth = 8 - i;
      ctx.beginPath();
      ctx.arc(0, 0, 70 + i * 34 + p * 55, i * 0.8, Math.PI * 2 - i * 0.45);
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 150 + p * 80);
    g.addColorStop(0, `rgba(255,255,255,${0.35 + p * 0.2})`);
    g.addColorStop(0.32, `rgba(255,217,101,${0.26})`);
    g.addColorStop(0.56, `rgba(87,223,255,${0.22})`);
    g.addColorStop(0.8, `rgba(214,107,255,${0.2})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 46 + p * 90, 0, Math.PI * 2);
    ctx.fill();
  }
  if (h.type === "danger") {
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = h.done ? "rgba(255, 42, 64, .36)" : "rgba(255, 42, 64, .14)";
    ctx.strokeStyle = "#ff5a66";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.maxR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (h.type === "slash") {
    ctx.globalAlpha = clamp(h.life / 0.18, 0, 1);
    const angle = Math.atan2(h.ty - h.y, h.tx - h.x);
    ctx.translate(h.tx, h.ty);
    ctx.rotate(angle);
    ctx.strokeStyle = h.color;
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.shadowBlur = 26;
    ctx.shadowColor = h.color;
    ctx.beginPath();
    ctx.arc(-20, 0, 48, -0.95, 0.82);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-20, 0, 48, -0.72, 0.6);
    ctx.stroke();
  }
  if (h.type === "dust") {
    ctx.globalAlpha = clamp(h.life / h.max, 0, 1) * 0.38;
    ctx.fillStyle = h.color;
    const r = 18 * (1 - h.life / h.max) + 4;
    ctx.beginPath();
    ctx.ellipse(h.x, h.y, r, r * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (h.type === "impact") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    const radius = (h.crit ? 58 : 36) * p + 8;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a;
    ctx.shadowBlur = h.crit ? 34 : 20;
    ctx.shadowColor = h.color;
    ctx.strokeStyle = h.crit ? "#ffffff" : h.color;
    ctx.lineWidth = h.crit ? 7 : 4;
    ctx.beginPath();
    ctx.arc(h.x, h.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = h.color;
    ctx.lineWidth = h.crit ? 3 : 2;
    for (let i = 0; i < (h.crit ? 12 : 7); i += 1) {
      const angle = (Math.PI * 2 * i) / (h.crit ? 12 : 7) + state.t * 0.8;
      const inner = radius * 0.42;
      const outer = radius * (h.crit ? 1.28 : 1.05);
      ctx.beginPath();
      ctx.moveTo(h.x + Math.cos(angle) * inner, h.y + Math.sin(angle) * inner);
      ctx.lineTo(h.x + Math.cos(angle) * outer, h.y + Math.sin(angle) * outer);
      ctx.stroke();
    }
  }
  if (h.type === "powerBurst") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(h.x, h.y);
    ctx.rotate(h.angle);
    ctx.globalAlpha = a;
    ctx.save();
    ctx.filter = "blur(8px)";
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.ellipse(45, 0, h.crit ? 96 : 62, h.crit ? 34 : 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = h.crit ? 42 : 28;
    ctx.shadowColor = h.color;

    const length = h.crit ? 128 : 88;
    const width = h.crit ? 56 : 38;
    const burstGradient = ctx.createLinearGradient(-18, 0, length, 0);
    burstGradient.addColorStop(0, "rgba(255,255,255,.9)");
    burstGradient.addColorStop(0.28, h.color);
    burstGradient.addColorStop(0.66, "rgba(255,226,78,.55)");
    burstGradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = burstGradient;
    ctx.beginPath();
    ctx.moveTo(-14, -width * 0.22);
    ctx.lineTo(length * (0.72 + p * 0.28), -width * (0.22 + p * 0.34));
    ctx.lineTo(length * (0.95 + p * 0.24), 0);
    ctx.lineTo(length * (0.72 + p * 0.28), width * (0.22 + p * 0.34));
    ctx.lineTo(-14, width * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = h.crit ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length * (1 + p * 0.22), 0);
    ctx.stroke();
  }
  if (h.type === "blinkLine") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    const angle = Math.atan2(h.y2 - h.y1, h.x2 - h.x1);
    const len = Math.hypot(h.x2 - h.x1, h.y2 - h.y1);
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(h.x1, h.y1);
    ctx.rotate(angle);
    ctx.globalAlpha = a;
    ctx.shadowBlur = 36;
    const palette = effectPalette("blinkLine", h.color);
    ctx.shadowColor = palette[1];
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.18, palette[1]);
    g.addColorStop(0.45, palette[0]);
    g.addColorStop(0.68, palette[2]);
    g.addColorStop(0.9, palette[3]);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 13 * a + 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(len * p * 0.15, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.strokeStyle = palette[3];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(len * 0.12, -10 * a);
    ctx.lineTo(len * 0.88, 10 * a);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(len * 0.12, 10 * a);
    ctx.lineTo(len * 0.88, -10 * a);
    ctx.stroke();
  }
  if (h.type === "lightningStrike") {
    const activeLife = h.life - (h.delay || 0);
    if (activeLife > 0) {
      const a = clamp(activeLife / h.max, 0, 1);
      const palette = effectPalette("lightningStrike", h.color);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = a;
      ctx.shadowBlur = 34;
      ctx.shadowColor = palette[1];
      if (sprites.elementFx.complete) {
        ctx.drawImage(sprites.elementFx, 0, 0, 256, 256, h.x - 42, h.y - 220, 84, 240);
      }
      palette.forEach((color, i) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 9 - i * 2;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.moveTo(h.x + i * 2, 70);
        ctx.lineTo(h.x + rand(-18, 18), h.y - 80);
        ctx.lineTo(h.x + rand(-26, 26), h.y);
        ctx.stroke();
      });
      ctx.strokeStyle = palette[2];
      ctx.lineWidth = 10;
      ctx.globalAlpha = a * 0.42;
      ctx.beginPath();
      ctx.arc(h.x, h.y, 28 + (1 - a) * 46, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (h.type === "thunderStorm") {
    const p = 1 - h.life / h.max;
    const palette = effectPalette("thunderStorm", h.color);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = clamp(h.life / h.max, 0, 1) * 0.45;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "rgba(115,245,255,.12)");
    bg.addColorStop(0.5, "rgba(41,125,255,.10)");
    bg.addColorStop(1, "rgba(255,242,110,.08)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i += 1) {
      const x = ((state.t * 190 + i * 83) % (W + 120)) - 60;
      ctx.strokeStyle = palette[i % palette.length];
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.sin(state.t * 6 + i) * 42, H);
      ctx.stroke();
    }
  }
  if (h.type === "flamePillar") {
    const activeLife = h.life - (h.delay || 0);
    if (activeLife > 0) {
      const a = clamp(activeLife / h.max, 0, 1);
      const palette = effectPalette("flamePillar", h.color);
      const scale = h.scale || 1;
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = a;
      ctx.shadowBlur = 38;
      ctx.shadowColor = palette[0];
      if (sprites.elementFx.complete) {
        ctx.drawImage(sprites.elementFx, 256, 0, 256, 256, h.x - 62 * scale, h.y - 140 * scale, 124 * scale, 170 * scale);
      }
      const g = ctx.createRadialGradient(h.x, h.y, 8, h.x, h.y, 88 * scale);
      g.addColorStop(0, `rgba(255,255,220,${a * 0.7})`);
      g.addColorStop(0.38, `rgba(255,92,36,${a * 0.52})`);
      g.addColorStop(0.68, `rgba(255,211,90,${a * 0.28})`);
      g.addColorStop(1, "rgba(255,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(h.x - 110, h.y - 110, 220, 220);
    }
  }
  if (h.type === "infernoField") {
    const p = 1 - h.life / h.max;
    const palette = effectPalette("infernoField", h.color);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = clamp(h.life / h.max, 0, 1) * 0.48;
    const bg = ctx.createRadialGradient(h.x, h.y, 10, h.x, h.y, 360);
    bg.addColorStop(0, "rgba(255,255,255,.18)");
    bg.addColorStop(0.3, "rgba(255,90,46,.22)");
    bg.addColorStop(0.58, "rgba(255,212,90,.12)");
    bg.addColorStop(1, "rgba(167,0,40,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.shadowBlur = 34;
    palette.forEach((color, i) => {
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.lineWidth = 10 - i * 2;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, 120 + p * 210 + i * 14, 38 + p * 92 + i * 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
  ctx.restore();
}

function drawProjectile(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
  ctx.shadowBlur = 24;
  ctx.shadowColor = p.color;
  if (p.type === "lance" || p.type === "comet" || p.type === "orb") {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = "blur(7px)";
    ctx.fillStyle = p.color;
    ctx.globalAlpha *= 0.34;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.type === "comet" ? 58 : 38, p.type === "comet" ? 18 : 14, p.angle || 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (p.type === "lance") {
    ctx.rotate(p.angle);
    const trail = 90 * (p.life / p.max);
    const g = ctx.createLinearGradient(-trail, 0, 26, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.45, p.color);
    g.addColorStop(1, "#ffffff");
    ctx.strokeStyle = g;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(-trail, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
  }
  if (p.type === "orb") {
    ctx.rotate(p.spin || 0);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 1.35);
    ctx.stroke();
  }
  if (p.type === "comet") {
    const k = 1 - p.life / p.max;
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const angle = Math.atan2(dy, dx);
    ctx.rotate(angle);
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 30;
    ctx.shadowColor = p.color;
    const g = ctx.createLinearGradient(-90, 0, 24, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.25, "#d66bff");
    g.addColorStop(0.48, p.color);
    g.addColorStop(0.76, "#ffffff");
    g.addColorStop(1, "#fff2a5");
    ctx.strokeStyle = g;
    ctx.lineWidth = 18 + k * 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-105, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(20, 0, 12 + k * 8, 0, Math.PI * 2);
    ctx.fill();
  }
  if (p.type === "blade") {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    const x = Math.cos(p.angle) * p.radius;
    const y = Math.sin(p.angle) * p.radius * 0.55;
    ctx.translate(x, y);
    ctx.rotate(p.angle + Math.PI / 2);
    ctx.shadowBlur = 20;
    ctx.shadowColor = p.color;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.quadraticCurveTo(18, 0, 0, 30);
    ctx.stroke();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 10;
    ctx.globalAlpha *= 0.55;
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.quadraticCurveTo(24, 0, 0, 32);
    ctx.stroke();
    ctx.strokeStyle = "#ffd965";
    ctx.lineWidth = 3;
    ctx.globalAlpha *= 0.9;
    ctx.beginPath();
    ctx.moveTo(-8, -22);
    ctx.quadraticCurveTo(12, 0, -8, 24);
    ctx.stroke();
  }
  if (p.type === "ghost") {
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1) * 0.45;
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 24;
    ctx.shadowColor = p.color;
    ctx.scale(1.04, 1.04);
    drawPlayerSheetFrame(104, "rgba(141,255,251,.55)");
  }
  ctx.restore();
}

function drawLootDrop(loot) {
  ctx.save();
  const bob = Math.sin(state.t * 8 + loot.spin) * 3;
  ctx.translate(loot.x, loot.y + bob);
  ctx.globalAlpha = clamp(loot.life, 0, 1);
  ctx.shadowBlur = loot.icon === 3 ? 24 : 14;
  ctx.shadowColor = loot.rarity;
  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath();
  ctx.ellipse(0, 18, 18 * loot.scale, 6 * loot.scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(Math.sin(state.t * 5 + loot.spin) * 0.18);
  ctx.scale(loot.scale, loot.scale);
  ctx.globalCompositeOperation = "source-over";
  if (!drawAtlas(sprites.lootIcons, loot.icon, 72, 72, -22, -28, 44, 44)) {
    ctx.fillStyle = loot.rarity;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  if (loot.icon !== 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = loot.rarity;
    ctx.lineWidth = 2;
    ctx.globalAlpha *= 0.75;
    ctx.beginPath();
    ctx.arc(0, -6, 27 + Math.sin(state.t * 6) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDamageNumber(h) {
  const p = 1 - h.life / h.max;
  const fade = clamp(h.life / h.max, 0, 1);
  const pop = p < 0.22 ? 0.35 + p / 0.22 * 0.9 : 1.25 - Math.min(0.25, (p - 0.22) * 0.42);
  const size = h.crit ? 40 : h.playerHit ? 23 : 28;
  const label = h.crit ? "POWER " : "";

  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.rotate(h.spin * fade);
  ctx.scale(pop, pop);
  ctx.globalAlpha = fade;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${size}px Segoe UI`;
  ctx.lineJoin = "round";
  ctx.shadowBlur = h.crit ? 18 : 10;
  ctx.shadowColor = h.crit ? "#fff5a8" : h.color;

  const text = `${label}${h.text}`;
  const grad = ctx.createLinearGradient(0, -size, 0, size);
  if (h.playerHit) {
    grad.addColorStop(0, "#ffe0e4");
    grad.addColorStop(0.48, "#ff5d76");
    grad.addColorStop(1, "#8d1028");
  } else if (h.crit) {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.28, "#fff4a6");
    grad.addColorStop(0.68, "#ff9e2f");
    grad.addColorStop(1, "#ff3d4f");
  } else {
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.38, h.color);
    grad.addColorStop(1, "#f6a83b");
  }

  ctx.strokeStyle = "rgba(26, 12, 6, .92)";
  ctx.lineWidth = h.crit ? 8 : 6;
  ctx.strokeText(text, 0, 0);
  ctx.strokeStyle = h.crit ? "rgba(255,255,255,.7)" : "rgba(255,245,180,.48)";
  ctx.lineWidth = h.crit ? 3 : 2;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = grad;
  ctx.fillText(text, 0, 0);

  if (h.crit) {
    ctx.globalAlpha = fade * 0.85;
    ctx.strokeStyle = "rgba(255,255,255,.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-72, -32);
    ctx.lineTo(-36, -32);
    ctx.moveTo(36, -32);
    ctx.lineTo(72, -32);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGamePanel() {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(0,0,0,.36)";
  ctx.fillRect(0, 0, W, H);
  const x = 28;
  const y = 150;
  const w = W - 56;
  const h = 560;
  if (sprites.uiPanel.complete) {
    ctx.drawImage(sprites.uiPanel, x, y, w, h);
  } else {
    ctx.fillStyle = "rgba(5,14,14,.92)";
    roundRect(x, y, w, h, 22);
    ctx.fill();
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 24px Segoe UI";
  ctx.fillText(state.panel === "inventory" ? "Inventory" : "Skill Codex", x + 34, y + 52);
  ctx.font = "800 12px Segoe UI";
  ctx.fillStyle = "#8dfffb";
  ctx.fillText(state.panel === "inventory" ? "Legend gear loadout" : "Auto battle rotation", x + 36, y + 76);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,.16)";
  roundRect(x + w - 54, y + 28, 30, 30, 8);
  ctx.fill();
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 18px Segoe UI";
  ctx.fillText("X", x + w - 39, y + 50);

  if (state.panel === "inventory") {
    inventoryItems.forEach((item, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const ix = x + 42 + col * 86;
      const iy = y + 126 + row * 118;
      ctx.fillStyle = "rgba(4,14,14,.7)";
      ctx.strokeStyle = item.rarity;
      ctx.lineWidth = 2;
      roundRect(ix, iy, 70, 70, 12);
      ctx.fill();
      ctx.stroke();
      drawAtlas(sprites.itemIcons, item.icon, 72, 72, ix + 7, iy + 7, 56, 56);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff5d7";
      ctx.font = "800 10px Segoe UI";
      ctx.fillText(item.name, ix + 35, iy + 89);
      ctx.fillStyle = item.rarity;
      ctx.fillText(item.power, ix + 35, iy + 104);
    });
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(141,255,251,.16)";
    roundRect(x + 36, y + 398, w - 72, 90, 16);
    ctx.fill();
    ctx.fillStyle = "#fff5d7";
    ctx.font = "900 16px Segoe UI";
    ctx.fillText("Set Bonus: Astral Rift", x + 54, y + 430);
    ctx.font = "700 13px Segoe UI";
    ctx.fillStyle = "#bdfbed";
    ctx.fillText("+35% skill damage   +18% cooldown rush   +1 overdrive burst", x + 54, y + 458);
  } else {
    skills.forEach((skill, i) => {
      const sx = x + 42;
      const sy = y + 118 + i * 76;
      ctx.fillStyle = "rgba(4,14,14,.72)";
      ctx.strokeStyle = skill.color;
      ctx.lineWidth = 2;
      roundRect(sx, sy, w - 84, 60, 14);
      ctx.fill();
      ctx.stroke();
      drawAtlas(sprites.skillIcons, i, 96, 96, sx + 10, sy + 8, 44, 44);
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff5d7";
      ctx.font = "900 15px Segoe UI";
      ctx.fillText(skill.name, sx + 68, sy + 25);
      ctx.fillStyle = "#bdfbed";
      ctx.font = "700 12px Segoe UI";
      ctx.fillText(`Auto cast / cooldown ${skill.maxCd.toFixed(1)}s / cost ${skill.cost}`, sx + 68, sy + 45);
      drawBar(sx + w - 188, sy + 22, 90, 7, skill.maxCd - skill.cd, skill.maxCd, skill.color, "rgba(255,255,255,.13)");
    });
  }
  ctx.restore();
}

function drawUi() {
  ctx.save();
  ctx.fillStyle = "rgba(2, 9, 7, .58)";
  roundRect(14, 15, 216, 72, 14);
  ctx.fill();
  ctx.fillStyle = "#fff5d7";
  ctx.font = "800 17px Segoe UI";
  ctx.fillText(`Lv.${player.level} Rift Knight`, 28, 39);
  drawBar(28, 49, 170, 9, player.hp, player.maxHp, "#ff5c75");
  drawBar(28, 64, 170, 8, player.mp, player.maxMp, "#55ddff");
  drawBar(28, 79, 170, 5, player.exp, player.nextExp, "#ffd965", "rgba(255,255,255,.14)");

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(2, 9, 7, .58)";
  roundRect(W - 142, 16, 128, 58, 13);
  ctx.fill();
  ctx.fillStyle = "#fff5d7";
  ctx.font = "800 14px Segoe UI";
  ctx.fillText(`Wave ${state.wave}`, W - 28, 39);
  ctx.fillStyle = "#ffd965";
  ctx.fillText(`${state.gold} gold`, W - 28, 59);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(2, 9, 7, .58)";
  roundRect(W / 2 - 86, 18, 172, 42, 12);
  ctx.fill();
  ctx.fillStyle = currentStage().enemyColor;
  ctx.font = "900 12px Segoe UI";
  ctx.fillText(currentStage().name, W / 2, 35);
  ctx.fillStyle = "#fff5d7";
  ctx.font = "800 10px Segoe UI";
  ctx.fillText(`Stage ${state.stageIndex + 1} / Zone ${Math.floor((state.wave - 1) / 3) + 1}`, W / 2, 51);

  if (enemies.some((e) => e.kind === "boss")) {
    const boss = enemies.find((e) => e.kind === "boss");
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff5d7";
    ctx.font = "800 14px Segoe UI";
    ctx.fillText("ANCIENT SERPENT", W / 2, 111);
    drawBar(50, 120, W - 100, 12, boss.hp, boss.maxHp, "#8eff65", "rgba(0,0,0,.55)");
  }

  const baseX = W - 68;
  const baseY = H - 300;
  skills.forEach((s, i) => {
    const y = baseY + i * 55;
    const ready = s.cd <= 0 && player.mp >= s.cost;
    ctx.fillStyle = ready ? "rgba(13, 24, 20, .82)" : "rgba(5, 8, 8, .7)";
    ctx.strokeStyle = ready ? s.color : "rgba(255,255,255,.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(baseX, y, 23, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = ready ? 1 : 0.45;
    if (!drawAtlas(sprites.skillIcons, i, 96, 96, baseX - 22, y - 22, 44, 44)) {
      ctx.fillStyle = ready ? s.color : "rgba(255,255,255,.45)";
      ctx.font = "800 20px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(s.icon, baseX, y + 7);
    }
    ctx.restore();
    if (s.cd > 0) {
      ctx.fillStyle = "rgba(0, 0, 0, .58)";
      ctx.beginPath();
      ctx.moveTo(baseX, y);
      ctx.arc(baseX, y, 23, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (s.cd / s.maxCd));
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "800 12px Segoe UI";
      ctx.fillText(Math.ceil(s.cd), baseX, y + 4);
    }
  });

  ctx.textAlign = "center";
  [
    { id: "bag", x: W - 92, y: 92, icon: 0, active: state.panel === "inventory" },
    { id: "skill", x: W - 42, y: 92, icon: 5, active: state.panel === "skills" },
  ].forEach((b) => {
    ctx.fillStyle = b.active ? "rgba(255, 224, 95, .34)" : "rgba(5, 15, 15, .68)";
    ctx.strokeStyle = b.active ? "#ffd965" : "rgba(141,255,251,.45)";
    ctx.lineWidth = 2;
    roundRect(b.x - 18, b.y - 18, 36, 36, 10);
    ctx.fill();
    ctx.stroke();
    drawAtlas(sprites.itemIcons, b.icon, 72, 72, b.x - 15, b.y - 15, 30, 30);
  });

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(4, 10, 8, .62)";
  roundRect(14, H - 92, 190, 46, 13);
  ctx.fill();
  ctx.fillStyle = "#fff5d7";
  ctx.font = "800 13px Segoe UI";
  ctx.fillText("Auto Skills ON", 28, H - 65);
  ctx.fillStyle = "#83ffd5";
  ctx.fillText(`${state.score.toLocaleString()} pts`, 123, H - 65);

  drawBar(224, H - 76, 132, 8, state.ultimateCharge, 100, "#ffffff", "rgba(255,255,255,.14)");
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff5d7";
  ctx.font = "800 11px Segoe UI";
  ctx.fillText("OVERDRIVE", 290, H - 84);

  const joyAlpha = input.joyActive ? 0.78 : 0.34;
  ctx.globalAlpha = joyAlpha;
  ctx.fillStyle = "rgba(4, 12, 10, .68)";
  ctx.strokeStyle = "rgba(154, 255, 204, .52)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(input.joyStartX, input.joyStartY, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(131, 255, 213, .76)";
  ctx.beginPath();
  ctx.arc(input.joyX, input.joyY, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (state.messageTime > 0) {
    ctx.textAlign = "center";
    ctx.globalAlpha = clamp(state.messageTime, 0, 1);
    ctx.fillStyle = "rgba(0,0,0,.35)";
    roundRect(48, H * 0.44 - 27, W - 96, 54, 18);
    ctx.fill();
    ctx.fillStyle = "#fff4c8";
    ctx.font = "900 22px Segoe UI";
    ctx.fillText(state.message, W / 2, H * 0.44 + 8);
  }
  if (state.comboTime > 0) {
    ctx.textAlign = "center";
    ctx.globalAlpha = clamp(state.comboTime / 0.8, 0, 1);
    ctx.shadowBlur = 24;
    ctx.shadowColor = "#8dfffb";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 21px Segoe UI";
    ctx.strokeStyle = "rgba(0,0,0,.8)";
    ctx.lineWidth = 5;
    ctx.strokeText(state.comboText, W / 2, 168);
    ctx.fillText(state.comboText, W / 2, 168);
    ctx.shadowBlur = 0;
  }
  if (state.stageIntro > 0) {
    const a = clamp(state.stageIntro / 3, 0, 1);
    ctx.globalAlpha = Math.min(1, a * 1.35);
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,.38)";
    roundRect(34, 214, W - 68, 86, 20);
    ctx.fill();
    ctx.strokeStyle = currentStage().enemyColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 24;
    ctx.shadowColor = currentStage().enemyColor;
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 25px Segoe UI";
    ctx.fillText(currentStage().name.toUpperCase(), W / 2, 252);
    ctx.fillStyle = currentStage().enemyColor;
    ctx.font = "800 13px Segoe UI";
    ctx.fillText("NEW BATTLEFIELD UNLOCKED", W / 2, 278);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  if (state.panel) drawGamePanel();
  ctx.restore();
}

function startGame() {
  if (state.screen !== "title") return;
  state.screen = "play";
  state.message = "ENTER THE RIFT";
  state.messageTime = 1.8;
  state.stageIntro = 2.2;
  state.powerFlash = 0.42;
  state.shockwave = 0.72;
  state.shake = 18;
}

function drawTitleScreen() {
  const t = state.t;
  const stage = stages[3] || currentStage();
  const img = stage.image.complete ? stage.image : bg;
  ctx.save();
  if (img.complete && img.naturalWidth > 0) {
    const scale = Math.max(W / img.width, H / img.height);
    const bw = img.width * scale;
    const bh = img.height * scale;
    ctx.filter = "blur(2px) saturate(1.35) contrast(1.08)";
    ctx.drawImage(img, (W - bw) / 2, (H - bh) / 2, bw, bh);
    ctx.filter = "none";
  } else {
    ctx.fillStyle = "#071019";
    ctx.fillRect(0, 0, W, H);
  }

  const vignette = ctx.createRadialGradient(W * 0.5, H * 0.36, 40, W * 0.5, H * 0.52, H * 0.72);
  vignette.addColorStop(0, "rgba(38, 255, 210, .08)");
  vignette.addColorStop(0.48, "rgba(6, 10, 22, .22)");
  vignette.addColorStop(1, "rgba(0, 0, 0, .86)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 7; i += 1) {
    const p = (t * 0.18 + i / 7) % 1;
    const x = W * (0.1 + i * 0.14);
    const y = H * (0.18 + p * 0.62);
    const hue = [185, 275, 45, 330][i % 4];
    ctx.strokeStyle = `hsla(${hue}, 100%, 68%, ${0.16 - p * 0.09})`;
    ctx.shadowBlur = 22;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.lineWidth = 2 + i % 3;
    ctx.beginPath();
    ctx.moveTo(x - 28, y - 80);
    ctx.bezierCurveTo(x + 32, y - 24, x - 42, y + 36, x + 22, y + 92);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.translate(W * 0.68, H * 0.36 + Math.sin(t * 1.6) * 6);
  ctx.rotate(-0.08 + Math.sin(t * 1.1) * 0.035);
  ctx.globalAlpha = 0.52;
  ctx.shadowBlur = 54;
  ctx.shadowColor = "#a45cff";
  if (sprites.boss.complete && sprites.boss.naturalWidth > 0) {
    ctx.drawImage(sprites.boss, -128, -154, 256, 256);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.save();
  ctx.translate(W * 0.28, H * 0.64 + Math.sin(t * 2.1) * 4);
  ctx.rotate(-0.24);
  ctx.shadowBlur = 34;
  ctx.shadowColor = "#57dfff";
  drawPlayerSheetFrame(150, null);
  ctx.globalCompositeOperation = "lighter";
  strokeMultiArc(22, -38, 92, -0.86, 0.54, ["#ffffff", "#57dfff", "#ffd965", "#ff4eea"], 12, 0.72);
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.shadowBlur = 26;
  ctx.shadowColor = "#57dfff";
  ctx.font = "900 54px Segoe UI";
  const titleGrad = ctx.createLinearGradient(52, 150, W - 52, 226);
  titleGrad.addColorStop(0, "#ffffff");
  titleGrad.addColorStop(0.32, "#57dfff");
  titleGrad.addColorStop(0.62, "#ffd965");
  titleGrad.addColorStop(1, "#ff4eea");
  ctx.fillStyle = titleGrad;
  ctx.fillText("SERPENT RIFT", W / 2, 184);
  ctx.shadowBlur = 0;
  ctx.font = "800 13px Segoe UI";
  ctx.fillStyle = "rgba(235, 252, 255, .82)";
  ctx.fillText("PHANTOM SLASH ACTION RPG", W / 2, 208);

  const pulse = 0.72 + Math.sin(t * 4) * 0.16;
  ctx.globalCompositeOperation = "lighter";
  const buttonGlow = ctx.createRadialGradient(W / 2, H * 0.79, 10, W / 2, H * 0.79, 134);
  buttonGlow.addColorStop(0, `rgba(87, 223, 255, ${0.26 + pulse * 0.16})`);
  buttonGlow.addColorStop(0.55, "rgba(255, 217, 101, .10)");
  buttonGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = buttonGlow;
  ctx.fillRect(0, H * 0.66, W, H * 0.28);
  ctx.globalCompositeOperation = "source-over";

  ctx.fillStyle = "rgba(2, 8, 16, .62)";
  roundRect(W / 2 - 112, H * 0.75, 224, 54, 16);
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.42 + pulse * 0.24})`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ffd965";
  ctx.font = "900 18px Segoe UI";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("TAP TO START", W / 2, H * 0.75 + 34);
  ctx.shadowBlur = 0;

  const labels = ["AUTO SKILLS", "LOOT DROP", "BOSS RAID", "MULTI STAGE"];
  labels.forEach((label, i) => {
    const x = W / 2 - 156 + i * 104;
    const y = H * 0.87;
    ctx.fillStyle = "rgba(255, 255, 255, .08)";
    roundRect(x - 44, y - 16, 88, 30, 9);
    ctx.fill();
    ctx.strokeStyle = ["#57dfff", "#ffd965", "#ff4eea", "#8eff65"][i];
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, .84)";
    ctx.font = "800 10px Segoe UI";
    ctx.fillText(label, x, y + 4);
  });
  ctx.restore();
  ctx.restore();
}

function draw() {
  if (state.screen === "title") {
    drawTitleScreen();
    return;
  }
  ctx.save();
  const shakeBoost = state.hitStop > 0 ? 1.45 : 1;
  const sx = rand(-state.shake, state.shake) * shakeBoost;
  const sy = rand(-state.shake, state.shake) * shakeBoost;
  ctx.translate(sx, sy);
  if (state.shake > 12) {
    const zoom = 1 + Math.min(0.035, state.shake * 0.0016);
    ctx.translate(W / 2, H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -H / 2);
  }
  drawBackground();
  for (const h of hazards) drawHazard(h);
  for (const p of projectiles) drawProjectile(p);
  lootDrops.sort((a, b) => a.y - b.y).forEach(drawLootDrop);
  for (const p of pickups) {
    ctx.fillStyle = `rgba(255, 220, 96, ${clamp(p.life, 0, 1)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5 + Math.sin(state.t * 8) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  enemies.sort((a, b) => a.y - b.y).forEach(drawEntity);
  drawPlayer();
  for (const p of particles) {
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const h of hits) {
    drawDamageNumber(h);
  }
  ctx.restore();

  if (state.lootFlash > 0) {
    ctx.fillStyle = `rgba(255, 226, 93, ${state.lootFlash * 0.08})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (state.powerFlash > 0) {
    const a = Math.min(0.34, state.powerFlash);
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(255,255,255,${a * 0.22})`;
    ctx.fillRect(0, 0, W, H);
    const rg = ctx.createRadialGradient(player.x, player.y, 12, player.x, player.y, 360);
    rg.addColorStop(0, `rgba(255,245,164,${a * 0.75})`);
    rg.addColorStop(0.3, `rgba(88,230,255,${a * 0.34})`);
    rg.addColorStop(0.74, `rgba(150,74,255,${a * 0.18})`);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
  }
  if (state.shockwave > 0) {
    const p = 1 - state.shockwave;
    ctx.save();
    ctx.globalAlpha = state.shockwave * 0.38;
    ctx.strokeStyle = "rgba(255,255,255,.78)";
    ctx.lineWidth = 10;
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#7df3ff";
    ctx.beginPath();
    ctx.ellipse(player.x, player.y, 80 + p * 220, 24 + p * 76, player.facing, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  if (player.attackAnim > 0) {
    const p = clamp(1 - player.attackAnim / 0.46, 0, 1);
    const flash = Math.sin(p * Math.PI);
    const g = ctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, 220);
    g.addColorStop(0, `rgba(255,255,255,${0.12 * flash})`);
    g.addColorStop(0.34, `rgba(95,232,255,${0.08 * flash})`);
    g.addColorStop(0.72, `rgba(255,218,78,${0.05 * flash})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  drawUi();
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  try {
    if (state.screen === "title") state.t += dt;
    else if (!state.paused) update(dt);
    draw();
  } catch (err) {
    console.error("[game loop] frame skipped:", err);
  }
  requestAnimationFrame(loop);
}

function canvasPoint(ev) {
  const rect = canvas.getBoundingClientRect();
  const touch = ev.touches ? ev.touches[0] : ev;
  return {
    x: ((touch.clientX - rect.left) / rect.width) * W,
    y: ((touch.clientY - rect.top) / rect.height) * H,
  };
}

function setJoystick(p) {
  const dx = p.x - input.joyStartX;
  const dy = p.y - input.joyStartY;
  const len = Math.hypot(dx, dy);
  const max = 42;
  const k = len > max ? max / len : 1;
  input.joyX = input.joyStartX + dx * k;
  input.joyY = input.joyStartY + dy * k;
  input.moveX = len > 8 ? dx / Math.max(len, 1) : 0;
  input.moveY = len > 8 ? dy / Math.max(len, 1) : 0;
}

function resetJoystick() {
  input.joyActive = false;
  input.joyStartX = 82;
  input.joyStartY = H - 156;
  input.joyX = input.joyStartX;
  input.joyY = input.joyStartY;
  input.moveX = 0;
  input.moveY = 0;
}

function handlePointer(ev) {
  ev.preventDefault();
  if (state.screen === "title") {
    startGame();
    return;
  }
  ensureAudio();
  const p = canvasPoint(ev);
  if (state.panel) {
    const panelX = 28;
    const panelY = 150;
    const panelW = W - 56;
    if (p.x > panelX + panelW - 64 && p.x < panelX + panelW - 18 && p.y > panelY + 18 && p.y < panelY + 66) {
      state.panel = null;
    }
    return;
  }
  if (p.y > 70 && p.y < 116 && p.x > W - 116 && p.x < W - 20) {
    state.panel = p.x < W - 66 ? "inventory" : "skills";
    input.down = false;
    resetJoystick();
    return;
  }
  for (let i = 0; i < skills.length; i += 1) {
    const bx = W - 68;
    const by = H - 300 + i * 55;
    if (dist(p.x, p.y, bx, by) < 34) {
      castSkill(i);
      return;
    }
  }
  if (input.joyActive) {
    setJoystick(p);
    return;
  }
  if (player.hp <= 0) {
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    player.x = W * 0.48;
    player.y = H * 0.73;
    player.targetX = player.x;
    player.targetY = player.y;
    enemies.length = 0;
    hazards.length = 0;
    state.message = "REVIVED";
    state.messageTime = 1.2;
    return;
  }
  player.targetX = p.x;
  player.targetY = p.y;
}

canvas.addEventListener("pointerdown", (ev) => {
  input.down = true;
  const p = canvasPoint(ev);
  if (state.screen === "title") {
    handlePointer(ev);
    return;
  }
  const leftStickZone = p.x < 170 && p.y > H - 285;
  if (leftStickZone) {
    input.joyActive = true;
    input.joyStartX = p.x;
    input.joyStartY = p.y;
    input.joyX = p.x;
    input.joyY = p.y;
    setJoystick(p);
  } else {
    handlePointer(ev);
  }
});
canvas.addEventListener("pointermove", (ev) => {
  if (input.down) handlePointer(ev);
});
window.addEventListener("pointerup", () => {
  input.down = false;
  resetJoystick();
});
window.addEventListener("keydown", (ev) => {
  if (state.screen === "title") {
    if (ev.key === "Enter" || ev.key === " ") startGame();
    return;
  }
  ensureAudio();
  if (ev.key === "1") castSkill(0);
  if (ev.key === "2") castSkill(1);
  if (ev.key === "3") castSkill(2);
  if (ev.key === "4") castSkill(3);
  if (ev.key === "5") castSkill(4);
  if (ev.key === "6") castSkill(5);
  if (ev.key === "7") castSkill(6);
  if (ev.key === "8") castSkill(7);
  if (ev.key.toLowerCase() === "q") castUltimate();
  input.keys.add(ev.key.toLowerCase());
});
window.addEventListener("keyup", (ev) => {
  input.keys.delete(ev.key.toLowerCase());
});

for (let i = 0; i < 4; i += 1) spawnEnemy(i === 0 ? "elite" : "shade");
requestAnimationFrame(loop);
