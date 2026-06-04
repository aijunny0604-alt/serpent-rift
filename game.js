const canvas = document.getElementById("game");
const visibleCtx = canvas.getContext("2d");
const renderCanvas = document.createElement("canvas");
const ctx = renderCanvas.getContext("2d");
let canvasSaveDepth = 0;
const nativeCtxSave = ctx.save.bind(ctx);
const nativeCtxRestore = ctx.restore.bind(ctx);
ctx.save = () => {
  canvasSaveDepth += 1;
  nativeCtxSave();
};
ctx.restore = () => {
  if (canvasSaveDepth <= 0) return;
  canvasSaveDepth -= 1;
  nativeCtxRestore();
};

const W = canvas.width;
const H = canvas.height;
const STAGES_PER_FLOOR = 5;
const KILLS_PER_STAGE = 10;
const DPR = 1;
canvas.width = W * DPR;
canvas.height = H * DPR;
renderCanvas.width = canvas.width;
renderCanvas.height = canvas.height;
ctx.scale(DPR, DPR);

function presentFrame() {
  visibleCtx.setTransform(1, 0, 0, 1, 0, 0);
  visibleCtx.globalAlpha = 1;
  visibleCtx.globalCompositeOperation = "source-over";
  visibleCtx.filter = "none";
  visibleCtx.clearRect(0, 0, canvas.width, canvas.height);
  visibleCtx.drawImage(renderCanvas, 0, 0);
}

const bg = new Image();
bg.src = "./assets/serpent-arena.png";

const stages = [
  { id: "forest", name: "Elderwood Ruins", chapter: "제1계층 / 고대수해", lore: "리프트의 입구. 세르펜트 코어의 첫 파편이 뿌리 아래 잠들어 있다.", bossName: "SERPENT ROOT OVERLORD", bossTitle: "계층주 SERPENT ROOT OVERLORD", image: bg, tint: "rgba(37, 255, 170, .10)", enemyColor: "#ffd965", bossScale: 1.54 },
  { id: "volcano", name: "Obsidian Gate", chapter: "제2계층 / 흑요석 관문", lore: "불타는 차원의 성문. 패배한 기사들의 갑옷이 용암에 녹아 몬스터가 되었다.", bossName: "OBSIDIAN INFERNO TYRANT", bossTitle: "계층주 OBSIDIAN INFERNO TYRANT", image: loadImage("./assets/stage-volcano.png"), tint: "rgba(255, 86, 24, .16)", enemyColor: "#ff8b3d", bossScale: 1.6 },
  { id: "frost", name: "Frozen Citadel", chapter: "제3계층 / 동결성채", lore: "시간까지 얼어붙은 성채. 이곳의 얼음은 기억을 봉인한다.", bossName: "GLACIAL MEMORY EMPRESS", bossTitle: "계층주 GLACIAL MEMORY EMPRESS", image: loadImage("./assets/stage-frost.png"), tint: "rgba(90, 214, 255, .16)", enemyColor: "#8dfffb", bossScale: 1.56 },
  { id: "void", name: "Astral Void", chapter: "제4계층 / 별 없는 공허", lore: "별빛과 그림자가 뒤섞인 최심부. 세르펜트 코어의 심장이 이곳에서 맥동한다.", bossName: "ASTRAL ABYSS WATCHER", bossTitle: "계층주 ASTRAL ABYSS WATCHER", image: loadImage("./assets/stage-void.png"), tint: "rgba(190, 88, 255, .18)", enemyColor: "#d66bff", bossScale: 1.68 },
  { id: "core", name: "Serpent Core Sanctum", chapter: "제5계층 / 코어 성소", lore: "모든 계층주의 파편이 모이는 최심부. 차원의 심장인 세르펜트 코어가 이곳에서 깨어난다.", bossName: "SERPENT CORE ECLIPSE", bossTitle: "최종 계층주 SERPENT CORE ECLIPSE", image: loadImage("./assets/stage-core.png"), tint: "rgba(75, 255, 198, .18)", enemyColor: "#7dffd8", bossScale: 1.82 },
];

const sprites = {
  player: loadImage("./assets/player.png"),
  playerSheet: loadImage("./assets/player-action-sheet.png"),
  playerRidingSheet: loadImage("./assets/player-riding-sheet-v2.png"),
  lumiMount: loadImage("./assets/lumi-mount-v2.png"),
  partnerAriaSheet: loadImage("./assets/partner-aria-sheet.png"),
  partnerBranSheet: loadImage("./assets/partner-bran-sheet.png"),
  partnerRenSheet: loadImage("./assets/partner-ren-sheet.png"),
  portraitHero: loadImage("./assets/portrait-hero.png"),
  portraitGuide: loadImage("./assets/portrait-guide.png"),
  titleKeyart: loadImage("./assets/title-keyart-serpent-rift.png"),
  skillIcons: markLogicalSize(loadImage("./assets/skill-icons-v2-4k-v1.png"), 768, 96),
  itemIcons: markLogicalSize(loadImage("./assets/item-icons-4k-v1.png"), 576, 72),
  uiPanel: loadImage("./assets/ui-panel.png"),
  runeEffects: markLogicalSize(loadImage("./assets/rune-effects-4k-v1.png"), 768, 256),
  lootIcons: markLogicalSize(loadImage("./assets/loot-icons-4k-v1.png"), 288, 72),
  elementFx: markLogicalSize(loadImage("./assets/element-fx-4k-v1.png"), 512, 256),
  combatFx: loadImage("./assets/combat-fx-atlas.png"),
  magicFx: markLogicalSize(loadImage("./assets/magic-fx-atlas-generated-game-v1.png"), 2048, 256),
  enemyAttackFx: loadImage("./assets/enemy-attack-fx-sheet-v1.png"),
  bossCastFx: loadImage("./assets/boss-cast-fx-sheet-v1.png"),
  uiFantasy: loadImage("./assets/ui-fantasy-atlas-v2.png"),
  townMap: loadImage("./assets/town-map-4k-v1.png"),
  townBuildings: loadImage("./assets/town-buildings-atlas-4k-v1.png"),
  townUi: loadImage("./assets/town-ui-atlas-4k-v1.png"),
  shade: loadImage("./assets/shade.png"),
  shadeSheet: loadImage("./assets/shade-action-sheet.png"),
  elite: loadImage("./assets/elite.png"),
  eliteSheet: loadImage("./assets/elite-action-sheet.png"),
  boss: loadImage("./assets/boss.png"),
  bossSheet: loadImage("./assets/boss-action-sheet.png"),
  bossSheets: [
    loadImage("./assets/boss-forest-action-sheet.png"),
    loadImage("./assets/boss-volcano-action-sheet.png"),
    loadImage("./assets/boss-frost-action-sheet.png"),
    loadImage("./assets/boss-void-action-sheet.png"),
  ],
  bossSprites: [
    loadImage("./assets/boss-floorlord-1.png"),
    loadImage("./assets/boss-floorlord-2.png"),
    loadImage("./assets/boss-floorlord-3.png"),
    loadImage("./assets/boss-floorlord-4.png"),
    loadImage("./assets/boss-floorlord-5.png"),
  ],
  floorLordSheets: [
    loadImage("./assets/boss-floorlord-1-sheet.png"),
    loadImage("./assets/boss-floorlord-2-sheet.png"),
    loadImage("./assets/boss-floorlord-3-sheet.png"),
    loadImage("./assets/boss-floorlord-4-sheet.png"),
    loadImage("./assets/boss-floorlord-5-sheet.png"),
  ],
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

const floorLordSheet = {
  frameW: 384,
  frameH: 384,
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
  const sxScale = sheet.naturalWidth > 0 ? sheet.naturalWidth / (sw * 6) : 1;
  const syScale = sxScale > 1 ? sxScale : 1;
  const sourceScale = Number.isFinite(sxScale) && sxScale > 1 ? sxScale : 1;
  const sourceSyScale = Number.isFinite(syScale) && syScale > 1 ? syScale : 1;
  const sourceSw = sw * sourceScale;
  const sourceSh = sh * sourceSyScale;
  const sourceSx = sx * sourceScale;
  const sourceSy = sy * sourceSyScale;
  const ow = Math.max(8, Math.ceil(sourceSw));
  const oh = Math.max(8, Math.ceil(sourceSh));
  if (_tintCanvas.width !== ow) _tintCanvas.width = ow;
  if (_tintCanvas.height !== oh) _tintCanvas.height = oh;
  _tintCtx.globalCompositeOperation = "source-over";
  _tintCtx.clearRect(0, 0, ow, oh);
  _tintCtx.drawImage(sheet, sourceSx, sourceSy, sourceSw, sourceSh, 0, 0, ow, oh);
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

function markLogicalSize(img, logicalWidth, logicalHeight) {
  img.logicalWidth = logicalWidth;
  img.logicalHeight = logicalHeight;
  return img;
}

const state = {
  t: 0,
  screen: "title",
  introIndex: 0,
  introTime: 0,
  paused: false,
  shake: 0,
  score: 0,
  kills: 0,
  nextStageKills: KILLS_PER_STAGE,
  wave: 1,
  stageIndex: 0,
  stageIntro: 3,
  raidIntro: 0,
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
  collectedFragments: [],
  partyBarrier: 0,
  soundOn: false,
  questStats: {
    kills: 0,
    elites: 0,
    bosses: 0,
    skills: 0,
    loot: 0,
    goldEarned: 0,
    fragments: 0,
    stageClears: 0,
    partyAssists: 0,
  },
  completedQuests: [],
  questToast: "",
  questToastTime: 0,
  questPulse: 0,
  townPanel: null,
  townMessage: "Rift Town에 도착했다",
  townMessageTime: 2,
  townUpgrades: {
    weapon: 0,
    pet: 0,
    party: 0,
  },
  townContracts: [],
};

const introScenes = [
  {
    speaker: "리아",
    side: "right",
    portrait: "portraitGuide",
    line: "여기가 세르펜트 리프트야. 여러 차원이 겹쳐진 던전, 그리고 돌아오지 못한 모험자들의 무덤.",
  },
  {
    speaker: "카엘",
    side: "left",
    portrait: "portraitHero",
    line: "세르펜트 코어를 찾으면 닫힌 차원의 문을 열 수 있어. 그러려면 계층주를 넘어야겠지.",
  },
  {
    speaker: "리아",
    side: "right",
    portrait: "portraitGuide",
    line: "조심해. 계층주는 보스가 아니라 그 층의 법칙이야. 숲도, 불도, 얼음도 네 적이 될 거야.",
  },
  {
    speaker: "카엘",
    side: "left",
    portrait: "portraitHero",
    line: "좋아. 이 던전이 법칙이라면, 내가 그 법칙을 베어버리겠어. 레이드 시작이다.",
  },
];

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
  renderDir: 1,
  attackAnim: 0,
  castAnim: 0,
  castColor: "#ffd965",
  hurtAnim: 0,
  stepAnim: 0,
  movePower: 0,
  footstepTimer: 0,
  isMoving: false,
  mounted: false,
  mountAnim: 0,
  mountToggleCd: 0,
};

const partyMembers = [
  { id: "aria", name: "리아", role: "HEALER", skillName: "Sanctuary", type: "healer", color: "#8dfffb", x: W * 0.43, y: H * 0.76, offsetX: 48, offsetY: 56, cd: 0.6, maxCd: 1.85, specialCd: 2.2, maxSpecialCd: 6.6, range: 315, power: 0.82, action: 0, healCd: 1.2, pulse: 0, walkAnim: 0, moving: false, hurtAnim: 0 },
  { id: "bran", name: "브란", role: "TANK", skillName: "Guardian Wall", type: "tank", color: "#3cffaa", x: W * 0.48, y: H * 0.8, offsetX: -64, offsetY: 66, cd: 0.35, maxCd: 1.55, specialCd: 1.1, maxSpecialCd: 5.8, range: 175, power: 0.7, action: 0, healCd: 0, pulse: 0, walkAnim: 0, moving: false, hurtAnim: 0 },
  { id: "ren", name: "렌", role: "DPS", skillName: "Blade Rush", type: "guard", color: "#ffd965", x: W * 0.55, y: H * 0.78, offsetX: 62, offsetY: 76, cd: 0.2, maxCd: 1.28, specialCd: 1.4, maxSpecialCd: 4.8, range: 190, power: 0.9, action: 0, healCd: 0, pulse: 0, walkAnim: 0, moving: false, hurtAnim: 0 },
];

const pet = {
  id: "lumi",
  name: "루미",
  role: "PET",
  skillName: "Core Burst",
  type: "pet",
  color: "#b8ff7d",
  x: W * 0.5,
  y: H * 0.68,
  offsetX: -34,
  offsetY: 18,
  cd: 0.3,
  maxCd: 1.12,
  specialCd: 1.8,
  maxSpecialCd: 3.5,
  range: 260,
  power: 0.52,
  action: 0,
  pulse: 0,
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

const coreFragments = [
  { id: "root", name: "뿌리의 코어 파편", boss: "SERPENT ROOT OVERLORD", color: "#7dffb0", icon: 4 },
  { id: "obsidian", name: "흑요석 코어 파편", boss: "OBSIDIAN INFERNO TYRANT", color: "#ff8b3d", icon: 4 },
  { id: "memory", name: "동결 기억 코어 파편", boss: "GLACIAL MEMORY EMPRESS", color: "#8dfffb", icon: 6 },
  { id: "void", name: "공허의 코어 파편", boss: "ASTRAL ABYSS WATCHER", color: "#d66bff", icon: 2 },
  { id: "serpent", name: "세르펜트 코어", boss: "SERPENT CORE ECLIPSE", color: "#fff2a5", icon: 7 },
];

const cleanStageCopy = [
  ["1계층 / 고대 수해", "리프트의 입구. 세르펜트 코어의 첫 파편이 뿌리 아래 잠들어 있다.", "계층주 SERPENT ROOT OVERLORD"],
  ["2계층 / 흑요의 관문", "불타는 차원의 성문. 잿빛 기사들의 갑옷에 분노가 스며 몬스터가 되었다.", "계층주 OBSIDIAN INFERNO TYRANT"],
  ["3계층 / 얼어붙은 성채", "시간까지 얼어붙은 성채. 남겨진 기억들이 차가운 마력으로 깨어난다.", "계층주 GLACIAL MEMORY EMPRESS"],
  ["4계층 / 별 없는 공허", "별빛과 그림자가 뒤섞인 최심부. 세르펜트 코어의 파장이 공허에서 맥동한다.", "계층주 ASTRAL ABYSS WATCHER"],
  ["5계층 / 코어 성소", "모든 계층주의 파편이 모이는 최심부. 세르펜트 코어가 심장처럼 뛰고 있다.", "최종 계층주 SERPENT CORE ECLIPSE"],
];

cleanStageCopy.forEach(([chapter, lore, bossTitle], i) => {
  if (!stages[i]) return;
  stages[i].chapter = chapter;
  stages[i].lore = lore;
  stages[i].bossTitle = bossTitle;
});

partyMembers[0].name = "리아";
partyMembers[1].name = "브란";
partyMembers[2].name = "렌";
pet.name = "루미";

[
  ["root", "뿌리의 코어 파편"],
  ["obsidian", "흑요의 코어 파편"],
  ["memory", "빙결 기억 코어 파편"],
  ["void", "공허의 코어 파편"],
  ["serpent", "세르펜트 코어"],
].forEach(([id, name]) => {
  const fragment = coreFragments.find((f) => f.id === id);
  if (fragment) fragment.name = name;
});

introScenes.splice(
  0,
  introScenes.length,
  {
    speaker: "리아",
    side: "right",
    portrait: "portraitGuide",
    line: "여기가 세르펜트 리프트야. 여러 차원이 겹쳐진 던전, 그리고 돌아오지 못한 모험가들의 무덤.",
  },
  {
    speaker: "카엘",
    side: "left",
    portrait: "portraitHero",
    line: "세르펜트 코어를 찾으면 닫힌 차원의 문을 열 수 있어. 그러려면 계층주를 넘어야겠지.",
  },
  {
    speaker: "리아",
    side: "right",
    portrait: "portraitGuide",
    line: "조심해. 계층주는 단순한 보스가 아니라 그 층의 법칙이야. 속도, 불, 얼음, 공허까지 전부 상대해야 해.",
  },
  {
    speaker: "카엘",
    side: "left",
    portrait: "portraitHero",
    line: "좋아. 던전의 법칙이라면 내가 그 법칙을 베어버리겠어. 레이드 시작이다.",
  },
);

const questDefinitions = [
  { id: "core", kind: "MAIN", title: "세르펜트 코어 복원", desc: "계층주를 쓰러뜨리고 코어 파편을 모아라.", stat: "fragments", target: 5, rewardGold: 500, rewardExp: 420, color: "#fff2a5" },
  { id: "first_hunt", kind: "HUNT", title: "리프트 정화", desc: "일반 몬스터를 처치해 첫 거점을 확보한다.", stat: "kills", target: 20, rewardGold: 120, rewardExp: 90, color: "#7dffb0" },
  { id: "elite_breaker", kind: "HUNT", title: "엘리트 추적", desc: "강화 개체를 격파해 파티의 진입로를 연다.", stat: "elites", target: 5, rewardGold: 180, rewardExp: 130, color: "#57dfff" },
  { id: "skill_trial", kind: "SKILL", title: "스킬 연계 시험", desc: "자동 전투 중 스킬을 여러 번 발동한다.", stat: "skills", target: 15, rewardGold: 100, rewardExp: 100, color: "#d66bff" },
  { id: "loot_order", kind: "SUPPLY", title: "보급품 회수", desc: "전장에서 골드와 장비 드롭을 회수한다.", stat: "loot", target: 18, rewardGold: 160, rewardExp: 80, color: "#ffd965" },
  { id: "raid_oath", kind: "RAID", title: "계층주 토벌 서약", desc: "거대 계층주를 쓰러뜨려 레이드 증표를 획득한다.", stat: "bosses", target: 1, rewardGold: 260, rewardExp: 180, color: "#ff7184" },
  { id: "floor_path", kind: "ROUTE", title: "층계 돌파", desc: "스테이지를 돌파하며 다음 계층으로 향한다.", stat: "stageClears", target: 4, rewardGold: 220, rewardExp: 150, color: "#8dfffb" },
  { id: "party_sync", kind: "PARTY", title: "파티 합동 작전", desc: "동료와 펫의 보조 스킬을 전투에 활용한다.", stat: "partyAssists", target: 10, rewardGold: 140, rewardExp: 120, color: "#b8ff7d" },
];

const townBuildings = [
  { id: "weapon", name: "Forge", title: "Weapon Smith", sub: "검 강화", x: 34, y: 328, w: 130, h: 108, color: "#ffd965", icon: 0, src: [0, 0, 560, 440] },
  { id: "pet", name: "Pet Shop", title: "Lumi Pet Shop", sub: "펫 훈련", x: 270, y: 338, w: 124, h: 104, color: "#b8ff7d", icon: 6, src: [588, 0, 620, 430] },
  { id: "partner", name: "Party Hall", title: "Partner Hall", sub: "동료 영입", x: 96, y: 458, w: 226, h: 100, color: "#8dfffb", icon: 5, src: [350, 395, 565, 420] },
  { id: "guild", name: "Quest Hall", title: "Quest Office", sub: "의뢰소", x: 34, y: 632, w: 132, h: 104, color: "#d66bff", icon: 7, src: [0, 750, 590, 420] },
  { id: "gate", name: "Gate", title: "Dungeon Gate", sub: "던전 입장", x: 254, y: 628, w: 136, h: 108, color: "#ff7184", icon: 4, src: [700, 790, 530, 400] },
];

const townShopItems = {
  weapon: [
    { id: "weapon1", name: "Rift Edge 강화", desc: "공격력 +4", cost: 80, levelKey: "weapon", max: 5, apply: () => { player.atk += 4; } },
    { id: "weapon2", name: "치명 검광 조율", desc: "오버드라이브 +20", cost: 160, levelKey: "weapon", max: 5, apply: () => { state.ultimateCharge = Math.min(100, state.ultimateCharge + 20); } },
  ],
  pet: [
    { id: "pet1", name: "루미 전투 훈련", desc: "펫 공격력 상승", cost: 110, levelKey: "pet", max: 4, apply: () => { pet.power += 0.08; pet.maxCd = Math.max(0.72, pet.maxCd - 0.04); } },
    { id: "pet2", name: "라이딩 코어 정비", desc: "기동력 +12", cost: 150, levelKey: "pet", max: 4, apply: () => { player.speed += 12; } },
  ],
  partner: [
    { id: "partner1", name: "리아 신뢰 퀘스트", desc: "힐러 보조 강화", cost: 90, levelKey: "party", max: 3, apply: () => { partyMembers[0].power += 0.08; partyMembers[0].maxSpecialCd = Math.max(4.8, partyMembers[0].maxSpecialCd - 0.35); } },
    { id: "partner2", name: "브란/렌 합동 훈련", desc: "탱커와 딜러 보조 강화", cost: 140, levelKey: "party", max: 3, apply: () => { partyMembers[1].power += 0.06; partyMembers[2].power += 0.07; } },
  ],
};

const townContracts = [
  { id: "daily_hunt", name: "마을 의뢰: 균열 정찰", desc: "몬스터 8마리 처치", stat: "kills", target: 8, rewardGold: 70, rewardExp: 45, color: "#7dffb0" },
  { id: "partner_recruit", name: "동료 영입: 신뢰 증명", desc: "파티 보조 3회 발동", stat: "partyAssists", target: 3, rewardGold: 90, rewardExp: 70, color: "#8dfffb" },
  { id: "pet_delivery", name: "펫샵 의뢰: 코어 먹이", desc: "드롭 아이템 5개 회수", stat: "loot", target: 5, rewardGold: 85, rewardExp: 40, color: "#b8ff7d" },
  { id: "raid_notice", name: "의뢰소 공고: 계층주 토벌", desc: "보스 1회 격파", stat: "bosses", target: 1, rewardGold: 180, rewardExp: 120, color: "#ff7184" },
];

const townUiRects = {
  shopPanel: [0, 0, 680, 650],
  questPanel: [710, 0, 520, 650],
  shopCard: [0, 710, 650, 250],
  contractCard: [710, 710, 510, 250],
  pricePlaque: [0, 1040, 420, 130],
  badge: [440, 990, 250, 250],
  close: [710, 1000, 150, 150],
  gateButton: [880, 990, 340, 220],
};

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
  joyStartY: H - 232,
  joyX: 82,
  joyY: H - 232,
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

function floorNumber() {
  return Math.floor((state.wave - 1) / STAGES_PER_FLOOR) + 1;
}

function subStageNumber() {
  return ((state.wave - 1) % STAGES_PER_FLOOR) + 1;
}

function stageCode() {
  return `${floorNumber()}-${subStageNumber()}`;
}

function isBossStage() {
  return subStageNumber() === STAGES_PER_FLOOR;
}

function bossSafeBounds(bossScale = 1) {
  const visualR = Math.min(118, Math.max(72, 52 * bossScale));
  return {
    minX: visualR + 16,
    maxX: W - visualR - 16,
    minY: 182 + visualR * 0.25,
    maxY: H - 214,
  };
}

function clampBossPosition(e) {
  if (!e || e.kind !== "boss") return;
  const bounds = bossSafeBounds(e.bossScale || 1);
  const beforeX = e.x;
  const beforeY = e.y;
  e.x = clamp(e.x, bounds.minX, bounds.maxX);
  e.y = clamp(e.y, bounds.minY, bounds.maxY);
  if (e.x !== beforeX) e.knockX = 0;
  if (e.y !== beforeY) e.knockY = 0;
}

function nextQuestFragment() {
  return coreFragments.find((fragment) => !state.collectedFragments.includes(fragment.id)) || null;
}

function questProgress(quest) {
  return clamp(state.questStats[quest.stat] || 0, 0, quest.target);
}

function questComplete(quest) {
  return questProgress(quest) >= quest.target;
}

function visibleQuests() {
  const active = questDefinitions.filter((quest) => !state.completedQuests.includes(quest.id));
  const urgent = active.filter((quest) => quest.kind === "MAIN" || quest.kind === "RAID");
  const rotating = active.filter((quest) => quest.kind !== "MAIN" && quest.kind !== "RAID");
  return [...urgent, ...rotating].slice(0, 4);
}

function grantQuestReward(quest) {
  state.completedQuests.push(quest.id);
  state.gold += quest.rewardGold || 0;
  state.score += (quest.rewardExp || 0) * 7;
  player.exp += quest.rewardExp || 0;
  player.hp = Math.min(player.maxHp, player.hp + 22);
  player.mp = player.maxMp;
  state.ultimateCharge = Math.min(100, state.ultimateCharge + 18);
  state.questToast = `${quest.title} 완료  +${quest.rewardGold}G  +${quest.rewardExp}EXP`;
  state.questToastTime = 3.2;
  state.questPulse = 1;
  state.comboText = "QUEST COMPLETE";
  state.comboTime = 1.25;
  state.message = quest.title;
  state.messageTime = 1.7;
  state.lootFlash = Math.max(state.lootFlash, 1.2);
  state.powerFlash = Math.max(state.powerFlash, 0.35);
  addPrismaticBurst(player.x, player.y - 44, [quest.color, "#ffffff", "#ffd965", "#57dfff"], 34, 1);
}

function checkQuestCompletions() {
  for (const quest of questDefinitions) {
    if (!state.completedQuests.includes(quest.id) && questComplete(quest)) {
      grantQuestReward(quest);
    }
  }
}

function addQuestProgress(stat, amount = 1) {
  if (!state.questStats || !Object.prototype.hasOwnProperty.call(state.questStats, stat)) return;
  state.questStats[stat] += amount;
  checkQuestCompletions();
  checkTownContracts();
}

function activeTownContracts() {
  return townContracts.filter((contract) => state.townContracts.includes(contract.id));
}

function contractProgress(contract) {
  return clamp(state.questStats[contract.stat] || 0, 0, contract.target);
}

function checkTownContracts() {
  for (const contract of activeTownContracts()) {
    if (contractProgress(contract) < contract.target) continue;
    state.townContracts = state.townContracts.filter((id) => id !== contract.id);
    state.gold += contract.rewardGold;
    player.exp += contract.rewardExp;
    state.score += contract.rewardExp * 5;
    state.townMessage = `${contract.name} 완료`;
    state.townMessageTime = 3;
    state.questToast = `${contract.name}  +${contract.rewardGold}G  +${contract.rewardExp}EXP`;
    state.questToastTime = 3;
    state.questPulse = 1;
    addPrismaticBurst(player.x, player.y - 44, [contract.color, "#ffffff", "#ffd965"], 26, 0.9);
  }
}

function enterTown(message = "Rift Town 귀환") {
  state.screen = "town";
  state.townPanel = null;
  state.townMessage = message;
  state.townMessageTime = 2.4;
  state.paused = false;
  resetJoystick();
}

function enterDungeon() {
  state.screen = "play";
  state.townPanel = null;
  state.message = "ENTER THE RIFT";
  state.messageTime = 1.5;
  state.stageIntro = Math.max(state.stageIntro, 1.8);
  state.powerFlash = Math.max(state.powerFlash, 0.32);
  state.shake = Math.max(state.shake, 7);
  resetJoystick();
}

function buyTownItem(item) {
  const level = state.townUpgrades[item.levelKey] || 0;
  if (level >= item.max) {
    state.townMessage = "이미 최대 단계입니다";
    state.townMessageTime = 1.6;
    return;
  }
  const price = Math.floor(item.cost * (1 + level * 0.62));
  if (state.gold < price) {
    state.townMessage = "골드가 부족합니다";
    state.townMessageTime = 1.6;
    return;
  }
  state.gold -= price;
  state.townUpgrades[item.levelKey] = level + 1;
  item.apply();
  levelUp();
  state.townMessage = `${item.name} 완료`;
  state.townMessageTime = 2.2;
  state.questPulse = 1;
}

function acceptTownContract(contract) {
  if (state.townContracts.includes(contract.id)) {
    state.townMessage = "이미 진행 중인 의뢰입니다";
    state.townMessageTime = 1.6;
    return;
  }
  if (contractProgress(contract) >= contract.target) {
    state.townMessage = "이미 조건을 달성했습니다. 전투 중 보상이 정산됩니다";
    state.townMessageTime = 1.8;
  }
  state.townContracts.push(contract.id);
  state.townMessage = `${contract.name} 수락`;
  state.townMessageTime = 2.1;
  checkTownContracts();
}

function syncStageForWave() {
  const nextIndex = (floorNumber() - 1) % stages.length;
  if (nextIndex !== state.stageIndex) {
    state.stageIndex = nextIndex;
    state.stageIntro = 1.9;
    state.message = `${stageCode()} ${currentStage().name.toUpperCase()}`;
    state.messageTime = 2;
    state.powerFlash = Math.max(state.powerFlash, 0.2);
    state.shockwave = Math.max(state.shockwave, 0.45);
    state.shake = Math.max(state.shake, 4);
  }
}

function advanceStage() {
  addQuestProgress("stageClears", 1);
  state.wave += 1;
  syncStageForWave();
  state.stageIntro = 1.75;
  state.nextStageKills = state.kills + KILLS_PER_STAGE;
  enemies.length = 0;
  hazards.length = 0;
  if (isBossStage()) {
    spawnBoss();
  } else {
    state.message = `STAGE ${stageCode()}`;
    state.messageTime = 1.8;
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
    castAnim: 0,
    attackTell: rand(0.4, 1.2),
    knockX: 0,
    knockY: 0,
    walkAnim: rand(0, 10),
    moving: false,
    pulse: rand(0, 9),
  });
}

function spawnBoss() {
  state.bossMode = true;
  const stage = currentStage();
  const floor = floorNumber();
  const floorBonus = Math.min(0.32, (floor - 1) * 0.035);
  const bossScale = (stage.bossScale || 1.45) + 0.72 + floorBonus;
  const bossHp = Math.floor((2600 + state.wave * 260) * (1 + state.stageIndex * 0.16 + floorBonus));
  const bounds = bossSafeBounds(bossScale);
  state.message = `${stageCode()} RAID START - ${stage.bossTitle || stage.bossName || "FLOOR LORD"}`;
  state.messageTime = 3;
  state.raidIntro = 3.4;
  state.powerFlash = Math.max(state.powerFlash, 0.75);
  state.shockwave = 1;
  state.shake = Math.max(state.shake, 22);
  player.hp = player.maxHp;
  player.mp = player.maxMp;
  player.invuln = Math.max(player.invuln, 1.8);
  enemies.length = 0;
  enemies.push({
    kind: "boss",
    raidLord: true,
    stageIndex: state.stageIndex,
    floor,
    stageCode: stageCode(),
    bossScale,
    x: clamp(W * 0.54, bounds.minX, bounds.maxX),
    y: clamp(H * 0.34, bounds.minY, bounds.maxY),
    r: Math.floor(58 * bossScale),
    hitRadius: 48,
    hp: bossHp,
    maxHp: bossHp,
    atk: Math.floor((10 + state.wave * 1.15) * (1 + floorBonus)),
    speed: Math.max(10, 18 - floorBonus * 10),
    hit: 0,
    attackAnim: 0,
    castAnim: 0,
    attackTell: 1.1,
    knockX: 0,
    knockY: 0,
    walkAnim: 0,
    moving: false,
    pulse: 0,
    pattern: 3.6,
  });
}

function addParticle(x, y, color, amount = 10, power = 1) {
  const budget = particles.length > 300 ? 0.28 : particles.length > 220 ? 0.5 : 1;
  const count = Math.max(1, Math.floor(amount * budget));
  for (let i = 0; i < count; i += 1) {
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
  const budget = particles.length > 300 ? 0.25 : particles.length > 220 ? 0.45 : 1;
  const count = Math.max(1, Math.floor(amount * budget));
  for (let i = 0; i < count; i += 1) {
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
  const fxIndex = { nova: 0, lance: 5, rift: 2, storm: 4, meteor: 3, blink: 5, thunder: 1, inferno: 3 }[skillId] ?? 7;
  hazards.push({
    type: "skillAura",
    x,
    y,
    radius,
    life,
    max: life,
    palette,
    fxIndex,
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

function damageEnemy(enemy, amount, color = "#fff2a5", sourceX = player.x, sourceY = player.y, options = {}) {
  if (enemy.dead) return;
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
  const impactScale = options.impactScale ?? 1;
  state.shake = Math.max(state.shake, (crit ? 14 : heavy ? 9 : 5) * impactScale);
  if (!options.noHitStop) state.hitStop = Math.max(state.hitStop, (crit ? 0.075 : heavy ? 0.045 : 0.025) * impactScale);
  if (!options.noFlash) state.powerFlash = Math.max(state.powerFlash, (crit ? 0.42 : 0.24) * impactScale);
  if (!options.noShockwave) state.shockwave = Math.max(state.shockwave, (crit ? 1 : 0.55) * impactScale);
  playSfx(crit ? "crit" : "hit");
  if (enemy.hp <= 0) {
    enemy.dead = true;
    enemy.hp = 0;
    const gain = enemy.kind === "boss" ? 160 : enemy.kind === "elite" ? 36 : 18;
    player.exp += gain;
    state.gold += enemy.kind === "boss" ? 90 : enemy.kind === "elite" ? 14 : 6;
    state.score += gain * 5;
    state.kills += 1;
    addQuestProgress("kills", 1);
    if (enemy.kind === "elite") addQuestProgress("elites", 1);
    if (enemy.kind === "boss") addQuestProgress("bosses", 1);
    pickups.push({ x: enemy.x, y: enemy.y, life: 1.3, value: gain });
    spawnLoot(enemy.x, enemy.y, enemy.kind);
    addParticle(enemy.x, enemy.y, enemy.kind === "boss" ? "#95ff70" : "#ffd965", enemy.kind === "boss" ? 42 : 16, 1.15);
    if (enemy.kind === "boss") {
      spawnCoreFragmentDrop(enemy);
      state.bossMode = false;
      state.lootFlash = 2;
      player.hp = Math.min(player.maxHp, player.hp + 42);
      player.mp = player.maxMp;
      advanceStage();
    }
  }
}

function spawnCoreFragmentDrop(enemy) {
  const stage = stages[(enemy.stageIndex ?? state.stageIndex) % stages.length];
  const fragment = coreFragments[(enemy.stageIndex ?? state.stageIndex) % coreFragments.length];
  if (!fragment || state.collectedFragments.includes(fragment.id)) return;
  lootDrops.push({
    x: enemy.x,
    y: enemy.y - enemy.r * 0.4,
    vx: 0,
    vy: -220,
    life: 5,
    age: 0,
    icon: fragment.icon,
    value: 0,
    spin: 0,
    scale: 1.65,
    picked: false,
    rarity: fragment.color || stage.enemyColor,
    type: "coreFragment",
    fragmentId: fragment.id,
  });
  state.message = "CORE FRAGMENT DROPPED";
  state.messageTime = 2.3;
  state.powerFlash = Math.max(state.powerFlash, 0.72);
  state.shockwave = 1;
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

function nearestEnemyFrom(x, y) {
  let best = null;
  let bestD = Infinity;
  for (const e of enemies) {
    if (e.dead) continue;
    const d = dist(x, y, e.x, e.y);
    if (d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return { enemy: best, d: bestD };
}

function castSupportSkill(unit, targetInfo, isPet = false) {
  if ((unit.specialCd || 0) > 0) return false;
  if (unit.id === "aria") {
    const alliesNeedHelp = player.hp < player.maxHp * 0.9;
    const nearbyEnemies = enemiesInRange(player.x, player.y, 170);
    if (!alliesNeedHelp && nearbyEnemies.length < 3) return false;
    const heal = Math.floor(player.maxHp * (player.hp < player.maxHp * 0.55 ? 0.18 : 0.1) + 16);
    player.hp = Math.min(player.maxHp, player.hp + heal);
    unit.specialCd = unit.maxSpecialCd;
    unit.action = 0.62;
    unit.castAnim = 0.62;
    state.partyBarrier = Math.max(state.partyBarrier, 1.2);
    state.comboText = "ARIA SANCTUARY";
    state.comboTime = 0.9;
    hits.push({ x: player.x, y: player.y - 54, vx: 0, vy: -82, text: `+${heal}`, life: 1.05, max: 1.05, color: "#7dffb0", crit: false, spin: 0, playerHit: false });
    hazards.push({ type: "allySanctuary", x: player.x, y: player.y, life: 0.92, max: 0.92, maxR: 168, color: unit.color });
    hazards.push({ type: "friendlyRing", x: player.x, y: player.y, r: 20, maxR: 156, life: 0.62, color: unit.color });
    for (const e of nearbyEnemies) {
      damageEnemy(e, player.atk * 0.72 + rand(4, 12), unit.color, unit.x, unit.y);
    }
    addPrismaticBurst(player.x, player.y - 28, [unit.color, "#ffffff", "#7dffb0", "#ffd965"], 28, 0.8);
    return true;
  }

  if (unit.id === "ren") {
    const targets = enemies
      .filter((e) => !e.dead && dist(unit.x, unit.y, e.x, e.y) <= 320)
      .sort((a, b) => dist(unit.x, unit.y, a.x, a.y) - dist(unit.x, unit.y, b.x, b.y))
      .slice(0, 4);
    if (!targets.length) return false;
    unit.specialCd = unit.maxSpecialCd;
    unit.action = 0.66;
    state.partyBarrier = Math.max(state.partyBarrier, 2.1);
    state.comboText = "REN BLADE RUSH";
    state.comboTime = 0.9;
    let fromX = unit.x;
    let fromY = unit.y - 20;
    targets.forEach((target, i) => {
      hazards.push({ type: "blinkLine", x1: fromX, y1: fromY, x2: target.x, y2: target.y - target.r * 0.25, life: 0.36 + i * 0.04, max: 0.36 + i * 0.04, color: unit.color });
      hazards.push({ type: "impact", x: target.x, y: target.y - target.r * 0.1, life: 0.42, max: 0.42, color: unit.color, crit: i === 0, heavy: true });
      projectiles.push({ type: "allySlash", x: fromX, y: fromY, tx: target.x, ty: target.y - target.r * 0.3, life: 0.24 + i * 0.03, max: 0.24 + i * 0.03, color: unit.color });
      damageEnemy(target, player.atk * 1.55 + rand(8, 20), unit.color, fromX, fromY);
      fromX = target.x;
      fromY = target.y - target.r * 0.3;
    });
    unit.x = clamp(fromX - 24, 38, W - 38);
    unit.y = clamp(fromY + 34, 150, H - 135);
    hazards.push({ type: "friendlyRing", x: player.x, y: player.y, r: 22, maxR: 116, life: 0.48, color: unit.color });
    state.shake = Math.max(state.shake, 8);
    return true;
  }

  if (unit.id === "bran") {
    const nearbyEnemies = enemiesInRange(player.x, player.y, 210);
    if (!nearbyEnemies.length && player.hp > player.maxHp * 0.72) return false;
    unit.specialCd = unit.maxSpecialCd;
    unit.action = 0.7;
    unit.castAnim = 0.54;
    state.partyBarrier = Math.max(state.partyBarrier, 3.2);
    state.comboText = "BRAN GUARDIAN WALL";
    state.comboTime = 1;
    hazards.push({ type: "allyGuardianWall", x: player.x, y: player.y, life: 0.92, max: 0.92, maxR: 178, color: unit.color });
    hazards.push({ type: "friendlyRing", x: player.x, y: player.y, r: 26, maxR: 174, life: 0.62, color: unit.color });
    nearbyEnemies.forEach((e) => {
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const d = Math.hypot(dx, dy) || 1;
      e.knockX += (dx / d) * (e.kind === "boss" ? 120 : 360);
      e.knockY += (dy / d) * (e.kind === "boss" ? 120 : 360);
      e.attackAnim = Math.max(e.attackAnim || 0, 0.25);
      damageEnemy(e, player.atk * 0.62 + rand(4, 10), unit.color, unit.x, unit.y);
    });
    hits.push({ x: player.x, y: player.y - 68, vx: 0, vy: -76, text: "GUARD", life: 0.95, max: 0.95, color: unit.color, crit: false, spin: 0, playerHit: false });
    addPrismaticBurst(player.x, player.y - 18, [unit.color, "#ffffff", "#ffd965"], 30, 0.9);
    state.shake = Math.max(state.shake, 7);
    return true;
  }

  if (isPet) {
    const target = targetInfo.enemy;
    if (!target || targetInfo.d > unit.range + 70) return false;
    unit.specialCd = unit.maxSpecialCd;
    unit.action = 0.55;
    state.comboText = player.mounted ? "MOUNT CORE BURST" : "LUMI CORE BURST";
    state.comboTime = 0.85;
    const cx = target.x;
    const cy = target.y - target.r * 0.2;
    projectiles.push({ type: "petBolt", x: unit.x, y: unit.y - 18, tx: cx, ty: cy, life: 0.24, max: 0.24, color: unit.color });
    hazards.push({ type: "allyCoreBurst", x: cx, y: cy, life: 0.62, max: 0.62, maxR: 118, color: unit.color });
    for (const e of enemiesInRange(cx, cy, 128)) {
      damageEnemy(e, player.atk * 1.2 + rand(8, 18), unit.color, unit.x, unit.y);
    }
    addPrismaticBurst(cx, cy, [unit.color, "#ffffff", "#57dfff", "#ffd965"], 24, 0.85);
    state.shake = Math.max(state.shake, 6);
    return true;
  }
  return false;
}

function updateSupportUnit(unit, dt, index, isPet = false) {
  unit.pulse += dt;
  const angle = state.t * (isPet ? 1.8 : 0.72) + index * Math.PI * 0.82;
  const followRadius = isPet ? 58 : 48 + index * 22;
  const targetX = player.x + Math.cos(angle) * followRadius + (isPet ? 0 : (index === 0 ? -34 : 34));
  const targetY = player.y + Math.sin(angle) * followRadius * 0.34 + (isPet ? -58 : 34 + index * 16);
  const beforeX = unit.x;
  const beforeY = unit.y;
  unit.x += (targetX - unit.x) * Math.min(1, dt * (isPet ? 5.5 : 4.2));
  unit.y += (targetY - unit.y) * Math.min(1, dt * (isPet ? 5.8 : 4.0));
  unit.moving = Math.hypot(unit.x - beforeX, unit.y - beforeY) > 0.18;
  if (unit.moving) unit.walkAnim = (unit.walkAnim || 0) + dt * (isPet ? 8 : 9.5);
  unit.cd = Math.max(0, unit.cd - dt);
  unit.specialCd = Math.max(0, (unit.specialCd || 0) - dt);
  unit.action = Math.max(0, unit.action - dt);
  unit.castAnim = Math.max(0, (unit.castAnim || 0) - dt);
  unit.hurtAnim = Math.max(0, (unit.hurtAnim || 0) - dt);
  if (unit.healCd) unit.healCd = Math.max(0, unit.healCd - dt);

  if (unit.id === "aria" && unit.healCd <= 0 && player.hp < player.maxHp * 0.52) {
    const heal = Math.floor(player.maxHp * 0.2 + 18);
    player.hp = Math.min(player.maxHp, player.hp + heal);
    unit.healCd = 6.5;
    unit.action = 0.45;
    unit.castAnim = 0.48;
    hits.push({ x: player.x, y: player.y - 46, vx: 0, vy: -72, text: `+${heal}`, life: 0.95, max: 0.95, color: "#7dffb0", crit: false, spin: 0, playerHit: false });
    hazards.push({ type: "friendlyRing", x: player.x, y: player.y, r: 20, maxR: 96, life: 0.5, color: unit.color });
    return;
  }

  const target = nearestEnemyFrom(unit.x, unit.y);
  if (castSupportSkill(unit, target, isPet)) {
    addQuestProgress("partyAssists", 1);
    return;
  }
  if (!target.enemy || target.d > unit.range || unit.cd > 0) return;
  unit.cd = unit.maxCd;
  unit.action = 0.38;
  unit.castAnim = unit.id === "aria" ? 0.42 : 0;
  const damage = player.atk * unit.power + rand(4, isPet ? 10 : 18);
  if (unit.id === "bran") {
    state.partyBarrier = Math.max(state.partyBarrier, 0.9);
    hazards.push({ type: "allyShieldBash", x: unit.x, y: unit.y - 20, tx: target.enemy.x, ty: target.enemy.y - target.enemy.r * 0.3, life: 0.26, max: 0.26, color: unit.color });
  }
  if (unit.id === "ren") {
    state.partyBarrier = Math.max(state.partyBarrier, 1.35);
    hazards.push({ type: "friendlyRing", x: player.x, y: player.y, r: 24, maxR: 118, life: 0.42, color: unit.color });
  }
  damageEnemy(target.enemy, damage, unit.color, unit.x, unit.y);
  projectiles.push({
    type: isPet ? "petBolt" : unit.id === "ren" ? "allySlash" : "allyBolt",
    x: unit.x,
    y: unit.y - (isPet ? 12 : 24),
    tx: target.enemy.x,
    ty: target.enemy.y - target.enemy.r * 0.3,
    life: 0.28,
    max: 0.28,
    color: unit.color,
  });
}

function updateParty(dt) {
  partyMembers.forEach((member, i) => updateSupportUnit(member, dt, i, false));
  if (player.mounted) {
    pet.x += (player.x - pet.x) * Math.min(1, dt * 10);
    pet.y += (player.y - 52 - pet.y) * Math.min(1, dt * 10);
    pet.cd = Math.max(0, pet.cd - dt);
    pet.specialCd = Math.max(0, (pet.specialCd || 0) - dt);
    pet.action = Math.max(0, pet.action - dt);
    pet.pulse += dt;
    const target = nearestEnemyFrom(player.x, player.y);
    if (castSupportSkill(pet, target, true)) {
      addQuestProgress("partyAssists", 1);
      return;
    }
    if (target.enemy && target.d <= pet.range + 50 && pet.cd <= 0) {
      pet.cd = pet.maxCd * 0.82;
      pet.action = 0.42;
      damageEnemy(target.enemy, player.atk * 0.72 + rand(8, 18), pet.color, player.x, player.y - 48);
      projectiles.push({ type: "petBolt", x: player.x, y: player.y - 72, tx: target.enemy.x, ty: target.enemy.y - target.enemy.r * 0.35, life: 0.25, max: 0.25, color: pet.color });
    }
    return;
  }
  updateSupportUnit(pet, dt, 2, true);
}

function toggleMount() {
  if (player.hp <= 0 || player.mountToggleCd > 0) return;
  player.mounted = !player.mounted;
  player.mountToggleCd = 0.55;
  player.mountAnim = 0.55;
  player.castAnim = Math.max(player.castAnim, 0.36);
  player.castColor = pet.color;
  state.message = player.mounted ? "LUMI RIDING" : "DISMOUNT";
  state.messageTime = 1.1;
  state.powerFlash = Math.max(state.powerFlash, 0.26);
  hazards.push({ type: "friendlyRing", x: player.x, y: player.y, r: 22, maxR: player.mounted ? 128 : 90, life: 0.48, color: pet.color });
  addParticle(player.x, player.y - 30, pet.color, 28, 1.05);
}

function blinkTargets(originX, originY) {
  return enemies
    .slice()
    .sort((a, b) => dist(originX, originY, a.x, a.y) - dist(originX, originY, b.x, b.y))
    .slice(0, 7);
}

function effectLoad() {
  return hazards.length + projectiles.length * 1.4 + particles.length / 12 + hits.length / 8;
}

function heavySkillActive() {
  return hazards.some((h) => h.type === "blinkDance" || h.type === "ultimate" || h.type === "thunderStorm" || h.type === "infernoField");
}

function isHeavySkill(id) {
  return id === "blink" || id === "thunder" || id === "inferno";
}

function autoCastSkills(dt) {
  if (player.hp <= 0 || enemies.length === 0) return;
  state.autoSkillTimer -= dt;
  state.ultimateCharge = Math.min(100, state.ultimateCharge + dt * 5 + enemies.length * dt * 0.7);
  if (heavySkillActive() || effectLoad() > 105) {
    state.autoSkillTimer = Math.max(state.autoSkillTimer, 0.18);
    return;
  }
  if (state.ultimateCharge >= 100) {
    state.ultimateCharge = 0;
    castUltimate();
    return;
  }
  if (state.autoSkillTimer > 0) return;
  state.autoSkillTimer = rand(0.72, 1.15);
  const ready = skills
    .map((skill, index) => ({ skill, index }))
    .filter(({ skill }) => skill.cd <= 0 && player.mp >= skill.cost);
  if (ready.length === 0) return;
  ready.sort((a, b) => b.skill.cost - a.skill.cost);
  castSkill(ready[0].index);
}

function castUltimate() {
  playSfx("ultimate");
  addQuestProgress("skills", 1);
  const target = nearestEnemy().enemy || { x: W / 2, y: H * 0.42 };
  player.castAnim = 0.7;
  player.attackAnim = 0.58;
  player.castColor = "#ffffff";
  state.message = "CELESTIAL OVERDRIVE";
  state.messageTime = 1.4;
  state.powerFlash = 0.75;
  state.shockwave = 1;
  state.shake = Math.max(state.shake, 16);
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
  if (isHeavySkill(s.id) && (heavySkillActive() || effectLoad() > 115)) {
    state.autoSkillTimer = Math.max(state.autoSkillTimer, 0.24);
    return;
  }
  playSfx(s.id === "meteor" ? "meteor" : s.id === "lance" ? "slash" : "spell");
  addQuestProgress("skills", 1);
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
      state.powerFlash = Math.max(state.powerFlash, 0.12);
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
    state.shake = Math.max(state.shake, 9);
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
    state.shake = Math.max(state.shake, 10);
  }
}

function update(dt) {
  state.t += dt;
  if (particles.length > 320) particles.splice(0, particles.length - 320);
  if (hazards.length > 44) hazards.splice(0, hazards.length - 44);
  if (hits.length > 96) hits.splice(0, hits.length - 96);
  if (lootDrops.length > 80) lootDrops.splice(0, lootDrops.length - 80);
  if (projectiles.length > 36) projectiles.splice(0, projectiles.length - 36);
  if (!Number.isFinite(state.hitStop)) state.hitStop = 0;
  if (state.hitStop > 0.055) state.hitStop = 0.055;
  if (state.hitStop > 0) {
    state.hitStop = Math.max(0, state.hitStop - dt);
    state.powerFlash = Math.max(0, state.powerFlash - dt * 1.8);
    state.shockwave = Math.max(0, state.shockwave - dt * 2.4);
    return;
  }
  state.messageTime = Math.max(0, state.messageTime - dt);
  state.stageIntro = Math.max(0, state.stageIntro - dt);
  state.raidIntro = Math.max(0, state.raidIntro - dt);
  state.comboTime = Math.max(0, state.comboTime - dt);
  state.questToastTime = Math.max(0, state.questToastTime - dt);
  state.questPulse = Math.max(0, state.questPulse - dt * 1.8);
  state.shake = Math.max(0, state.shake - dt * 24);
  state.lootFlash = Math.max(0, state.lootFlash - dt);
  state.powerFlash = Math.max(0, state.powerFlash - dt * 1.8);
  state.shockwave = Math.max(0, state.shockwave - dt * 2.4);
  state.partyBarrier = Math.max(0, state.partyBarrier - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  player.slashCd = Math.max(0, player.slashCd - dt);
  player.attackAnim = Math.max(0, player.attackAnim - dt);
  player.castAnim = Math.max(0, player.castAnim - dt);
  player.hurtAnim = Math.max(0, player.hurtAnim - dt);
  player.footstepTimer = Math.max(0, player.footstepTimer - dt);
  player.mountAnim = Math.max(0, player.mountAnim - dt);
  player.mountToggleCd = Math.max(0, player.mountToggleCd - dt);
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
    const moveSpeed = player.speed * (player.mounted ? 1.38 : 1);
    player.x += moveX * moveSpeed * dt;
    player.y += moveY * moveSpeed * dt;
    player.targetX = player.x;
    player.targetY = player.y;
    player.facing = Math.atan2(moveY, moveX);
    player.stepAnim += dt * (player.mounted ? 23 : 14);
    player.isMoving = true;
    if (player.mounted && player.footstepTimer <= 0) {
      player.footstepTimer = 0.075;
      hazards.push({ type: "mountTrail", x: player.x - Math.cos(player.facing) * 38, y: player.y + 20 - Math.sin(player.facing) * 14, angle: player.facing, life: 0.42, max: 0.42, color: pet.color });
    }
  } else {
    const dx = player.targetX - player.x;
    const dy = player.targetY - player.y;
    const md = Math.hypot(dx, dy);
    if (md > 2) {
      const moveSpeed = player.speed * (player.mounted ? 1.38 : 1);
      const step = Math.min(md, moveSpeed * dt);
      player.x += (dx / md) * step;
      player.y += (dy / md) * step;
      player.facing = Math.atan2(dy, dx);
      player.stepAnim += dt * (player.mounted ? 21 : 12);
      player.isMoving = true;
    }
  }
  player.movePower += ((player.isMoving ? 1 : 0) - player.movePower) * Math.min(1, dt * 12);
  if (player.isMoving && player.footstepTimer <= 0) {
    player.footstepTimer = player.mounted ? 0.075 : 0.115;
    const side = Math.sin(player.stepAnim) > 0 ? 1 : -1;
    const backX = player.x - Math.cos(player.facing) * 18;
    const backY = player.y - Math.sin(player.facing) * 12 + 22;
    const sideX = Math.cos(player.facing + Math.PI / 2) * side * 11;
    const sideY = Math.sin(player.facing + Math.PI / 2) * side * 7;
    hazards.push({ type: player.mounted ? "mountTrail" : "dust", x: backX + sideX + rand(-3, 3), y: backY + sideY + rand(-2, 2), angle: player.facing, life: player.mounted ? 0.48 : 0.46, max: player.mounted ? 0.48 : 0.46, color: player.mounted ? pet.color : "#d7c68b" });
  }
  player.x = clamp(player.x, 38, W - 38);
  player.y = clamp(player.y, 150, H - 135);
  updateParty(dt);

  if (state.bossMode && !enemies.some((e) => e.kind === "boss")) {
    state.bossMode = false;
  }

  if (!state.bossMode && !isBossStage() && state.kills >= state.nextStageKills && !enemies.some((e) => e.kind === "boss")) {
    advanceStage();
  }

  if (!state.bossMode && isBossStage() && !enemies.some((e) => e.kind === "boss")) {
    spawnBoss();
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
    e.castAnim = Math.max(0, (e.castAnim || 0) - dt);
    e.attackTell = Math.max(0, (e.attackTell || 0) - dt);
    e.pulse += dt;
    if (e.kind === "boss") {
      e.pattern -= dt;
      if (e.pattern <= 0) {
        e.pattern = rand(4.2, 6.2);
        e.castAnim = 1.05;
        e.attackAnim = Math.max(e.attackAnim, 0.74);
        hazards.push({ type: "danger", x: player.x + rand(-42, 42), y: player.y + rand(-42, 42), r: 18, maxR: 72, life: 1.35, armed: 0.86, color: "#ff3d4f" });
        hazards.push({ type: "bossCast", x: e.x, y: e.y, life: 0.9, max: 0.9, color: currentStage().enemyColor, radius: Math.min(220, 92 + e.r * 0.86) });
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
    if (e.kind === "boss") {
      clampBossPosition(e);
    } else {
      e.x = clamp(e.x, 28, W - 28);
      e.y = clamp(e.y, 150, H - 132);
    }
    e.moving = Math.hypot(e.x - beforeX, e.y - beforeY) > 0.25;
    if (e.moving) e.walkAnim += dt * (e.kind === "boss" ? 5.5 : 10);
    e.knockX *= Math.pow(0.035, dt);
    e.knockY *= Math.pow(0.035, dt);
    const contactRadius = e.kind === "boss" ? e.hitRadius || 48 : e.r;
    if (e.kind !== "boss" && d < contactRadius + player.r + 42 && e.attackTell <= 0) {
      e.attackTell = e.kind === "elite" ? rand(0.72, 1.08) : rand(0.9, 1.34);
      e.attackAnim = Math.max(e.attackAnim, e.kind === "elite" ? 0.5 : 0.42);
      hazards.push({ type: "enemySwipe", x: e.x, y: e.y - e.r * 0.15, angle: Math.atan2(player.y - e.y, player.x - e.x), life: 0.32, max: 0.32, color: e.kind === "elite" ? "#d66bff" : currentStage().enemyColor, boss: false });
    }
    if (d < contactRadius + player.r + 4 && player.invuln <= 0) {
      const taken = state.partyBarrier > 0 ? Math.ceil(e.atk * 0.48) : e.atk;
      player.hp -= taken;
      player.invuln = 0.55;
      player.hurtAnim = 0.38;
      e.attackAnim = e.kind === "boss" ? 0.72 : 0.5;
      e.castAnim = e.kind === "boss" ? Math.max(e.castAnim || 0, 0.45) : e.castAnim;
      e.attackTell = e.kind === "boss" ? 0.85 : 0.62;
      state.shake = e.kind === "boss" ? 9 : 5;
      hits.push({ x: player.x, y: player.y - 24, vx: rand(-12, 12), vy: -86, text: `-${taken}`, life: 0.75, max: 0.75, color: state.partyBarrier > 0 ? "#ffd965" : "#ff7184", crit: false, spin: rand(-0.12, 0.12), playerHit: true });
      hazards.push({ type: "impact", x: player.x, y: player.y - 4, life: 0.32, max: 0.32, color: "#ff7184", crit: false });
      hazards.push({ type: "enemySwipe", x: e.x, y: e.y - e.r * 0.15, angle: Math.atan2(player.y - e.y, player.x - e.x), life: e.kind === "boss" ? 0.5 : 0.34, max: e.kind === "boss" ? 0.5 : 0.34, color: e.kind === "boss" ? currentStage().enemyColor : "#ff7184", boss: e.kind === "boss" });
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
      state.shake = Math.max(state.shake, 10);
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
          damageEnemy(target, player.atk * 2.8 + rand(15, 32), "#ffffff", h.prevX, h.prevY, { noHitStop: true, noFlash: true, noShockwave: true, impactScale: 0.42 });
          h.prevX = player.x;
          h.prevY = player.y;
          state.shake = Math.max(state.shake, 4);
        }
        h.index += 1;
        h.timer = 0.115;
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
      h.r = h.maxR * (1 - h.life / h.max);
      if (h.life < h.armed && !h.done) {
        h.done = true;
        addParticle(h.x, h.y, "#ff475c", 30, 1.2);
        if (dist(player.x, player.y, h.x, h.y) < h.maxR && player.invuln <= 0) {
          const baseDamage = 12 + Math.floor(state.wave * 0.8);
          player.hp -= state.partyBarrier > 0 ? Math.ceil(baseDamage * 0.5) : baseDamage;
          player.invuln = 1.05;
          state.shake = 7;
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
        if (loot.type === "coreFragment") {
          const fragment = coreFragments.find((f) => f.id === loot.fragmentId);
          if (fragment && !state.collectedFragments.includes(fragment.id)) {
            state.collectedFragments.push(fragment.id);
            state.comboText = "CORE FRAGMENT ACQUIRED";
            state.comboTime = 2.2;
            state.message = fragment.name;
            state.messageTime = 2.4;
            state.lootFlash = 2.2;
            state.powerFlash = Math.max(state.powerFlash, 0.55);
            addPrismaticBurst(player.x, player.y - 40, [fragment.color, "#ffffff", "#ffd965", "#57dfff"], 46, 1.3);
            addQuestProgress("fragments", 1);
          }
        } else if (loot.icon === 0) {
          state.gold += loot.value;
          addQuestProgress("loot", 1);
          addQuestProgress("goldEarned", loot.value);
        } else {
          const goldValue = Math.floor(loot.value * 0.5);
          state.gold += goldValue;
          addQuestProgress("loot", 1);
          addQuestProgress("goldEarned", goldValue);
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
  const sxScale = img.logicalWidth ? img.naturalWidth / img.logicalWidth : 1;
  const syScale = img.logicalHeight ? img.naturalHeight / img.logicalHeight : sxScale;
  const logicalWidth = img.logicalWidth || img.naturalWidth;
  if ((index + 1) * frameW > logicalWidth) return false;
  const sx = (index * frameW + SPRITE_BLEED) * sxScale;
  const sy = SPRITE_BLEED * syScale;
  const sw = (frameW - SPRITE_BLEED * 2) * sxScale;
  const sh = (frameH - SPRITE_BLEED * 2) * syScale;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  return true;
}

function drawUiTile(index, x, y, w, h, alpha = 1) {
  const img = sprites.uiFantasy;
  if (!img.complete || img.naturalWidth <= 0) return false;
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawAtlas(img, index, 160, 160, x, y, w, h);
  ctx.restore();
  return true;
}

function drawUiFrame(index, x, y, w, h, alpha = 1, slice = 44) {
  const img = sprites.uiFantasy;
  if (!img.complete || img.naturalWidth <= 0) return false;
  const fw = 160;
  const fh = 160;
  const sx = index * fw;
  const sy = 0;
  const s = Math.min(slice, fw / 2 - 1, fh / 2 - 1);
  const dw = Math.min(s, w / 2);
  const dh = Math.min(s, h / 2);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.drawImage(img, sx, sy, s, s, x, y, dw, dh);
  ctx.drawImage(img, sx + fw - s, sy, s, s, x + w - dw, y, dw, dh);
  ctx.drawImage(img, sx, sy + fh - s, s, s, x, y + h - dh, dw, dh);
  ctx.drawImage(img, sx + fw - s, sy + fh - s, s, s, x + w - dw, y + h - dh, dw, dh);
  ctx.drawImage(img, sx + s, sy, fw - s * 2, s, x + dw, y, Math.max(0, w - dw * 2), dh);
  ctx.drawImage(img, sx + s, sy + fh - s, fw - s * 2, s, x + dw, y + h - dh, Math.max(0, w - dw * 2), dh);
  ctx.drawImage(img, sx, sy + s, s, fh - s * 2, x, y + dh, dw, Math.max(0, h - dh * 2));
  ctx.drawImage(img, sx + fw - s, sy + s, s, fh - s * 2, x + w - dw, y + dh, dw, Math.max(0, h - dh * 2));
  ctx.drawImage(img, sx + s, sy + s, fw - s * 2, fh - s * 2, x + dw, y + dh, Math.max(0, w - dw * 2), Math.max(0, h - dh * 2));
  ctx.restore();
  return true;
}

function drawCombatFx(index, x, y, size, rotation = 0, alpha = 1, scaleY = 1) {
  const img = sprites.magicFx;
  if (!img.complete || img.naturalWidth <= 0) return false;
  if (effectLoad() > 130 && size > 230) return false;
  const frameW = 256;
  const frameH = 256;
  const sxScale = img.logicalWidth ? img.naturalWidth / img.logicalWidth : 1;
  const syScale = img.logicalHeight ? img.naturalHeight / img.logicalHeight : sxScale;
  const sx = ((index % 8) * frameW + SPRITE_BLEED) * sxScale;
  const sy = SPRITE_BLEED * syScale;
  const sw = (frameW - SPRITE_BLEED * 2) * sxScale;
  const sh = (frameH - SPRITE_BLEED * 2) * syScale;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha * 0.74;
  ctx.drawImage(img, sx, sy, sw, sh, -size / 2, (-size * scaleY) / 2, size, size * scaleY);
  ctx.restore();
  return true;
}

function drawFxSheetFrame(img, frame, frameW, frameH, x, y, w, h, alpha = 1, rotation = 0, scaleY = 1) {
  if (!img.complete || img.naturalWidth <= 0) return false;
  const frameCount = Math.max(1, Math.floor(img.naturalWidth / frameW));
  const sx = clamp(frame, 0, frameCount - 1) * frameW;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha *= alpha;
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(img, sx, 0, frameW, frameH, -w / 2, (-h * scaleY) / 2, w, h * scaleY);
  ctx.restore();
  return true;
}

function drawImageRect(img, src, x, y, w, h, alpha = 1, logicalSize = 1254) {
  if (!img.complete || img.naturalWidth <= 0 || !src) return false;
  const sxScale = img.naturalWidth / logicalSize;
  const syScale = img.naturalHeight / logicalSize;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.drawImage(img, src[0] * sxScale, src[1] * syScale, src[2] * sxScale, src[3] * syScale, x, y, w, h);
  ctx.restore();
  return true;
}

function drawImageCover(img, x, y, w, h, alpha = 1) {
  if (!img.complete || img.naturalWidth <= 0) return false;
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) * 0.5;
  const sy = (img.naturalHeight - sh) * 0.5;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
  return true;
}

function drawLogicalSubImage(img, sx, sy, sw, sh, dx, dy, dw, dh, alpha = 1) {
  if (!img.complete || img.naturalWidth <= 0) return false;
  const sxScale = img.logicalWidth ? img.naturalWidth / img.logicalWidth : 1;
  const syScale = img.logicalHeight ? img.naturalHeight / img.logicalHeight : sxScale;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.drawImage(img, sx * sxScale, sy * syScale, sw * sxScale, sh * syScale, dx, dy, dw, dh);
  ctx.restore();
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
  ctx.save();
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
  const bossStageIndex = boss ? (e.stageIndex ?? state.stageIndex) % stages.length : state.stageIndex;
  const sprite = boss ? (sprites.bossSprites?.[bossStageIndex] || sprites.boss) : sprites[e.kind] || sprites.shade;
  const sheet = boss ? sprites.floorLordSheets?.[bossStageIndex] : e.kind === "elite" ? sprites.eliteSheet : sprites.shadeSheet;
  const bossScale = boss ? (e.bossScale || 1.42) : 1;
  const size = boss ? 172 * bossScale : e.kind === "elite" ? 74 : 55;
  const stage = boss ? stages[bossStageIndex] : currentStage();
  ctx.save();
  const bob = Math.sin(e.pulse * (boss ? 2.1 : 6.2)) * (boss ? 4 : 3);
  const hitJerk = e.hit > 0 ? Math.sin(e.hit * 55) * 6 : 0;
  const attackMax = boss ? 0.74 : e.kind === "elite" ? 0.5 : 0.42;
  const attackPhase = e.attackAnim > 0 ? clamp(1 - e.attackAnim / attackMax, 0, 1) : 0;
  const windup = e.attackAnim > 0 ? Math.sin(clamp(attackPhase / 0.35, 0, 1) * Math.PI) : 0;
  const strike = e.attackAnim > 0 ? Math.sin(clamp((attackPhase - 0.22) / 0.58, 0, 1) * Math.PI) : 0;
  const castPulse = (e.castAnim || 0) > 0 ? Math.sin(clamp(1 - e.castAnim / (boss ? 1.05 : 0.55), 0, 1) * Math.PI) : 0;
  const lunge = strike * (boss ? 30 : e.kind === "elite" ? 19 : 14) - windup * (boss ? 10 : 6);
  const face = Math.atan2(player.y - e.y, player.x - e.x);
  ctx.translate(e.x + Math.cos(face) * lunge + hitJerk, e.y + bob + Math.sin(face) * lunge - castPulse * (boss ? 12 : 4));
  ctx.globalAlpha = e.hit > 0 ? 0.82 : 1;
  ctx.shadowBlur = boss ? 34 + bossScale * 12 : 16;
  ctx.shadowColor = boss ? stage.enemyColor : e.kind === "elite" ? "#d66bff" : stage.enemyColor;
  const hurtSquash = e.hit > 0 ? Math.sin(e.hit * 35) * 0.12 : 0;
  const pulse = Math.sin(e.pulse * 5) * 0.05 + 1 + strike * (boss ? 0.16 : 0.1) + castPulse * 0.05;
  ctx.rotate((boss ? 0.035 : 0.08) * Math.sin(e.pulse * 4) + strike * (boss ? 0.16 : 0.22) + (e.hit > 0 ? 0.12 * Math.sin(e.hit * 80) : 0));
  ctx.scale(pulse + hurtSquash + windup * 0.05, pulse - hurtSquash * 0.6 - windup * 0.06);
  ctx.fillStyle = boss ? "rgba(2, 8, 13, .52)" : "rgba(0, 0, 0, .32)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.27, size * 0.34, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  if ((e.castAnim || 0) > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.22 + castPulse * 0.5;
    ctx.strokeStyle = boss ? stage.enemyColor : "#ff7184";
    ctx.shadowBlur = boss ? 42 : 20;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.lineWidth = boss ? 6 : 3;
    ctx.rotate(-e.pulse * 1.2);
    ctx.beginPath();
    ctx.ellipse(0, boss ? -size * 0.08 : -size * 0.12, size * (boss ? 0.68 : 0.48), size * (boss ? 0.24 : 0.18), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  if (e.attackAnim > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (0.22 + strike * 0.78) * (boss ? 1 : 0.88);
    ctx.rotate(-0.34 + strike * 0.28);
    ctx.strokeStyle = boss ? stage.enemyColor : "#ff7184";
    ctx.shadowBlur = 18;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.lineWidth = boss ? 8 * bossScale : 5;
    ctx.beginPath();
    ctx.arc(18 + strike * (boss ? 26 : 12), -4, boss ? 76 * bossScale : 34, -0.95 + windup * 0.16, 0.55 + strike * 0.38);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = boss ? 3 : 2;
    ctx.beginPath();
    ctx.arc(18 + strike * (boss ? 26 : 12), -4, boss ? 76 * bossScale : 34, -0.58, 0.42 + strike * 0.28);
    ctx.stroke();
    ctx.restore();
  }
  if (boss) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.28 + Math.sin(e.pulse * 2.2) * 0.06;
    ctx.strokeStyle = stage.enemyColor;
    ctx.shadowBlur = 22;
    ctx.shadowColor = stage.enemyColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.02, size * 0.5, size * 0.23, e.pulse * 0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.02, size * 0.36, size * 0.15, -e.pulse * 0.14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.12 + Math.sin(e.pulse * 2.7) * 0.04;
    const doom = ctx.createRadialGradient(0, -size * 0.16, size * 0.18, 0, -size * 0.1, size * 0.82);
    doom.addColorStop(0, hexAlpha(stage.enemyColor, 0.42));
    doom.addColorStop(0.52, hexAlpha(stage.enemyColor, 0.13));
    doom.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = doom;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.05, size * 0.62, size * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.48;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const a = e.pulse * 0.7 + i * Math.PI * 0.5;
      ctx.strokeStyle = i % 2 ? "#ffffff" : stage.enemyColor;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * size * 0.16, -size * 0.58 + Math.sin(a) * 8);
      ctx.lineTo(Math.cos(a) * size * 0.48, -size * 0.86 + Math.sin(a) * 18);
      ctx.stroke();
    }
    ctx.restore();
  }
  const stageTint = !boss && state.stageIndex > 0
    ? stage.tint.replace(".16", ".24").replace(".18", ".24").replace(".10", ".18")
    : null;
  const hitTint = e.hit > 0 ? "rgba(255, 247, 185, .55)" : null;
  const tints = [stageTint, hitTint].filter(Boolean);
  if (sheet && sheet.complete && sheet.naturalWidth > 0) {
    let action = "idle";
    if (e.hit > 0) action = "hurt";
    else if (e.attackAnim > 0) action = "attack";
    else if (e.moving) action = "walk";
    const spec = boss ? floorLordSheet : enemySheet;
    const frame =
      action === "hurt"
        ? Math.min(5, Math.floor((1 - e.hit / 0.42) * 6))
        : action === "attack"
          ? Math.min(5, Math.floor(attackPhase * 6))
          : action === "walk"
            ? Math.floor(e.walkAnim) % 6
            : Math.floor(e.pulse * (boss ? 2.4 : 3)) % 6;
    const sx = frame * spec.frameW + SPRITE_BLEED;
    const sy = spec.rows[action] * spec.frameH + SPRITE_BLEED;
    const sw = spec.frameW - SPRITE_BLEED * 2;
    const sh = spec.frameH - SPRITE_BLEED * 2;
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
  drawBar(e.x - e.r, e.y - e.r - (boss ? 24 : 14), e.r * 2, boss ? 7 : 5, e.hp, e.maxHp, boss ? (stages[(e.stageIndex ?? state.stageIndex) % stages.length].enemyColor) : "#f3b75f");
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
    return { action: "walk", frame: Math.floor(player.stepAnim) % 6 };
  }
  return { action: "idle", frame: Math.floor(state.t * 5) % 6 };
}

function renderDirFromAngle(angle, fallback = 1) {
  const x = Math.cos(angle);
  if (Math.abs(x) < 0.18) return fallback;
  return x < 0 ? -1 : 1;
}

function drawPlayerSheetFrame(size, tint = null, direction = 1) {
  const sheet = player.mounted ? sprites.playerRidingSheet : sprites.playerSheet;
  const dir = direction < 0 ? -1 : 1;
  ctx.save();
  ctx.scale(dir, 1);
  if (!sheet.complete || sheet.naturalWidth <= 0) {
    drawSpriteCutout(sprites.player, size * 0.82, tint);
    ctx.restore();
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
  ctx.restore();
}

function drawSwordSwing(phase) {
  const windup = clamp(phase / 0.26, 0, 1);
  const strike = clamp((phase - 0.18) / 0.48, 0, 1);
  const recover = clamp((phase - 0.62) / 0.38, 0, 1);
  const eased = strike < 0.5 ? 2 * strike * strike : 1 - Math.pow(-2 * strike + 2, 2) / 2;
  const alpha = Math.sin(phase * Math.PI);
  const impact = Math.sin(clamp((phase - 0.34) / 0.32, 0, 1) * Math.PI);
  const sweepStart = -1.62 + windup * 0.18;
  const sweepEnd = 1.18 + impact * 0.16 - recover * 0.12;
  const bladeAngle = sweepStart + (sweepEnd - sweepStart) * eased + Math.sin(recover * Math.PI) * 0.12;
  const baseRotation = player.facing + Math.PI / 2;

  ctx.save();
  ctx.rotate(baseRotation);
  ctx.globalCompositeOperation = "lighter";
  ctx.save();
  ctx.globalAlpha = clamp((1 - windup) * 0.35 + impact * 0.35, 0, 0.55);
  ctx.strokeStyle = "rgba(255, 242, 165, .72)";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.arc(0, 8, 104, -1.55, -0.55 + windup * 0.22);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  ctx.save();
  ctx.filter = "blur(5px)";
  ctx.globalAlpha = alpha * 0.26 + impact * 0.18;
  ctx.fillStyle = "rgba(103, 231, 255, .58)";
  ctx.beginPath();
  ctx.ellipse(28, 8, 148 + impact * 34, 64 + impact * 14, bladeAngle * 0.16, 0, Math.PI * 2);
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

  for (let i = 0; i < 9; i += 1) {
    const trailPhase = clamp(eased - i * 0.07, 0, 1);
    const a = sweepStart + (sweepEnd - sweepStart) * trailPhase;
    const depth = 1 - i / 9;
    const radius = 88 - i * 6;
    ctx.save();
    ctx.globalAlpha = clamp(alpha * (0.82 - i * 0.07), 0, 0.82);
    ctx.shadowBlur = 26 + depth * 32;
    ctx.shadowColor = i < 2 ? "#ffffff" : i < 5 ? "#ffe070" : "#4ee8ff";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = i < 2 ? "rgba(255,255,255,.86)" : i < 5 ? "rgba(255,218,72,.55)" : "rgba(67,230,255,.38)";
    ctx.lineWidth = 28 * depth + 3 + impact * 4;
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
  for (let i = 1; i <= 4; i += 1) {
    const ghostPhase = clamp(eased - i * 0.09, 0, 1);
    const ghostAngle = sweepStart + (sweepEnd - sweepStart) * ghostPhase;
    ctx.save();
    ctx.globalAlpha = alpha * (0.2 - i * 0.026);
    ctx.strokeStyle = i % 2 ? "rgba(87,223,255,.58)" : "rgba(255,217,101,.5)";
    ctx.lineWidth = 8 - i;
    ctx.lineCap = "round";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#57dfff";
    ctx.beginPath();
    ctx.moveTo(Math.cos(ghostAngle) * 18, Math.sin(ghostAngle) * 18 + 2);
    ctx.lineTo(Math.cos(ghostAngle) * (116 - i * 7), Math.sin(ghostAngle) * (104 - i * 5) + 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.shadowBlur = 26;
  ctx.shadowColor = "#8df5ff";
  ctx.strokeStyle = "rgba(255, 255, 255, .95)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.save();
  ctx.globalAlpha = clamp(0.72 + impact * 0.28, 0, 1);
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ffd965";
  ctx.strokeStyle = "rgba(255, 229, 112, .95)";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(handX - Math.cos(bladeAngle) * 9, handY - Math.sin(bladeAngle) * 9);
  ctx.lineTo(handX + Math.cos(bladeAngle + Math.PI / 2) * 18, handY + Math.sin(bladeAngle + Math.PI / 2) * 18);
  ctx.moveTo(handX - Math.cos(bladeAngle) * 9, handY - Math.sin(bladeAngle) * 9);
  ctx.lineTo(handX + Math.cos(bladeAngle - Math.PI / 2) * 18, handY + Math.sin(bladeAngle - Math.PI / 2) * 18);
  ctx.stroke();
  ctx.fillStyle = "#fff2a5";
  ctx.beginPath();
  ctx.arc(handX, handY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
  if (impact > 0.04) {
    ctx.save();
    ctx.globalAlpha = impact * 0.72;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 32;
    ctx.shadowColor = "#ffffff";
    ctx.beginPath();
    ctx.arc(tipX, tipY, 18 + impact * 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(87,223,255,.65)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 32 + impact * 68, -0.4, Math.PI * 1.2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function companionActionFrame(unit) {
  if (unit.hurtAnim > 0) {
    return { action: "hurt", frame: Math.min(5, Math.floor((1 - unit.hurtAnim / 0.38) * 6)) };
  }
  if (unit.action > 0 && unit.id === "ren") {
    return { action: "attack", frame: Math.min(5, Math.floor((1 - unit.action / 0.38) * 6)) };
  }
  if ((unit.castAnim || 0) > 0 || (unit.action > 0 && unit.id === "aria")) {
    const span = unit.castAnim > 0 ? 0.48 : 0.38;
    const left = unit.castAnim > 0 ? unit.castAnim : unit.action;
    return { action: "cast", frame: Math.min(5, Math.floor((1 - left / span) * 6)) };
  }
  if (unit.moving) {
    return { action: "walk", frame: Math.floor(unit.walkAnim || 0) % 6 };
  }
  return { action: "idle", frame: Math.floor((state.t + unit.pulse * 0.2) * 4) % 6 };
}

function drawCompanionSheetFrame(unit, size) {
  const sheet = unit.id === "aria" ? sprites.partnerAriaSheet : unit.id === "bran" ? sprites.partnerBranSheet : sprites.partnerRenSheet;
  if (!sheet.complete || sheet.naturalWidth <= 0) return false;
  const anim = companionActionFrame(unit);
  const sx = anim.frame * playerSheet.frameW + SPRITE_BLEED;
  const sy = playerSheet.rows[anim.action] * playerSheet.frameH + SPRITE_BLEED;
  const sw = playerSheet.frameW - SPRITE_BLEED * 2;
  const sh = playerSheet.frameH - SPRITE_BLEED * 2;
  ctx.drawImage(sheet, sx, sy, sw, sh, -size / 2, -size * 0.78, size, size);
  return true;
}

function drawCompanion(unit) {
  const isPet = unit.type === "pet";
  const actionPulse = unit.action > 0 ? Math.sin((1 - unit.action / 0.45) * Math.PI) : 0;
  ctx.save();
  ctx.translate(unit.x, unit.y - actionPulse * 7);
  ctx.shadowBlur = isPet ? 28 : 18;
  ctx.shadowColor = unit.color;
  ctx.fillStyle = "rgba(0, 0, 0, .32)";
  ctx.beginPath();
  ctx.ellipse(0, isPet ? 20 : 18, isPet ? 20 : 24, isPet ? 7 : 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isPet) {
    const bob = Math.sin(state.t * 5.2 + unit.pulse) * 4;
    ctx.translate(0, bob);
    if (sprites.lumiMount.complete && sprites.lumiMount.naturalWidth > 0) {
      const w = 88 + actionPulse * 12;
      const h = w * (sprites.lumiMount.naturalHeight / sprites.lumiMount.naturalWidth);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.42;
      ctx.filter = "blur(4px)";
      ctx.drawImage(sprites.lumiMount, -w * 0.5 - 2, -h * 0.62 - 1, w + 4, h + 4);
      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.drawImage(sprites.lumiMount, -w * 0.5, -h * 0.62, w, h);
    } else {
      ctx.globalCompositeOperation = "lighter";
      const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 34 + actionPulse * 10);
      aura.addColorStop(0, "#ffffff");
      aura.addColorStop(0.35, unit.color);
      aura.addColorStop(1, "rgba(184,255,125,0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 34 + actionPulse * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, 8 + actionPulse * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  const partnerSize = 128;
  if (drawCompanionSheetFrame(unit, partnerSize)) {
    if (actionPulse > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = actionPulse * 0.75;
      ctx.strokeStyle = unit.color;
      ctx.shadowBlur = 18;
      ctx.shadowColor = unit.color;
      ctx.lineWidth = unit.id === "ren" ? 5 : 3;
      ctx.beginPath();
      if (unit.id === "ren") {
        ctx.arc(8, -22, 52, -0.85, 0.4);
      } else if (unit.id === "bran") {
        ctx.arc(0, -20, 54, Math.PI * 0.7, Math.PI * 1.8);
        ctx.moveTo(-34, -64);
        ctx.lineTo(-34, 18);
      } else {
        ctx.ellipse(0, 9, 44, 16, 0, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    return;
  }

  const guard = unit.type === "guard";
  const lean = guard ? -0.12 + actionPulse * 0.32 : 0.12 - actionPulse * 0.18;
  ctx.rotate(lean);
  ctx.fillStyle = hexAlpha(unit.color, 0.18);
  ctx.beginPath();
  ctx.ellipse(0, -9, 22, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = guard ? "#322a18" : "#102c35";
  ctx.strokeStyle = unit.color;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-14, -8);
  ctx.quadraticCurveTo(0, 18, 16, -8);
  ctx.lineTo(8, 22);
  ctx.lineTo(-8, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffe5c8";
  ctx.beginPath();
  ctx.arc(0, -26, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = guard ? "#2b1c10" : "#1f3952";
  ctx.beginPath();
  ctx.arc(0, -31, 11, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = guard ? "#ffffff" : unit.color;
  ctx.shadowBlur = 20;
  ctx.shadowColor = unit.color;
  ctx.lineWidth = guard ? 4 : 3;
  ctx.beginPath();
  if (guard) {
    ctx.moveTo(15, -9);
    ctx.lineTo(35 + actionPulse * 18, -29 - actionPulse * 8);
  } else {
    ctx.moveTo(17, -12);
    ctx.lineTo(30, -35);
    ctx.arc(30, -38, 5 + actionPulse * 5, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
}

function drawPlayer() {
  const size = player.mounted ? 148 : 104;
  ctx.save();
  player.renderDir = renderDirFromAngle(player.facing, player.renderDir || 1);
  const renderDir = player.renderDir || 1;
  const moving = player.isMoving;
  const walkPower = player.movePower || 0;
  const walkFrame = Math.sin(player.stepAnim);
  const walkCross = Math.cos(player.stepAnim);
  const mountBounce = player.mounted ? Math.abs(walkFrame) * -5.5 * walkPower + Math.sin(state.t * 4.5) * 1.3 : 0;
  const walkBob = player.mounted ? mountBounce : moving ? Math.abs(walkFrame) * -8.5 * walkPower : Math.sin(state.t * 4) * 1.5;
  const sideStep = walkCross * (player.mounted ? 2.8 : 3.8) * walkPower;
  const breath = Math.sin(state.t * 4) * (1 - walkPower) * 1.2;
  const attackPhase = player.attackAnim > 0 ? clamp(1 - player.attackAnim / 0.46, 0, 1) : 0;
  const slashPush = player.attackAnim > 0 ? Math.sin(attackPhase * Math.PI) * 34 : 0;
  const castLift = player.castAnim > 0 ? Math.sin((1 - player.castAnim / 0.48) * Math.PI) * -8 : 0;
  const hurtShake = player.hurtAnim > 0 ? Math.sin(player.hurtAnim * 95) * 8 : 0;
  const mountPop = player.mountAnim > 0 ? Math.sin((1 - player.mountAnim / 0.55) * Math.PI) * -12 : 0;
  const sideX = Math.cos(player.facing + Math.PI / 2) * sideStep;
  const sideY = Math.sin(player.facing + Math.PI / 2) * sideStep * 0.55;
  ctx.translate(
    player.x + Math.cos(player.facing) * slashPush + hurtShake + sideX,
    player.y + walkBob + breath + castLift + mountPop + Math.sin(player.facing) * slashPush + sideY,
  );
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
  ctx.ellipse(0, player.mounted ? 28 : 22, player.mounted ? 44 : 25, player.mounted ? 12 : 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 232, 112, .78)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, player.mounted ? 9 : 4, (player.mounted ? 47 : 30) + Math.sin(state.t * 5) * 2, 0, Math.PI * 2);
  ctx.stroke();
  if (moving) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.16 + walkPower * 0.16;
    ctx.translate(-Math.cos(player.facing) * 14, -Math.sin(player.facing) * 7);
    ctx.rotate(walkFrame * 0.08);
    drawPlayerSheetFrame(size, "rgba(87, 223, 255, .45)", renderDir);
    ctx.restore();

  }
  if (player.attackAnim > 0) {
    ctx.save();
    ctx.globalAlpha = 0.3 * Math.sin(attackPhase * Math.PI);
    ctx.translate(-Math.cos(player.facing) * 20, -Math.sin(player.facing) * 20);
    ctx.rotate(-0.28);
    drawPlayerSheetFrame(size, "rgba(97, 223, 255, .35)", renderDir);
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
  const attackLean = player.attackAnim > 0 ? 0.48 * Math.sin(attackPhase * Math.PI) : 0;
  const castScale = player.castAnim > 0 ? 1 + Math.sin((1 - player.castAnim / 0.48) * Math.PI) * 0.12 : 1;
  const hurtSquash = player.hurtAnim > 0 ? Math.sin(player.hurtAnim * 34) * 0.18 : 0;
  const gaitLean = player.mounted ? walkFrame * 0.055 * walkPower : walkFrame * 0.13 * walkPower + walkCross * 0.035 * walkPower;
  const strideStretch = Math.abs(walkFrame) * walkPower * (player.mounted ? 0.55 : 1);
  ctx.rotate(gaitLean + attackLean);
  ctx.scale((1 + strideStretch * 0.055) * castScale + hurtSquash, (1 - strideStretch * 0.065) * castScale - hurtSquash * 0.35);
  const tint = player.hurtAnim > 0 ? "rgba(255, 70, 85, .45)" : player.castAnim > 0 ? "rgba(255, 236, 143, .22)" : null;
  drawPlayerSheetFrame(size, tint, renderDir);
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
  if (h.type === "allySanctuary") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a * 0.36;
    const g = ctx.createRadialGradient(h.x, h.y, 8, h.x, h.y, h.maxR);
    g.addColorStop(0, "rgba(255,255,255,.18)");
    g.addColorStop(0.32, hexAlpha(h.color, 0.24));
    g.addColorStop(0.72, "rgba(125,255,176,.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(h.x, h.y, h.maxR * (0.55 + p * 0.35), h.maxR * (0.22 + p * 0.2), 0, 0, Math.PI * 2);
    ctx.fill();
    drawCombatFx(0, h.x, h.y - 48, h.maxR * (1.34 + p * 0.32), Math.sin(state.t * 0.8) * 0.04, a * 0.95, 1);
    ctx.translate(h.x, h.y);
    ctx.rotate(state.t * 1.3);
    drawProceduralRune(h.maxR * 0.78, [h.color, "#ffffff", "#7dffb0", "#ffd965"], a * 0.58);
    ctx.restore();
  }
  if (h.type === "allyCoreBurst") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a * 0.42;
    ctx.shadowBlur = 34;
    ctx.shadowColor = h.color;
    const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.maxR * (0.45 + p));
    g.addColorStop(0, "rgba(255,255,255,.34)");
    g.addColorStop(0.2, hexAlpha(h.color, 0.32));
    g.addColorStop(0.58, "rgba(87,223,255,.1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.maxR * (0.35 + p * 0.75), 0, Math.PI * 2);
    ctx.fill();
    drawCombatFx(7, h.x, h.y - 8, h.maxR * (1.75 + p * 0.55), state.t * 0.22, a * 0.98, 1);
    strokeMultiArc(h.x, h.y, h.maxR * (0.42 + p * 0.55), state.t * 3, Math.PI * 1.75 + state.t * 3, [h.color, "#ffffff", "#57dfff", "#ffd965"], 8, a);
    ctx.restore();
  }
  if (h.type === "allyGuardianWall") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a * 0.42;
    ctx.shadowBlur = 30;
    ctx.shadowColor = h.color;
    const g = ctx.createRadialGradient(h.x, h.y, 12, h.x, h.y, h.maxR);
    g.addColorStop(0, "rgba(255,255,255,.12)");
    g.addColorStop(0.34, hexAlpha(h.color, 0.22));
    g.addColorStop(0.78, "rgba(255,217,101,.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.maxR * (0.48 + p * 0.5), 0, Math.PI * 2);
    ctx.fill();
    drawCombatFx(6, h.x, h.y - 50, h.maxR * 1.28, 0, a * 0.62, 0.9);
    ctx.strokeStyle = h.color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.maxR * (0.4 + p * 0.46), Math.PI * 0.62, Math.PI * 1.38);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i += 1) {
      const sx = h.x - 70 + i * 35;
      ctx.beginPath();
      ctx.moveTo(sx, h.y - 66 + p * 12);
      ctx.lineTo(sx + 8, h.y + 44 - p * 8);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (h.type === "allyShieldBash") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    const x = h.x + (h.tx - h.x) * p;
    const y = h.y + (h.ty - h.y) * p;
    const angle = Math.atan2(h.ty - h.y, h.tx - h.x);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a;
    ctx.shadowBlur = 24;
    ctx.shadowColor = h.color;
    ctx.strokeStyle = h.color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 26 + p * 18, Math.PI * 0.65, Math.PI * 1.35);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, -18);
    ctx.lineTo(20, 0);
    ctx.lineTo(-20, 18);
    ctx.stroke();
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
    drawCombatFx(h.fxIndex ?? 7, 0, -8, radius * 2.2, state.t * 0.12, a * 0.74, 1);

    ctx.globalAlpha = a * 0.28;
    const gOuter = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.45);
    gOuter.addColorStop(0, hexAlpha(accent, 0.42));
    gOuter.addColorStop(0.3, hexAlpha(main, 0.32));
    gOuter.addColorStop(0.7, hexAlpha(deep, 0.12));
    gOuter.addColorStop(1, hexAlpha(main, 0));
    ctx.fillStyle = gOuter;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.45, radius * 0.98, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = a * 0.42;
    const gCore = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.55);
    gCore.addColorStop(0, "rgba(255,255,255,.42)");
    gCore.addColorStop(0.4, hexAlpha(accent, 0.36));
    gCore.addColorStop(1, hexAlpha(main, 0));
    ctx.fillStyle = gCore;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(state.t * (1.4 + h.spin));
    ctx.fillStyle = hexAlpha(accent, 0.55);
    ctx.globalAlpha = a * 0.28;
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

    ctx.globalAlpha = a * 0.5;
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
    drawCombatFx(2, h.x, h.y, h.maxR * 2.25, -state.t * 0.18, clamp(h.life, 0, 1) * 0.86, 1);
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
    drawCombatFx(4, h.x, h.y - 48, 248 + p * 58, state.t * 0.18, clamp(h.life / h.max, 0, 1) * 0.78, 1);
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
  if (h.type === "bossCast") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    const frame = Math.min(5, Math.floor(p * 6));
    if (!drawFxSheetFrame(sprites.bossCastFx, frame, 384, 384, h.x, h.y - 24, h.radius * 2.42, h.radius * 2.42, a * 0.96, 0, 0.72)) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = a * 0.72;
      ctx.strokeStyle = h.color;
      ctx.shadowBlur = 34;
      ctx.shadowColor = h.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y + 12, h.radius * (0.42 + p * 0.58), h.radius * (0.16 + p * 0.24), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i += 1) {
        const angle = state.t * 2 + i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(h.x + Math.cos(angle) * h.radius * 0.22, h.y - 60 + Math.sin(angle) * 16);
        ctx.lineTo(h.x + Math.cos(angle) * h.radius * 0.62, h.y - 110 + Math.sin(angle) * 28);
        ctx.stroke();
      }
    }
  }
  if (h.type === "enemySwipe") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    const frame = Math.min(5, Math.floor(p * 6));
    const size = h.boss ? 250 : 128;
    if (!drawFxSheetFrame(sprites.enemyAttackFx, frame, 256, 256, h.x + Math.cos(h.angle) * (h.boss ? 56 : 24), h.y + Math.sin(h.angle) * (h.boss ? 56 : 24), size, size, a * (h.boss ? 1 : 0.92), h.angle, h.boss ? 1.04 : 0.86)) {
      ctx.translate(h.x, h.y);
      ctx.rotate(h.angle);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = a;
      ctx.shadowBlur = h.boss ? 34 : 18;
      ctx.shadowColor = h.color;
      ctx.lineCap = "round";
      ctx.strokeStyle = h.color;
      ctx.lineWidth = h.boss ? 15 : 7;
      ctx.beginPath();
      ctx.arc(14 + p * (h.boss ? 34 : 18), 0, h.boss ? 96 : 42, -0.62, 0.72 + p * 0.25);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = h.boss ? 5 : 2.5;
      ctx.beginPath();
      ctx.arc(18 + p * (h.boss ? 34 : 18), 0, h.boss ? 98 : 43, -0.36, 0.46 + p * 0.22);
      ctx.stroke();
    }
  }
  if (h.type === "slash") {
    const p = 1 - h.life / 0.24;
    const a = clamp(h.life / 0.24, 0, 1);
    const angle = Math.atan2(h.ty - h.y, h.tx - h.x);
    ctx.translate(h.tx, h.ty);
    ctx.rotate(angle);
    ctx.globalCompositeOperation = "lighter";
    drawCombatFx(5, 0, -8, 148 + p * 44, -0.22, a * 0.88, 0.82);
    ctx.save();
    ctx.globalAlpha = a * 0.42;
    ctx.filter = "blur(4px)";
    ctx.strokeStyle = "#57dfff";
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(-22, 0, 62 + p * 22, -1.12, 0.95);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = a;
    ctx.strokeStyle = h.color;
    ctx.lineWidth = 17;
    ctx.lineCap = "round";
    ctx.shadowBlur = 26;
    ctx.shadowColor = h.color;
    ctx.beginPath();
    ctx.arc(-20, 0, 52 + p * 10, -0.95, 0.82);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-20, 0, 54 + p * 8, -0.72, 0.6);
    ctx.stroke();
    for (let i = 0; i < 5; i += 1) {
      const t = i / 4;
      ctx.globalAlpha = a * (0.58 - t * 0.08);
      ctx.strokeStyle = i % 2 ? "#fff2a5" : "#8dfffb";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-18 + t * 10, -4 + t * 7, 34 + t * 34, -0.82 + t * 0.16, -0.35 + t * 0.3);
      ctx.stroke();
    }
  }
  if (h.type === "dust") {
    ctx.globalAlpha = clamp(h.life / h.max, 0, 1) * 0.38;
    ctx.fillStyle = h.color;
    const r = 18 * (1 - h.life / h.max) + 4;
    ctx.beginPath();
    ctx.ellipse(h.x, h.y, r, r * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (h.type === "mountTrail") {
    const p = 1 - h.life / h.max;
    const a = clamp(h.life / h.max, 0, 1);
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.angle || 0);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a * 0.72;
    ctx.shadowBlur = 22;
    ctx.shadowColor = h.color;
    ctx.strokeStyle = h.color;
    ctx.lineCap = "round";
    for (let i = 0; i < 4; i += 1) {
      ctx.lineWidth = 7 - i;
      ctx.beginPath();
      ctx.moveTo(-48 - p * 22 - i * 7, 10 + i * 5);
      ctx.quadraticCurveTo(-24 - p * 16, -4 + i * 2, 8 - p * 6, 6 - i * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = a * 0.5;
    ctx.beginPath();
    ctx.ellipse(-20 - p * 20, 12, 28 + p * 22, 8 + p * 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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
    ctx.filter = "blur(4px)";
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
      drawCombatFx(1, h.x, h.y - 86, 230, 0, a * 0.78, 1.15);
      if (sprites.elementFx.complete) {
        drawLogicalSubImage(sprites.elementFx, 0, 0, 256, 256, h.x - 42, h.y - 220, 84, 240);
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
    ctx.globalAlpha = clamp(h.life / h.max, 0, 1) * 0.14;
    drawCombatFx(1, W / 2, H * 0.43, 560 + p * 130, 0, clamp(h.life / h.max, 0, 1) * 0.72, 1);
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "rgba(115,245,255,.024)");
    bg.addColorStop(0.5, "rgba(41,125,255,.018)");
    bg.addColorStop(1, "rgba(255,242,110,.012)");
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
      drawCombatFx(3, h.x, h.y - 42 * scale, 185 * scale, state.t * 0.08, a * 0.74, 1.1);
      if (sprites.elementFx.complete) {
        drawLogicalSubImage(sprites.elementFx, 256, 0, 256, 256, h.x - 62 * scale, h.y - 140 * scale, 124 * scale, 170 * scale);
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
    ctx.globalAlpha = clamp(h.life / h.max, 0, 1) * 0.14;
    drawCombatFx(3, h.x, h.y - 40, 470 + p * 135, state.t * 0.12, clamp(h.life / h.max, 0, 1) * 0.62, 1);
    const bg = ctx.createRadialGradient(h.x, h.y, 10, h.x, h.y, 360);
    bg.addColorStop(0, "rgba(255,255,255,.045)");
    bg.addColorStop(0.3, "rgba(255,90,46,.04)");
    bg.addColorStop(0.58, "rgba(255,212,90,.024)");
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
  if (p.type === "allyBolt" || p.type === "petBolt" || p.type === "allySlash") {
    const progress = clamp(1 - p.life / p.max, 0, 1);
    const dx = (p.tx || p.x) - p.x;
    const dy = (p.ty || p.y) - p.y;
    const bx = dx * progress;
    const by = dy * progress;
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.type === "allySlash" ? 10 : 6;
    ctx.shadowBlur = p.type === "allySlash" ? 28 : 22;
    if (p.type === "allySlash") {
      drawCombatFx(5, bx, by, 112, Math.atan2(dy, dx) - 0.28, clamp(p.life / p.max, 0, 1) * 0.74, 0.72);
    }
    ctx.beginPath();
    if (p.type === "allySlash") {
      ctx.moveTo(bx - dy * 0.12, by + dx * 0.12);
      ctx.quadraticCurveTo(dx * 0.5, dy * 0.5 - 42, bx + dy * 0.12, by - dx * 0.12);
    } else {
      ctx.moveTo(0, 0);
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = p.type === "allySlash" ? 3 : 2;
    const tailX = bx - dx * 0.28;
    const tailY = by - dy * 0.28;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(bx, by, p.type === "petBolt" ? 6 : 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (p.type === "lance" || p.type === "comet" || p.type === "orb") {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = "blur(4px)";
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
    drawPlayerSheetFrame(104, "rgba(141,255,251,.55)", renderDirFromAngle(p.facing, player.renderDir || 1));
  }
  ctx.restore();
}

function drawLootDrop(loot) {
  ctx.save();
  const bob = Math.sin(state.t * 8 + loot.spin) * 3;
  ctx.translate(loot.x, loot.y + bob);
  ctx.globalAlpha = clamp(loot.life, 0, 1);
  ctx.shadowBlur = loot.type === "coreFragment" ? 34 : loot.icon === 3 ? 24 : 14;
  ctx.shadowColor = loot.rarity;
  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath();
  ctx.ellipse(0, 18, 18 * loot.scale, 6 * loot.scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(Math.sin(state.t * 5 + loot.spin) * 0.18);
  ctx.scale(loot.scale, loot.scale);
  ctx.globalCompositeOperation = "source-over";
  if (loot.type === "coreFragment") {
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = loot.rarity;
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(0, -8, 30 + i * 8 + Math.sin(state.t * 5 + i) * 3, state.t * (0.8 + i * 0.2), Math.PI * 1.7 + state.t * (0.8 + i * 0.2));
      ctx.stroke();
    }
    ctx.fillStyle = loot.rarity;
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(24, -10);
    ctx.lineTo(10, 28);
    ctx.lineTo(-14, 30);
    ctx.lineTo(-25, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
    return;
  }
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
  if (drawUiFrame(0, x, y, w, h, 0.98, 48)) {
    ctx.fillStyle = "rgba(0, 6, 8, .28)";
    roundRect(x + 18, y + 22, w - 36, h - 44, 18);
    ctx.fill();
  } else if (sprites.uiPanel.complete) {
    ctx.drawImage(sprites.uiPanel, x, y, w, h);
  } else {
    ctx.fillStyle = "rgba(5,14,14,.92)";
    roundRect(x, y, w, h, 22);
    ctx.fill();
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 24px Segoe UI";
  const panelTitle = state.panel === "inventory" ? "Inventory" : state.panel === "quests" ? "Quest Board" : "Skill Codex";
  const panelSub = state.panel === "inventory" ? "Legend gear loadout" : state.panel === "quests" ? "Rift contracts and raid orders" : "Auto battle rotation";
  drawFitText(panelTitle, x + 34, y + 52, w - 120, { maxSize: 24, minSize: 16, weight: "900", color: "#fff5d7" });
  ctx.font = "800 12px Segoe UI";
  ctx.fillStyle = "#8dfffb";
  drawFitText(panelSub, x + 36, y + 76, w - 120, { maxSize: 12, minSize: 9, weight: "800", color: "#8dfffb" });

  ctx.textAlign = "center";
  drawUiTile(8, x + w - 60, y + 22, 42, 42, 0.9);
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 18px Segoe UI";
  ctx.fillText("X", x + w - 39, y + 50);

  if (state.panel === "inventory") {
    inventoryItems.forEach((item, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const ix = x + 42 + col * 86;
      const iy = y + 112 + row * 104;
      drawUiFrame(3, ix - 5, iy - 5, 80, 80, 0.96, 34);
      ctx.strokeStyle = item.rarity;
      ctx.lineWidth = 1.5;
      roundRect(ix + 2, iy + 2, 66, 66, 10);
      ctx.stroke();
      drawAtlas(sprites.itemIcons, item.icon, 72, 72, ix + 7, iy + 7, 56, 56);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff5d7";
      ctx.font = "800 10px Segoe UI";
      drawFitText(item.name, ix + 35, iy + 89, 76, { maxSize: 10, minSize: 7, weight: "800", align: "center", color: "#fff5d7" });
      ctx.fillStyle = item.rarity;
      drawFitText(item.power, ix + 35, iy + 104, 76, { maxSize: 10, minSize: 7, weight: "800", align: "center", color: item.rarity });
    });
    ctx.textAlign = "left";
    drawUiFrame(6, x + 30, y + 336, w - 60, 154, 0.9, 42);
    ctx.fillStyle = "#fff5d7";
    ctx.font = "900 16px Segoe UI";
    drawFitText("Main Quest: Serpent Core", x + 54, y + 374, w - 108, { maxSize: 16, minSize: 11, weight: "900", color: "#fff5d7" });
    ctx.font = "700 12px Segoe UI";
    ctx.fillStyle = "#bdfbed";
    drawFitText(`${state.collectedFragments.length}/5 core fragments collected`, x + 54, y + 396, w - 108, { maxSize: 12, minSize: 9, weight: "700", color: "#bdfbed" });
    coreFragments.forEach((fragment, i) => {
      const fx = x + 54 + i * 62;
      const fy = y + 418;
      const owned = state.collectedFragments.includes(fragment.id);
      ctx.fillStyle = owned ? hexAlpha(fragment.color, 0.32) : "rgba(0,0,0,.38)";
      ctx.strokeStyle = owned ? fragment.color : "rgba(255,255,255,.18)";
      ctx.lineWidth = 2;
      roundRect(fx, fy, 44, 36, 9);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = owned ? 1 : 0.32;
      drawAtlas(sprites.itemIcons, fragment.icon, 72, 72, fx + 8, fy + 4, 28, 28);
      ctx.globalAlpha = 1;
    });
  } else if (state.panel === "quests") {
    questDefinitions.forEach((quest, i) => {
      const qx = x + 34;
      const qy = y + 104 + i * 50;
      const done = state.completedQuests.includes(quest.id);
      const progress = questProgress(quest);
      const ratio = quest.target ? progress / quest.target : 0;
      drawUiFrame(done ? 12 : 7, qx - 4, qy - 4, w - 68, 46, done ? 0.54 : 0.72, 30);
      ctx.fillStyle = done ? "rgba(255,255,255,.32)" : quest.color;
      ctx.font = "900 8px Segoe UI";
      ctx.textAlign = "left";
      drawFitText(done ? "DONE" : quest.kind, qx + 8, qy + 12, 46, { maxSize: 8, minSize: 7, weight: "900", color: done ? "rgba(255,255,255,.32)" : quest.color });
      ctx.fillStyle = done ? "rgba(255,255,255,.62)" : "#fff5d7";
      ctx.font = "900 12px Segoe UI";
      drawFitText(quest.title, qx + 58, qy + 12, w - 190, { maxSize: 12, minSize: 8, weight: "900", color: done ? "rgba(255,255,255,.62)" : "#fff5d7" });
      ctx.fillStyle = "rgba(189,251,237,.84)";
      ctx.font = "800 9px Segoe UI";
      drawFitText(quest.desc, qx + 58, qy + 27, w - 190, { maxSize: 9, minSize: 7, weight: "800", color: "rgba(189,251,237,.84)" });
      drawBar(qx + 8, qy + 31, w - 104, 5, ratio, 1, done ? "#ffffff" : quest.color, "rgba(255,255,255,.12)");
      ctx.textAlign = "right";
      ctx.fillStyle = done ? "#ffffff" : quest.color;
      ctx.font = "900 9px Segoe UI";
      ctx.fillText(`${progress}/${quest.target}`, x + w - 52, qy + 12);
      ctx.fillStyle = "#ffd965";
      ctx.fillText(`${quest.rewardGold}G / ${quest.rewardExp}EXP`, x + w - 52, qy + 29);
    });
  } else {
    skills.forEach((skill, i) => {
      const sx = x + 42;
      const sy = y + 104 + i * 60;
      const ready = skill.cd <= 0 && player.mp >= skill.cost;
      drawUiFrame(7, sx - 5, sy - 5, w - 74, 60, ready ? 0.72 : 0.5, 34);
      const rowGrad = ctx.createLinearGradient(sx, sy, sx + w - 84, sy + 50);
      rowGrad.addColorStop(0, ready ? hexAlpha(skill.color, 0.24) : "rgba(4,14,14,.78)");
      rowGrad.addColorStop(0.45, "rgba(3,10,13,.84)");
      rowGrad.addColorStop(1, ready ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.2)");
      ctx.fillStyle = rowGrad;
      ctx.strokeStyle = ready ? skill.color : "rgba(255,255,255,.16)";
      ctx.lineWidth = ready ? 2 : 1.5;
      ctx.shadowBlur = ready ? 16 : 0;
      ctx.shadowColor = skill.color;
      roundRect(sx, sy, w - 84, 50, 12);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = ready ? 0.28 : 0.1;
      ctx.fillStyle = skill.color;
      ctx.beginPath();
      ctx.arc(sx + 29, sy + 25, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.strokeStyle = ready ? "#fff5d7" : "rgba(255,255,255,.24)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx + 29, sy + 25, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      drawAtlas(sprites.skillIcons, i, 96, 96, sx + 5, sy + 1, 48, 48);
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff5d7";
      ctx.font = "900 13px Segoe UI";
      drawFitText(skill.name, sx + 64, sy + 19, w - 242, { maxSize: 13, minSize: 9, weight: "900", color: "#fff5d7" });
      ctx.fillStyle = "#bdfbed";
      ctx.font = "800 10px Segoe UI";
      drawFitText(`AUTO  /  ${skill.maxCd.toFixed(1)}s  /  MP ${skill.cost}`, sx + 64, sy + 36, w - 242, { maxSize: 10, minSize: 7, weight: "800", color: "#bdfbed" });
      drawBar(sx + w - 186, sy + 18, 88, 7, skill.maxCd - skill.cd, skill.maxCd, skill.color, "rgba(255,255,255,.13)");
      ctx.textAlign = "right";
      ctx.fillStyle = ready ? skill.color : "rgba(255,255,255,.4)";
      ctx.font = "900 9px Segoe UI";
      ctx.fillText(ready ? "READY" : `${Math.ceil(Math.max(0, skill.cd))}s`, sx + w - 94, sy + 39);
    });
  }
  ctx.restore();
}

function drawRaidOverlay() {
  const boss = enemies.find((e) => e.kind === "boss");
  if (!boss) return;
  const bossStage = stages[(boss.stageIndex ?? state.stageIndex) % stages.length];
  const pulse = 0.55 + Math.sin(state.t * 4.2) * 0.18;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.18 + pulse * 0.12;
  const top = ctx.createLinearGradient(0, 0, 0, H * 0.35);
  top.addColorStop(0, hexAlpha(bossStage.enemyColor, 0.46));
  top.addColorStop(0.54, "rgba(255,255,255,.04)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H * 0.35);
  const bottom = ctx.createLinearGradient(0, H, 0, H * 0.62);
  bottom.addColorStop(0, hexAlpha(bossStage.enemyColor, 0.26));
  bottom.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, H * 0.62, W, H * 0.38);
  ctx.globalCompositeOperation = "source-over";

  ctx.strokeStyle = hexAlpha(bossStage.enemyColor, 0.28 + pulse * 0.18);
  ctx.lineWidth = 3;
  ctx.shadowBlur = 22;
  ctx.shadowColor = bossStage.enemyColor;
  roundRect(8, 8, W - 16, H - 16, 24);
  ctx.stroke();

  if (state.raidIntro > 0) {
    const a = clamp(state.raidIntro / 3.4, 0, 1);
    const y = H * 0.35 - (1 - a) * 24;
    ctx.globalAlpha = Math.min(1, a * 1.25);
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,.56)";
    roundRect(26, y - 54, W - 52, 108, 18);
    ctx.fill();
    ctx.strokeStyle = bossStage.enemyColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 26;
    ctx.shadowColor = bossStage.enemyColor;
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 18px Segoe UI";
    ctx.fillText("SERPENT RIFT RAID", W / 2, y - 18);
    ctx.fillStyle = bossStage.enemyColor;
    ctx.font = "900 25px Segoe UI";
    ctx.fillText(bossStage.bossTitle || bossStage.bossName || "계층주", W / 2, y + 15);
    ctx.fillStyle = "#fff5d7";
    ctx.font = "800 12px Segoe UI";
    ctx.fillText(`${bossStage.chapter || `FLOOR ${boss.floor || 1}`} / CORE FRAGMENT`, W / 2, y + 42);
  }
  ctx.restore();
}

function drawQuestTracker() {
  const quests = visibleQuests();
  if (!quests.length) return;
  const x = 13;
  const y = 102;
  const w = 206;
  const rowH = 42;
  const h = 34 + quests.length * rowH;
  ctx.save();
  const pulse = state.questPulse > 0 ? Math.sin(state.t * 24) * state.questPulse * 0.08 : 0;
  drawUiFrame(6, x, y, w, h, 0.72 + pulse, 32);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 10px Segoe UI";
  ctx.fillText("QUEST BOARD", x + 16, y + 23);
  quests.forEach((quest, i) => {
    const qy = y + 36 + i * rowH;
    const progress = questProgress(quest);
    const ratio = quest.target ? progress / quest.target : 0;
    ctx.fillStyle = hexAlpha(quest.color, 0.13);
    roundRect(x + 12, qy - 4, w - 24, 34, 8);
    ctx.fill();
    ctx.fillStyle = quest.color;
    ctx.font = "900 8px Segoe UI";
    ctx.fillText(quest.kind, x + 20, qy + 7);
    ctx.fillStyle = "#fff5d7";
    ctx.font = "900 10px Segoe UI";
    ctx.fillText(quest.title, x + 58, qy + 7);
    ctx.fillStyle = "rgba(189,251,237,.9)";
    ctx.font = "800 9px Segoe UI";
    ctx.fillText(`${progress}/${quest.target}`, x + 20, qy + 22);
    drawBar(x + 58, qy + 16, w - 90, 6, ratio, 1, quest.color, "rgba(255,255,255,.12)");
  });
  ctx.restore();
}

function drawQuestToast() {
  if (state.questToastTime <= 0 || !state.questToast) return;
  const a = clamp(state.questToastTime, 0, 1);
  ctx.save();
  ctx.globalAlpha = a;
  const w = W - 72;
  const x = 36;
  const y = 188 - (1 - a) * 16;
  drawUiFrame(11, x, y, w, 64, 0.94, 34);
  ctx.textAlign = "center";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ffd965";
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 15px Segoe UI";
  ctx.fillText("QUEST COMPLETE", W / 2, y + 25);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#8dfffb";
  ctx.font = "800 11px Segoe UI";
  ctx.fillText(state.questToast, W / 2, y + 45);
  ctx.restore();
}

function drawTownBuilding(building) {
  const pulse = 0.5 + Math.sin(state.t * 3 + building.x * 0.02) * 0.12;
  ctx.save();
  const cx = building.x + building.w * 0.5;
  const cy = building.y + building.h * 0.5;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.28 + pulse * 0.12;
  ctx.fillStyle = building.color;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14, 42, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawUiTile(8, cx - 22, cy - 28, 44, 44, 0.92);
  drawAtlas(sprites.itemIcons, building.icon, 72, 72, cx - 14, cy - 20, 28, 28);
  const labelW = 108;
  const labelH = 38;
  const labelX = cx - labelW * 0.5;
  const labelY = cy + 18;
  drawUiFrame(13, labelX, labelY, labelW, labelH, 0.9, 22);
  ctx.fillStyle = "rgba(0,0,0,.56)";
  roundRect(labelX + 7, labelY + 7, labelW - 14, labelH - 12, 8);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,.82)";
  ctx.shadowBlur = 8;
  ctx.shadowColor = "rgba(0,0,0,.9)";
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 10px Segoe UI";
  drawFitText(building.name, cx, labelY + 16, labelW - 18, { maxSize: 10, minSize: 7, weight: "900", align: "center", color: "#fff5d7" });
  ctx.fillStyle = hexAlpha(building.color, 0.95);
  ctx.font = "800 8px Segoe UI";
  drawFitText(building.sub, cx, labelY + 29, labelW - 18, { maxSize: 8, minSize: 6, weight: "800", align: "center", color: hexAlpha(building.color, 0.95) });
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawTownPanel() {
  if (!state.townPanel) return;
  const building = townBuildings.find((b) => b.id === state.townPanel);
  if (!building) return;
  const x = 26;
  const y = 154;
  const w = W - 52;
  const h = 594;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,.38)";
  ctx.fillRect(0, 0, W, H);
  const panelRect = state.townPanel === "guild" ? townUiRects.questPanel : townUiRects.shopPanel;
  if (!drawImageRect(sprites.townUi, panelRect, x - 10, y - 12, w + 20, h + 24, 0.96)) {
    drawUiFrame(0, x, y, w, h, 0.97, 48);
    ctx.fillStyle = "rgba(0,8,12,.36)";
    roundRect(x + 18, y + 22, w - 36, h - 44, 18);
    ctx.fill();
  }
  ctx.textAlign = "left";
  ctx.fillStyle = building.color;
  ctx.font = "900 12px Segoe UI";
  drawFitText("RIFT TOWN", x + 34, y + 38, w - 132, { maxSize: 12, minSize: 9, weight: "900", color: building.color });
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 24px Segoe UI";
  drawFitText(building.title || building.name, x + 34, y + 68, w - 132, { maxSize: 24, minSize: 14, weight: "900", color: "#fff5d7" });
  ctx.fillStyle = "#8dfffb";
  ctx.font = "800 12px Segoe UI";
  drawFitText(building.sub, x + 36, y + 92, w - 132, { maxSize: 12, minSize: 8, weight: "800", color: "#8dfffb" });
  drawImageRect(sprites.townUi, townUiRects.close, x + w - 64, y + 18, 50, 50, 0.94) || drawUiTile(8, x + w - 60, y + 22, 42, 42, 0.9);
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 18px Segoe UI";
  ctx.fillText("X", x + w - 39, y + 50);

  if (state.townPanel === "gate") {
    ctx.fillStyle = "rgba(0,0,0,.5)";
    roundRect(x + 38, y + 122, w - 76, 92, 14);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff5d7";
    ctx.font = "900 18px Segoe UI";
    ctx.fillText(`현재 ${stageCode()} / ${currentStage().name}`, W / 2, y + 150);
    ctx.fillStyle = "rgba(189,251,237,.9)";
    ctx.font = "800 12px Segoe UI";
    ctx.fillText("던전에 입장하면 자동 전투, 파티 보조, 퀘스트 진행이 시작됩니다.", W / 2, y + 178);
    ctx.fillStyle = "rgba(0,0,0,.58)";
    roundRect(x + 50, y + 132, w - 100, 62, 12);
    ctx.fill();
    drawFitText(`현재 ${stageCode()} / ${currentStage().name}`, W / 2, y + 152, w - 112, { maxSize: 18, minSize: 11, weight: "900", align: "center", color: "#fff5d7" });
    ctx.font = "800 12px Segoe UI";
    drawWrappedText("던전에 입장하면 자동 전투, 파티 보조, 퀘스트 진행이 시작됩니다.", W / 2, y + 175, w - 118, 15, 2, { align: "center", color: "rgba(189,251,237,.9)" });
    drawImageRect(sprites.townUi, townUiRects.gateButton, x + 52, y + 216, w - 104, 96, 0.98) || drawUiFrame(15, x + 60, y + 226, w - 120, 74, 0.95, 36);
    ctx.fillStyle = "#ff7184";
    ctx.font = "900 20px Segoe UI";
    ctx.fillText("DUNGEON START", W / 2, y + 270);
  } else if (state.townPanel === "guild") {
    townContracts.forEach((contract, i) => {
      const cy = y + 122 + i * 92;
      const active = state.townContracts.includes(contract.id);
      const progress = contractProgress(contract);
      drawImageRect(sprites.townUi, townUiRects.contractCard, x + 22, cy - 8, w - 44, 92, active ? 0.72 : 0.9) || drawUiFrame(active ? 12 : 7, x + 28, cy, w - 56, 76, active ? 0.62 : 0.78, 34);
      ctx.fillStyle = "rgba(0,0,0,.42)";
      roundRect(x + 42, cy + 10, w - 128, 50, 10);
      ctx.fill();
      ctx.textAlign = "left";
      ctx.fillStyle = contract.color;
      ctx.font = "900 10px Segoe UI";
      drawFitText(active ? "ACTIVE" : "NOTICE", x + 48, cy + 19, 52, { maxSize: 10, minSize: 8, weight: "900", color: contract.color });
      ctx.fillStyle = "#fff5d7";
      ctx.font = "900 12px Segoe UI";
      drawFitText(contract.name, x + 106, cy + 19, w - 208, { maxSize: 12, minSize: 8, weight: "900", color: "#fff5d7" });
      ctx.fillStyle = "rgba(189,251,237,.88)";
      ctx.font = "800 9px Segoe UI";
      drawFitText(`${contract.desc}  ${progress}/${contract.target}`, x + 48, cy + 40, w - 154, { maxSize: 9, minSize: 7, weight: "800", color: "rgba(189,251,237,.88)" });
      drawBar(x + 48, cy + 53, w - 160, 6, progress, contract.target, contract.color, "rgba(255,255,255,.12)");
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffd965";
      ctx.font = "900 9px Segoe UI";
      ctx.fillText(`${contract.rewardGold}G / ${contract.rewardExp}EXP`, x + w - 48, cy + 60);
    });
  } else {
    const items = townShopItems[state.townPanel] || [];
    items.forEach((item, i) => {
      const iy = y + 128 + i * 108;
      const cardX = x + 36;
      const cardW = w - 72;
      const textX = cardX + 88;
      const priceX = cardX + cardW - 24;
      const level = state.townUpgrades[item.levelKey] || 0;
      const price = Math.floor(item.cost * (1 + level * 0.62));
      const maxed = level >= item.max;
      drawImageRect(sprites.townUi, townUiRects.shopCard, cardX - 8, iy - 10, cardW + 16, 104, maxed ? 0.62 : 0.92) || drawUiFrame(maxed ? 12 : 7, cardX, iy, cardW, 86, maxed ? 0.58 : 0.78, 34);
      ctx.fillStyle = "rgba(0,0,0,.5)";
      roundRect(cardX + 78, iy + 12, cardW - 170, 48, 10);
      ctx.fill();
      ctx.textAlign = "left";
      ctx.fillStyle = maxed ? "rgba(255,255,255,.56)" : building.color;
      ctx.font = "900 10px Segoe UI";
      drawFitText(maxed ? "MAX" : `LV ${level}/${item.max}`, cardX + 10, iy + 23, 64, { maxSize: 10, minSize: 8, weight: "900", color: maxed ? "rgba(255,255,255,.56)" : building.color });
      ctx.fillStyle = "#fff5d7";
      ctx.font = "900 13px Segoe UI";
      drawFitText(item.name, textX, iy + 25, priceX - textX - 72, { maxSize: 13, minSize: 8, weight: "900", color: "#fff5d7" });
      ctx.fillStyle = "rgba(189,251,237,.9)";
      ctx.font = "800 10px Segoe UI";
      drawFitText(item.desc, textX, iy + 46, priceX - textX - 72, { maxSize: 10, minSize: 7, weight: "800", color: "rgba(189,251,237,.9)" });
      ctx.textAlign = "right";
      ctx.fillStyle = maxed ? "rgba(255,255,255,.5)" : "#ffd965";
      ctx.font = "900 10px Segoe UI";
      drawFitText(maxed ? "DONE" : `${price} GOLD`, priceX, iy + 50, 70, { maxSize: 10, minSize: 7, weight: "900", align: "right", color: maxed ? "rgba(255,255,255,.5)" : "#ffd965" });
    });
  }
  ctx.restore();
}

function drawTownScreen() {
  const t = state.t;
  ctx.save();
  if (sprites.townMap.complete && sprites.townMap.naturalWidth > 0) {
    drawImageCover(sprites.townMap, 0, 0, W, H);
    const townShade = ctx.createLinearGradient(0, 0, 0, H);
    townShade.addColorStop(0, "rgba(0,8,18,.18)");
    townShade.addColorStop(0.52, "rgba(0,0,0,.04)");
    townShade.addColorStop(1, "rgba(0,0,0,.22)");
    ctx.fillStyle = townShade;
    ctx.fillRect(0, 0, W, H);
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#071726");
    sky.addColorStop(0.44, "#12353b");
    sky.addColorStop(1, "#071015");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 36; i += 1) {
    const p = (i * 0.137 + t * 0.018) % 1;
    const x = (i * 73) % W;
    const y = 34 + p * 172;
    ctx.fillStyle = `rgba(141,255,251,${0.06 + (1 - p) * 0.06})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  const plaza = ctx.createRadialGradient(W / 2, H * 0.82, 20, W / 2, H * 0.78, 360);
  plaza.addColorStop(0, "rgba(255,226,150,.16)");
  plaza.addColorStop(0.42, "rgba(47,70,60,.08)");
  plaza.addColorStop(1, "rgba(7,13,18,.04)");
  ctx.fillStyle = plaza;
  ctx.fillRect(0, H * 0.18, W, H * 0.82);
  ctx.strokeStyle = "rgba(255,245,210,.12)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.ellipse(W / 2, H * 0.78, 84 + i * 36, 28 + i * 14, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#8dfffb";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 26px Segoe UI";
  ctx.fillText("RIFT TOWN", W / 2, 58);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(189,251,237,.88)";
  ctx.font = "800 12px Segoe UI";
  ctx.fillText("무기점 · 펫샵 · 파트너 홀 · 의뢰소 · 던전 게이트", W / 2, 82);
  drawUiFrame(1, 18, 104, W - 36, 58, 0.76, 30);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 13px Segoe UI";
  ctx.fillText(`Gold ${state.gold}`, 36, 127);
  ctx.fillStyle = "#8dfffb";
  ctx.font = "900 12px Segoe UI";
  ctx.fillText(`ATK ${player.atk}   SPD ${Math.floor(player.speed)}   Party ${state.townUpgrades.party}`, 36, 148);
  ctx.textAlign = "right";
  ctx.fillStyle = "#ffd965";
  ctx.font = "900 13px Segoe UI";
  ctx.fillText(`Stage ${stageCode()}`, W - 36, 127);
  ctx.fillStyle = "rgba(255,255,255,.82)";
  ctx.font = "900 12px Segoe UI";
  ctx.fillText(`Contracts ${state.townContracts.length}`, W - 36, 148);
  townBuildings.forEach(drawTownBuilding);
  if (state.townMessageTime > 0) {
    ctx.globalAlpha = clamp(state.townMessageTime, 0, 1);
    drawUiFrame(11, 42, H - 112, W - 84, 58, 0.88, 30);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff5d7";
    ctx.font = "900 15px Segoe UI";
    ctx.fillText(state.townMessage, W / 2, H - 76);
    ctx.globalAlpha = 1;
  }
  drawTownPanel();
  drawQuestToast();
  ctx.restore();
}

function drawUi() {
  ctx.save();
  if (!drawUiFrame(1, 10, 10, 224, 82, 0.92, 38)) {
    ctx.fillStyle = "rgba(2, 9, 7, .58)";
    roundRect(14, 15, 216, 72, 14);
    ctx.fill();
  }
  ctx.fillStyle = "#fff5d7";
  ctx.font = "800 17px Segoe UI";
  ctx.fillText(`Lv.${player.level} Rift Knight`, 28, 39);
  drawBar(28, 49, 170, 9, player.hp, player.maxHp, "#ff5c75");
  drawBar(28, 64, 170, 8, player.mp, player.maxMp, "#55ddff");
  drawBar(28, 79, 170, 5, player.exp, player.nextExp, "#ffd965", "rgba(255,255,255,.14)");

  ctx.textAlign = "right";
  if (!drawUiFrame(1, W - 150, 10, 140, 70, 0.88, 34)) {
    ctx.fillStyle = "rgba(2, 9, 7, .58)";
    roundRect(W - 142, 16, 128, 58, 13);
    ctx.fill();
  }
  ctx.fillStyle = "#fff5d7";
  ctx.font = "800 14px Segoe UI";
  ctx.fillText(`Stage ${stageCode()}`, W - 28, 39);
  ctx.fillStyle = "#ffd965";
  ctx.fillText(`${state.gold} gold`, W - 28, 59);
  if (!state.bossMode && !isBossStage()) {
    const progressStart = state.nextStageKills - KILLS_PER_STAGE;
    const stageProgress = clamp((state.kills - progressStart) / KILLS_PER_STAGE, 0, 1);
    const remaining = Math.max(0, state.nextStageKills - state.kills);
    ctx.textAlign = "left";
    drawUiFrame(13, W - 145, 82, 134, 38, 0.55, 28);
    drawBar(W - 130, 96, 104, 5, stageProgress, 1, currentStage().enemyColor, "rgba(255,255,255,.12)");
    ctx.fillStyle = "#fff5d7";
    ctx.font = "800 10px Segoe UI";
    ctx.fillText(`${remaining} TO ${floorNumber()}-${subStageNumber() + 1}`, W - 130, 110);
  }

  const activeBoss = enemies.some((e) => e.kind === "boss");
  if (!activeBoss && state.stageIntro <= 0.2) {
    drawQuestTracker();
  }

  if (activeBoss) {
    const boss = enemies.find((e) => e.kind === "boss");
    const bossStage = stages[(boss.stageIndex ?? state.stageIndex) % stages.length];
    const phaseCount = 5;
    const hpRatio = clamp(boss.hp / boss.maxHp, 0, 1);
    ctx.textAlign = "center";
    if (!drawUiFrame(9, 18, 86, W - 36, 68, 0.94, 38)) {
      ctx.fillStyle = "rgba(0,0,0,.62)";
      roundRect(24, 92, W - 48, 54, 14);
      ctx.fill();
    }
    ctx.strokeStyle = bossStage.enemyColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = bossStage.enemyColor;
    ctx.font = "900 10px Segoe UI";
    ctx.fillText("CORE FRAGMENT RAID  /  계층주", W / 2, 107);
    ctx.fillStyle = "#fff5d7";
    ctx.font = "900 15px Segoe UI";
    ctx.shadowBlur = 14;
    ctx.shadowColor = bossStage.enemyColor;
    ctx.fillText(`${boss.stageCode || stageCode()}  ${bossStage.bossName || "FLOOR BOSS"}`, W / 2, 126);
    ctx.shadowBlur = 0;
    drawBar(34, 134, W - 68, 12, boss.hp, boss.maxHp, bossStage.enemyColor, "rgba(0,0,0,.72)");
    ctx.fillStyle = "rgba(255,255,255,.72)";
    for (let i = 1; i < phaseCount; i += 1) {
      const x = 34 + ((W - 68) * i) / phaseCount;
      ctx.fillRect(x - 1, 134, 2, 12);
    }
    ctx.textAlign = "right";
    ctx.fillStyle = hpRatio < 0.22 ? "#ff5c75" : "#fff5d7";
    ctx.font = "900 10px Segoe UI";
    ctx.fillText(`${Math.ceil(hpRatio * 100)}%`, W - 38, 130);
  }

  const compactIntro = state.raidIntro > 0.2;
  const baseX = W - 52;
  const baseY = 256;
  if (!compactIntro) skills.forEach((s, i) => {
    const y = baseY + i * 50;
    const ready = s.cd <= 0 && player.mp >= s.cost;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = ready ? 0.34 : 0.08;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(baseX, y, ready ? 25 : 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const gemGrad = ctx.createRadialGradient(baseX - 9, y - 10, 4, baseX, y, 24);
    gemGrad.addColorStop(0, ready ? "rgba(255,255,255,.48)" : "rgba(255,255,255,.14)");
    gemGrad.addColorStop(0.35, ready ? hexAlpha(s.color, 0.5) : "rgba(18,24,24,.74)");
    gemGrad.addColorStop(1, "rgba(0,0,0,.86)");
    ctx.fillStyle = gemGrad;
    ctx.strokeStyle = ready ? "#fff5d7" : "rgba(255,255,255,.18)";
    ctx.lineWidth = ready ? 2.5 : 1.5;
    ctx.shadowBlur = ready ? 18 : 0;
    ctx.shadowColor = s.color;
    ctx.beginPath();
    ctx.arc(baseX, y, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = ready ? s.color : "rgba(255,255,255,.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(baseX, y, 24, 0, Math.PI * 2);
    ctx.stroke();
    drawUiTile(2, baseX - 24, y - 24, 48, 48, ready ? 0.94 : 0.62);
    ctx.save();
    ctx.globalAlpha = ready ? 1 : 0.45;
    if (!drawAtlas(sprites.skillIcons, i, 96, 96, baseX - 19, y - 19, 38, 38)) {
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
      ctx.arc(baseX, y, 21, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (s.cd / s.maxCd));
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "800 12px Segoe UI";
      ctx.fillText(Math.ceil(s.cd), baseX, y + 4);
    }
    ctx.fillStyle = "rgba(0,0,0,.72)";
    ctx.strokeStyle = ready ? s.color : "rgba(255,255,255,.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(baseX + 17, y - 17, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ready ? "#fff5d7" : "rgba(255,255,255,.5)";
    ctx.font = "900 9px Segoe UI";
    ctx.fillText(`${i + 1}`, baseX + 17, y - 14);
  });

  ctx.textAlign = "center";
  [
    { id: "town", x: W - 192, y: 146, icon: 7, active: false, label: "T" },
    { id: "quest", x: W - 142, y: 146, icon: 6, active: state.panel === "quests", label: "Q" },
    { id: "bag", x: W - 92, y: 146, icon: 0, active: state.panel === "inventory", label: "I" },
    { id: "skill", x: W - 42, y: 146, icon: 5, active: state.panel === "skills", label: "S" },
  ].forEach((b) => {
    drawUiTile(8, b.x - 23, b.y - 23, 46, 46, b.active ? 1 : 0.72);
    drawAtlas(sprites.itemIcons, b.icon, 72, 72, b.x - 15, b.y - 15, 30, 30);
    ctx.fillStyle = "#fff5d7";
    ctx.font = "900 8px Segoe UI";
    ctx.fillText(b.label, b.x, b.y + 24);
  });

  const mountX = W - 42;
  const mountY = 204;
  if (!compactIntro) {
  drawUiTile(8, mountX - 24, mountY - 24, 48, 48, player.mounted ? 1 : 0.72);
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = pet.color;
  ctx.shadowBlur = player.mounted ? 18 : 8;
  ctx.shadowColor = pet.color;
  if (sprites.lumiMount.complete && sprites.lumiMount.naturalWidth > 0) {
    const iw = 30;
    const ih = iw * (sprites.lumiMount.naturalHeight / sprites.lumiMount.naturalWidth);
    ctx.drawImage(sprites.lumiMount, mountX - iw * 0.5, mountY - ih * 0.55, iw, ih);
  } else {
    ctx.beginPath();
    ctx.ellipse(mountX, mountY + 3, 13, 8, -0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(mountX + 8, mountY - 6, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0;
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 9px Segoe UI";
  ctx.fillText("R", mountX, mountY + 23);
  }

  if (!compactIntro) {
  ctx.textAlign = "left";
  const partyPanelY = H - 104;
  if (!drawUiFrame(7, 10, partyPanelY, 410, 92, 0.86, 34)) {
    ctx.fillStyle = "rgba(4, 10, 8, .62)";
    roundRect(16, partyPanelY + 6, 398, 76, 13);
    ctx.fill();
  }
  ctx.fillStyle = "#fff5d7";
  ctx.font = "900 10px Segoe UI";
  ctx.fillText("PARTY ROLES", 28, partyPanelY + 22);
  [...partyMembers, pet].forEach((unit, i) => {
    const x = 22 + i * 99;
    const y = partyPanelY + 57;
    const readyRatio = clamp(1 - (unit.specialCd || 0) / (unit.maxSpecialCd || unit.maxCd), 0, 1);
    ctx.textAlign = "left";
    drawUiFrame(7, x - 2, y - 24, 94, 60, 0.58, 26);
    const iconX = x + 18;
    ctx.fillStyle = hexAlpha(unit.color, 0.18);
    ctx.strokeStyle = unit.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(iconX, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = unit.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(iconX, y, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * readyRatio);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 9px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(unit.type === "pet" ? "P" : unit.type === "healer" ? "+": "D", iconX, y + 4);
    ctx.textAlign = "left";
    ctx.fillStyle = unit.color;
    ctx.font = "900 8px Segoe UI";
    ctx.fillText(unit.role, x + 34, y - 7);
    ctx.fillStyle = "#fff5d7";
    ctx.font = "800 6px Segoe UI";
    ctx.fillText(unit.skillName || "Assist", x + 34, y + 7);
  });
  if (state.partyBarrier > 0) {
    drawBar(24, partyPanelY + 80, 120, 5, state.partyBarrier, 2.1, "#ffd965", "rgba(255,255,255,.12)");
  }

  ctx.textAlign = "left";
  drawUiFrame(7, 10, H - 168, 184, 48, 0.72, 28);
  ctx.fillStyle = "#fff5d7";
  ctx.font = "800 13px Segoe UI";
  ctx.fillText("Auto Skills ON", 24, H - 140);
  ctx.fillStyle = "#83ffd5";
  ctx.fillText(`${state.score.toLocaleString()} pts`, 116, H - 140);

  drawUiFrame(13, 206, H - 168, 158, 48, 0.62, 26);
  drawBar(220, H - 142, 128, 8, state.ultimateCharge, 100, "#ffffff", "rgba(255,255,255,.14)");
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff5d7";
  ctx.font = "800 11px Segoe UI";
  ctx.fillText("OVERDRIVE", 284, H - 150);
  }

  const joyAlpha = input.joyActive ? 0.78 : 0.34;
  ctx.globalAlpha = joyAlpha;
  drawUiTile(2, input.joyStartX - 44, input.joyStartY - 44, 88, 88, 0.46);
  drawUiTile(8, input.joyX - 22, input.joyY - 22, 44, 44, 0.78);
  ctx.globalAlpha = 1;

  if (state.messageTime > 0) {
    ctx.textAlign = "center";
    ctx.globalAlpha = clamp(state.messageTime, 0, 1);
    drawUiFrame(11, 42, H * 0.44 - 34, W - 84, 68, 0.86, 32);
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
    const a = clamp(state.stageIntro / 2.2, 0, 1);
    const stage = currentStage();
    ctx.globalAlpha = Math.min(0.82, a * 1.05);
    ctx.textAlign = "center";
    drawUiFrame(11, 24, 198, W - 48, 138, 0.72, 42);
    ctx.strokeStyle = stage.enemyColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 24;
    ctx.shadowColor = stage.enemyColor;
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 23px Segoe UI";
    ctx.fillText(`${stageCode()}  ${stage.name.toUpperCase()}`, W / 2, 246);
    ctx.fillStyle = stage.enemyColor;
    ctx.font = "800 13px Segoe UI";
    ctx.fillText(stage.chapter || "RIFT FLOOR", W / 2, 272);
    ctx.fillStyle = "#fff5d7";
    ctx.font = "800 11px Segoe UI";
    const loreLines = wrapDialogue(isBossStage() ? `${stage.bossTitle}가 세르펜트 코어 파편을 지키고 있다.` : stage.lore || "세르펜트 리프트의 차원이 열렸다.", W - 86);
    loreLines.slice(0, 2).forEach((line, i) => ctx.fillText(line, W / 2, 296 + i * 17));
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  if (state.panel) drawGamePanel();
  ctx.restore();
}

function startGame() {
  if (state.screen !== "title") return;
  state.screen = "intro";
  state.introIndex = 0;
  state.introTime = 0;
}

function beginPlay() {
  state.screen = "town";
  state.message = "ENTER THE RIFT";
  state.messageTime = 1.8;
  state.stageIntro = 2.2;
  state.powerFlash = 0.42;
  state.shockwave = 0.72;
  state.shake = 8;
  state.partyBarrier = 0;
  partyMembers.forEach((member, i) => {
    member.x = player.x + [-46, -8, 48][i];
    member.y = player.y + 42 + i * 12;
    member.cd = Math.min(member.cd, 0.6);
  });
  pet.x = player.x - 18;
  pet.y = player.y - 52;
  pet.cd = Math.min(pet.cd, 0.35);
  state.townMessage = "Rift Town에 도착했다";
  state.townMessageTime = 2.4;
}

function advanceIntro() {
  if (state.screen !== "intro") return;
  const scene = introScenes[Math.min(state.introIndex, introScenes.length - 1)];
  if (state.introTime * 28 < scene.line.length) {
    state.introTime = scene.line.length / 28;
    return;
  }
  state.introIndex += 1;
  state.introTime = 0;
  if (state.introIndex >= introScenes.length) beginPlay();
}

function drawTitleScreen() {
  const t = state.t;
  const img = sprites.titleKeyart.complete ? sprites.titleKeyart : bg;
  ctx.save();
  if (img.complete && img.naturalWidth > 0) {
    const scale = Math.max(W / img.width, H / img.height);
    const bw = img.width * scale;
    const bh = img.height * scale;
    ctx.filter = "saturate(.95) contrast(1.08) brightness(.84)";
    ctx.drawImage(img, (W - bw) / 2, (H - bh) / 2 - H * 0.015, bw, bh);
    ctx.filter = "none";
  } else {
    ctx.fillStyle = "#06070d";
    ctx.fillRect(0, 0, W, H);
  }

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "rgba(2, 5, 12, .18)");
  sky.addColorStop(0.28, "rgba(2, 5, 12, .08)");
  sky.addColorStop(0.62, "rgba(5, 7, 14, .20)");
  sky.addColorStop(1, "rgba(0, 0, 0, .72)");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const vignette = ctx.createRadialGradient(W * 0.52, H * 0.46, 42, W * 0.5, H * 0.5, H * 0.72);
  vignette.addColorStop(0, "rgba(63, 255, 210, .05)");
  vignette.addColorStop(0.52, "rgba(7, 12, 22, .06)");
  vignette.addColorStop(1, "rgba(0, 0, 0, .78)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i += 1) {
    const p = (t * 0.035 + i / 5) % 1;
    const x = W * (0.18 + i * 0.18);
    const y = H * (0.2 + p * 0.28);
    ctx.strokeStyle = `rgba(88, 232, 202, ${0.035 + (1 - p) * 0.045})`;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#54f0cf";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(x - 18, y - 24);
    ctx.bezierCurveTo(x + 18, y - 16, x - 18, y + 24, x + 18, y + 32);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.globalAlpha = 0.74;
  drawUiTile(12, 42, 112, W - 84, 54, 0.86);
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 56px Georgia, serif";
  const titleGrad = ctx.createLinearGradient(62, 132, W - 62, 212);
  titleGrad.addColorStop(0, "#7a4b1e");
  titleGrad.addColorStop(0.18, "#f6dfa5");
  titleGrad.addColorStop(0.42, "#ffffff");
  titleGrad.addColorStop(0.67, "#d5a54f");
  titleGrad.addColorStop(1, "#694019");
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(16, 9, 20, .94)";
  ctx.shadowBlur = 26;
  ctx.shadowColor = "#000000";
  ctx.strokeText("SERPENT", W / 2, 164);
  ctx.strokeText("RIFT", W / 2, 216);
  ctx.fillStyle = titleGrad;
  ctx.shadowBlur = 22;
  ctx.shadowColor = "rgba(247, 210, 117, .5)";
  ctx.fillText("SERPENT", W / 2, 164);
  ctx.fillText("RIFT", W / 2, 216);
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = "rgba(255, 255, 255, .72)";
  ctx.strokeText("SERPENT", W / 2, 164);
  ctx.strokeText("RIFT", W / 2, 216);

  ctx.shadowBlur = 10;
  ctx.shadowColor = "#000000";
  ctx.font = "700 12px Georgia, serif";
  ctx.fillStyle = "rgba(235, 224, 192, .88)";
  ctx.fillText("ANIME DUNGEON RAID SAGA", W / 2, 242);

  const pulse = 0.65 + Math.sin(t * 2.4) * 0.14;
  ctx.globalCompositeOperation = "lighter";
  const buttonGlow = ctx.createRadialGradient(W / 2, H * 0.82, 8, W / 2, H * 0.82, 142);
  buttonGlow.addColorStop(0, `rgba(255, 220, 134, ${0.18 + pulse * 0.12})`);
  buttonGlow.addColorStop(0.58, "rgba(126, 202, 255, .08)");
  buttonGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = buttonGlow;
  ctx.fillRect(0, H * 0.68, W, H * 0.22);
  ctx.globalCompositeOperation = "source-over";

  const bx = W / 2 - 118;
  const by = H * 0.805;
  const bw = 236;
  const bh = 52;
  drawUiFrame(15, bx, by - 6, bw, bh + 12, 0.98, 36);
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#e4b15b";
  ctx.font = "900 16px Georgia, serif";
  ctx.fillStyle = "rgba(255, 245, 214, .96)";
  ctx.fillText("ENTER THE RIFT", W / 2, by + 33);

  ctx.shadowBlur = 0;
  ctx.font = "700 11px Georgia, serif";
  ctx.fillStyle = "rgba(198, 185, 159, .72)";
  ctx.fillText("TAP ANYWHERE TO BEGIN", W / 2, H * 0.905);
  ctx.restore();
  ctx.restore();
}

function wrapDialogue(text, maxWidth) {
  const lines = [];
  let line = "";
  for (const ch of String(text ?? "")) {
    const next = line + ch;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function ellipsizeText(text, maxWidth) {
  const source = String(text ?? "");
  if (ctx.measureText(source).width <= maxWidth) return source;
  const suffix = "...";
  let out = source;
  while (out.length > 0 && ctx.measureText(out + suffix).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return out ? out + suffix : suffix;
}

function drawFitText(text, x, y, maxWidth, options = {}) {
  const {
    minSize = 8,
    maxSize = 12,
    weight = "800",
    family = "Segoe UI",
    align = "left",
    color = null,
    baseline = "alphabetic",
  } = options;
  let size = maxSize;
  const source = String(text ?? "");
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(source).width <= maxWidth) break;
    size -= 1;
  }
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (color) ctx.fillStyle = color;
  ctx.fillText(ellipsizeText(source, maxWidth), x, y);
}

function fitLinesToBox(text, maxWidth, maxLines) {
  const lines = wrapDialogue(text, maxWidth);
  if (lines.length <= maxLines) return lines;
  const safeLines = lines.slice(0, maxLines);
  safeLines[maxLines - 1] = ellipsizeText(safeLines[maxLines - 1] + lines.slice(maxLines).join(""), maxWidth);
  return safeLines;
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines, options = {}) {
  const { align = "left", color = null } = options;
  ctx.textAlign = align;
  if (color) ctx.fillStyle = color;
  fitLinesToBox(text, maxWidth, maxLines).forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });
}

function drawAnimeIntro() {
  const scene = introScenes[Math.min(state.introIndex, introScenes.length - 1)];
  const t = state.t;
  const img = bg.complete ? bg : currentStage().image;
  ctx.save();
  if (img.complete && img.naturalWidth > 0) {
    const scale = Math.max(W / img.width, H / img.height);
    const bw = img.width * scale;
    const bh = img.height * scale;
    ctx.filter = "saturate(1.18) contrast(1.08) brightness(.72)";
    ctx.drawImage(img, (W - bw) / 2, (H - bh) / 2, bw, bh);
    ctx.filter = "none";
  } else {
    ctx.fillStyle = "#07101b";
    ctx.fillRect(0, 0, W, H);
  }

  const wash = ctx.createLinearGradient(0, 0, W, H);
  wash.addColorStop(0, "rgba(58, 212, 255, .16)");
  wash.addColorStop(0.48, "rgba(16, 20, 42, .28)");
  wash.addColorStop(1, "rgba(255, 210, 106, .10)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 9; i += 1) {
    const p = (t * 0.08 + i / 9) % 1;
    ctx.strokeStyle = `rgba(126, 230, 255, ${0.04 + (1 - p) * 0.08})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(W * p - 80, H * 0.1 + i * 82);
    ctx.lineTo(W * p + 70, H * 0.02 + i * 82);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  const heroActive = scene.side === "left";
  const heroAlpha = heroActive ? 1 : 0.48;
  const guideAlpha = heroActive ? 0.48 : 1;

  function drawPortrait(sprite, x, y, w, h, flip, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = alpha > 0.8 ? 26 : 10;
    ctx.shadowColor = alpha > 0.8 ? "#8df2ff" : "#000000";
    if (flip) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      x = 0;
      y = 0;
    }
    if (sprite.complete && sprite.naturalWidth > 0) {
      ctx.drawImage(sprite, x, y, w, h);
    }
    ctx.restore();
  }

  drawPortrait(sprites.portraitHero, -36, H * 0.19 + Math.sin(t * 1.8) * 3, 250, 330, false, heroAlpha);
  drawPortrait(sprites.portraitGuide, W - 218, H * 0.18 + Math.sin(t * 1.6 + 1) * 3, 250, 330, false, guideAlpha);

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 13px Segoe UI";
  ctx.fillStyle = "rgba(255,255,255,.82)";
  ctx.fillText("ANIME DUNGEON INTRO", W / 2, 42);
  ctx.strokeStyle = "rgba(255,255,255,.24)";
  ctx.beginPath();
  ctx.moveTo(50, 52);
  ctx.lineTo(W - 50, 52);
  ctx.stroke();
  ctx.restore();

  const boxX = 22;
  const boxY = H - 202;
  const boxW = W - 44;
  const boxH = 154;
  drawUiFrame(10, boxX, boxY, boxW, boxH, 0.96, 42);
  ctx.fillStyle = "rgba(8, 18, 34, .36)";
  roundRect(boxX + 20, boxY + 22, boxW - 40, boxH - 38, 14);
  ctx.fill();
  ctx.strokeStyle = scene.side === "left" ? "#68dfff" : "#ffd96b";
  ctx.lineWidth = 3;
  ctx.stroke();

  const nameX = scene.side === "left" ? boxX + 26 : boxX + boxW - 126;
  drawUiFrame(1, nameX - 8, boxY - 30, 120, 46, 0.94, 26);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 15px Segoe UI";
  ctx.textAlign = "center";
  drawFitText(scene.speaker, nameX + 52, boxY, 104, { maxSize: 15, minSize: 10, weight: "900", align: "center", color: "#ffffff" });

  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 16px Segoe UI";
  const visible = Math.min(scene.line.length, Math.floor(state.introTime * 28));
  const text = visible >= scene.line.length ? scene.line : scene.line.slice(0, visible);
  const textX = boxX + 28;
  const textY = boxY + 47;
  const textW = boxW - 56;
  const textH = 78;
  ctx.save();
  roundRect(textX - 4, textY - 19, textW + 8, textH + 10, 8);
  ctx.clip();
  drawWrappedText(text, textX, textY, textW, 24, 4, { align: "left", color: "#ffffff" });
  ctx.restore();

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,.72)";
  ctx.font = "800 11px Segoe UI";
  drawFitText("TAP / ENTER", boxX + boxW - 24, boxY + boxH - 18, 116, { maxSize: 11, minSize: 8, weight: "800", align: "right", color: "rgba(255,255,255,.72)" });
  ctx.restore();
}

function resetCanvasState() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function restoreCanvasDepth(targetDepth) {
  while (canvasSaveDepth > targetDepth) ctx.restore();
  resetCanvasState();
}

let lastRenderFaultLog = 0;

function reportRenderFault(label, err) {
  const now = performance.now();
  if (now - lastRenderFaultLog < 900) return;
  lastRenderFaultLog = now;
  console.warn(`[${label}] unstable render isolated`, err);
}

function drawSafe(list, index, drawer, label) {
  const item = list[index];
  const depth = canvasSaveDepth;
  try {
    drawer(item);
  } catch (err) {
    list.splice(index, 1);
    restoreCanvasDepth(depth);
    reportRenderFault(label, err);
  }
}

function draw() {
  resetCanvasState();
  if (state.screen === "title") {
    drawTitleScreen();
    return;
  }
  if (state.screen === "intro") {
    drawAnimeIntro();
    return;
  }
  if (state.screen === "town") {
    drawTownScreen();
    return;
  }
  ctx.save();
  const impactShake = Math.min(state.shake, 16);
  if (impactShake > 0.1) {
    const power = impactShake * 0.34;
    const sx = Math.sin(state.t * 118) * power;
    const sy = Math.cos(state.t * 91) * power * 0.68;
    ctx.translate(sx, sy);
  }
  drawBackground();
  for (let i = hazards.length - 1; i >= 0; i -= 1) drawSafe(hazards, i, drawHazard, "hazard");
  for (let i = projectiles.length - 1; i >= 0; i -= 1) drawSafe(projectiles, i, drawProjectile, "projectile");
  lootDrops.sort((a, b) => a.y - b.y);
  for (let i = lootDrops.length - 1; i >= 0; i -= 1) drawSafe(lootDrops, i, drawLootDrop, "loot");
  for (const p of pickups) {
    ctx.fillStyle = `rgba(255, 220, 96, ${clamp(p.life, 0, 1)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5 + Math.sin(state.t * 8) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  enemies.sort((a, b) => a.y - b.y);
  for (let i = enemies.length - 1; i >= 0; i -= 1) drawSafe(enemies, i, drawEntity, "enemy");
  const companionsToDraw = [...partyMembers, ...(player.mounted ? [] : [pet])].sort((a, b) => a.y - b.y);
  for (let i = companionsToDraw.length - 1; i >= 0; i -= 1) {
    const depth = canvasSaveDepth;
    try {
      drawCompanion(companionsToDraw[i]);
    } catch (err) {
      restoreCanvasDepth(depth);
      reportRenderFault("companion", err);
    }
  }
  drawPlayer();
  for (const p of particles) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.size)) continue;
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (let i = hits.length - 1; i >= 0; i -= 1) drawSafe(hits, i, drawDamageNumber, "damage");
  ctx.restore();

  if (state.lootFlash > 0) {
    ctx.fillStyle = `rgba(255, 226, 93, ${state.lootFlash * 0.015})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (state.powerFlash > 0) {
    const a = Math.min(0.12, state.powerFlash);
    ctx.globalCompositeOperation = "lighter";
    const r = 230;
    const rg = ctx.createRadialGradient(player.x, player.y, 12, player.x, player.y, r);
    rg.addColorStop(0, `rgba(255,245,164,${a * 0.22})`);
    rg.addColorStop(0.3, `rgba(88,230,255,${a * 0.08})`);
    rg.addColorStop(0.74, `rgba(150,74,255,${a * 0.035})`);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(player.x - r, player.y - r, r * 2, r * 2);
    ctx.globalCompositeOperation = "source-over";
  }
  if (state.shockwave > 0) {
    const p = 1 - state.shockwave;
    ctx.save();
    ctx.globalAlpha = state.shockwave * 0.2;
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.lineWidth = 6;
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#7df3ff";
    ctx.beginPath();
    ctx.ellipse(player.x, player.y, 80 + p * 220, 24 + p * 76, player.facing, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  if (player.attackAnim > 0) {
    const p = clamp(1 - player.attackAnim / 0.46, 0, 1);
    const flash = Math.sin(p * Math.PI);
    const r = 180;
    const g = ctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, r);
    g.addColorStop(0, `rgba(255,255,255,${0.075 * flash})`);
    g.addColorStop(0.34, `rgba(95,232,255,${0.05 * flash})`);
    g.addColorStop(0.72, `rgba(255,218,78,${0.026 * flash})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(player.x - r, player.y - r, r * 2, r * 2);
  }
  drawRaidOverlay();
  drawUi();
  drawQuestToast();
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  try {
    if (state.screen === "title" || state.screen === "intro" || state.screen === "town") {
      state.t += dt;
      if (state.screen === "intro") state.introTime += dt;
      if (state.screen === "town") {
        state.townMessageTime = Math.max(0, state.townMessageTime - dt);
        state.questToastTime = Math.max(0, state.questToastTime - dt);
        state.questPulse = Math.max(0, state.questPulse - dt * 1.8);
      }
    }
    else if (!state.paused) update(dt);
    draw();
    presentFrame();
  } catch (err) {
    reportRenderFault("game loop", err);
    restoreCanvasDepth(0);
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
  input.joyStartY = H - 232;
  input.joyX = input.joyStartX;
  input.joyY = input.joyStartY;
  input.moveX = 0;
  input.moveY = 0;
}

function handleTownPointer(p) {
  if (state.townPanel) {
    const panelX = 26;
    const panelY = 154;
    const panelW = W - 52;
    if (p.x > panelX + panelW - 64 && p.x < panelX + panelW - 18 && p.y > panelY + 18 && p.y < panelY + 66) {
      state.townPanel = null;
      return;
    }
    if (state.townPanel === "gate") {
      if (p.x > panelX + 60 && p.x < panelX + panelW - 60 && p.y > panelY + 226 && p.y < panelY + 300) enterDungeon();
      return;
    }
    if (state.townPanel === "guild") {
      townContracts.forEach((contract, i) => {
        const cy = panelY + 122 + i * 92;
        if (p.x > panelX + 28 && p.x < panelX + panelW - 28 && p.y > cy && p.y < cy + 76) acceptTownContract(contract);
      });
      return;
    }
    const items = townShopItems[state.townPanel] || [];
    items.forEach((item, i) => {
      const iy = panelY + 128 + i * 108;
      if (p.x > panelX + 32 && p.x < panelX + panelW - 32 && p.y > iy && p.y < iy + 86) buyTownItem(item);
    });
    return;
  }
  for (const building of townBuildings) {
    if (p.x > building.x && p.x < building.x + building.w && p.y > building.y && p.y < building.y + building.h) {
      if (building.id === "gate") {
        state.townPanel = "gate";
      } else {
        state.townPanel = building.id;
      }
      state.townMessage = `${building.name} 방문`;
      state.townMessageTime = 1.5;
      return;
    }
  }
}

function handlePointer(ev) {
  ev.preventDefault();
  if (state.screen === "title") {
    startGame();
    return;
  }
  if (state.screen === "intro") {
    advanceIntro();
    return;
  }
  if (state.screen === "town") {
    ensureAudio();
    handleTownPointer(canvasPoint(ev));
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
  if (p.y > 122 && p.y < 170 && p.x > W - 218 && p.x < W - 168) {
    enterTown("마을로 귀환했다");
    input.down = false;
    return;
  }
  if (p.y > 122 && p.y < 170 && p.x > W - 168 && p.x < W - 18) {
    state.panel = p.x < W - 116 ? "quests" : p.x < W - 66 ? "inventory" : "skills";
    input.down = false;
    resetJoystick();
    return;
  }
  if (p.x > W - 68 && p.x < W - 16 && p.y > 180 && p.y < 228) {
    toggleMount();
    input.down = false;
    resetJoystick();
    return;
  }
  for (let i = 0; i < skills.length; i += 1) {
    const bx = W - 52;
    const by = 256 + i * 50;
    if (dist(p.x, p.y, bx, by) < 28) {
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
    state.bossMode = false;
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
  if (state.screen === "intro") {
    handlePointer(ev);
    return;
  }
  if (state.screen === "town") {
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
  if (state.screen === "intro") {
    if (ev.key === "Enter" || ev.key === " ") advanceIntro();
    return;
  }
  if (state.screen === "town") {
    if (ev.key === "Enter" || ev.key === " ") enterDungeon();
    if (ev.key.toLowerCase() === "escape") state.townPanel = null;
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
  if (ev.key.toLowerCase() === "r") toggleMount();
  if (ev.key.toLowerCase() === "t") enterTown("마을로 귀환했다");
  if (ev.key.toLowerCase() === "q") castUltimate();
  input.keys.add(ev.key.toLowerCase());
});
window.addEventListener("keyup", (ev) => {
  input.keys.delete(ev.key.toLowerCase());
});

for (let i = 0; i < 4; i += 1) spawnEnemy(i === 0 ? "elite" : "shade");
requestAnimationFrame(loop);
