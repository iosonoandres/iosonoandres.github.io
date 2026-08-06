export const VIEW_WIDTH = 1000;
export const VIEW_HEIGHT = 450;
export const WORLD_WIDTH = 6800;
export const GROUND_Y = 374;
export const PLAYER_SIZE = 58;
export const GOAL_X = 6680;
export const REQUIRED_TOKENS = 14;
export const BOSS_MAX_HP = 5;

export const platforms = [
  { x: 280, y: 300, w: 180, h: 18 }, { x: 650, y: 252, w: 190, h: 18 },
  { x: 1010, y: 302, w: 180, h: 18 }, { x: 1330, y: 260, w: 210, h: 18 },
  { x: 1740, y: 300, w: 190, h: 18 }, { x: 2070, y: 245, w: 210, h: 18 },
  { x: 2450, y: 298, w: 180, h: 18 }, { x: 2780, y: 250, w: 220, h: 18 },
  { x: 3380, y: 300, w: 190, h: 18 }, { x: 3710, y: 242, w: 210, h: 18 },
  { x: 4090, y: 298, w: 180, h: 18 }, { x: 4450, y: 248, w: 220, h: 18 },
  { x: 5090, y: 300, w: 190, h: 18 }, { x: 5430, y: 242, w: 215, h: 18 },
  { x: 5780, y: 300, w: 180, h: 18 },
];

export const hazards = [
  { x: 520, w: 42 }, { x: 1215, w: 48 }, { x: 1575, w: 42 },
  { x: 2310, w: 50 }, { x: 3035, w: 46 }, { x: 3260, w: 42 },
  { x: 3980, w: 50 }, { x: 4745, w: 48 }, { x: 4990, w: 42 },
  { x: 5680, w: 50 }, { x: 5965, w: 42 },
];

export const tokenPositions = [
  { x: 370, y: 250 }, { x: 745, y: 205 }, { x: 1090, y: 252 }, { x: 1435, y: 212 },
  { x: 1825, y: 252 }, { x: 2175, y: 198 }, { x: 2535, y: 250 }, { x: 2885, y: 202 },
  { x: 3200, y: 300 }, { x: 3470, y: 252 }, { x: 3815, y: 195 }, { x: 4170, y: 248 },
  { x: 4560, y: 200 }, { x: 4870, y: 300 }, { x: 5180, y: 252 }, { x: 5535, y: 195 },
  { x: 5870, y: 252 }, { x: 6150, y: 300 },
];

export const powerUps = [
  { x: 760, y: 205, type: 'shield', label: 'S' },
  { x: 1460, y: 212, type: 'magnet', label: 'M' },
  { x: 2200, y: 198, type: 'turbo', label: '⚡' },
  { x: 2910, y: 202, type: 'repair', label: '+' },
  { x: 3835, y: 195, type: 'double', label: '2×' },
  { x: 4575, y: 200, type: 'freeze', label: '❄' },
  { x: 5550, y: 195, type: 'pulse', label: 'P' },
];

export const checkpoints = [1620, 3290, 4970];

export const zones = [
  { start: 0, end: 1650, level: '01', name: 'LOCAL LAB', mood: 'lab', colors: ['#101a2a', '#17304a', '#66dce2'] },
  { start: 1650, end: 3300, level: '02', name: 'DATA TRANSIT', mood: 'data', colors: ['#10203a', '#183f59', '#7ca5ff'] },
  { start: 3300, end: 5000, level: '03', name: 'HYBRID CLOUD', mood: 'cloud', colors: ['#18213b', '#344263', '#a98cff'] },
  { start: 5000, end: WORLD_WIDTH, level: '04', name: 'GOVERNED PROD', mood: 'prod', colors: ['#152839', '#214b4b', '#9ce56d'] },
];

export const movingPlatforms = [
  { baseX: 1880, baseY: 285, w: 145, h: 16, axis: 'y', range: 42, speed: .00125, phase: 0 },
  { baseX: 3140, baseY: 270, w: 140, h: 16, axis: 'x', range: 80, speed: .00105, phase: 1.4 },
  { baseX: 4800, baseY: 272, w: 145, h: 16, axis: 'y', range: 40, speed: .00135, phase: 2.5 },
];

export const enemyTemplates = [
  { x: 890, y: GROUND_Y - 44, minX: 850, maxX: 1120, speed: 1.05, kind: 'bot', size: 44 },
  { x: 1390, y: 214, minX: 1350, maxX: 1490, speed: .75, kind: 'bot', size: 42 },
  { x: 1940, y: 264, minX: 1880, maxX: 2240, speed: 1.15, kind: 'drone', size: 42, phase: .8 },
  { x: 2520, y: GROUND_Y - 46, minX: 2410, maxX: 2730, speed: 1.25, kind: 'bot', size: 46 },
  { x: 3110, y: 205, minX: 3020, maxX: 3260, speed: 1.05, kind: 'drone', size: 42, phase: 2.1 },
  { x: 3740, y: GROUND_Y - 46, minX: 3650, maxX: 4030, speed: 1.35, kind: 'bot', size: 46 },
  { x: 4380, y: 198, minX: 4280, maxX: 4620, speed: 1.2, kind: 'drone', size: 44, phase: 3.4 },
  { x: 5200, y: GROUND_Y - 48, minX: 5100, maxX: 5410, speed: 1.4, kind: 'bot', size: 48 },
  { x: 5700, y: 220, minX: 5600, maxX: 5910, speed: 1.25, kind: 'drone', size: 44, phase: 1.7 },
];

export const bossTemplate = {
  x: 6290, y: GROUND_Y - 88, minX: 6120, maxX: 6540, speed: 1.15,
  direction: -1, size: 88, hp: BOSS_MAX_HP, maxHp: BOSS_MAX_HP, alive: true,
};

export const getMovingPlatform = (platform, elapsed) => ({
  x: platform.baseX + (platform.axis === 'x' ? Math.sin(elapsed * platform.speed + platform.phase) * platform.range : 0),
  y: platform.baseY + (platform.axis === 'y' ? Math.sin(elapsed * platform.speed + platform.phase) * platform.range : 0),
  w: platform.w,
  h: platform.h,
});

