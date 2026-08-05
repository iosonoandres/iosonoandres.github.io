import { useCallback, useEffect, useRef, useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import openClawSprite from '../../assets/game/openclaw-sprite.png';

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 450;
const WORLD_WIDTH = 5200;
const GROUND_Y = 374;
const PLAYER_SIZE = 58;
const GOAL_X = 5050;
const REQUIRED_TOKENS = 10;

const platforms = [
  { x: 300, y: 300, w: 170, h: 18 }, { x: 690, y: 252, w: 190, h: 18 },
  { x: 1010, y: 306, w: 155, h: 18 }, { x: 1320, y: 232, w: 225, h: 18 },
  { x: 1690, y: 286, w: 180, h: 18 }, { x: 2040, y: 216, w: 190, h: 18 },
  { x: 2390, y: 295, w: 160, h: 18 }, { x: 2730, y: 235, w: 230, h: 18 },
  { x: 3130, y: 305, w: 170, h: 18 }, { x: 3470, y: 218, w: 215, h: 18 },
  { x: 3850, y: 280, w: 175, h: 18 }, { x: 4190, y: 205, w: 220, h: 18 },
  { x: 4580, y: 278, w: 180, h: 18 },
];

const hazards = [
  { x: 530, w: 52 }, { x: 1205, w: 56 }, { x: 1585, w: 52 }, { x: 2265, w: 58 },
  { x: 3015, w: 56 }, { x: 3725, w: 58 }, { x: 4450, w: 60 }, { x: 4830, w: 52 },
];

const tokenPositions = [
  { x: 380, y: 252 }, { x: 775, y: 204 }, { x: 1085, y: 258 }, { x: 1430, y: 184 },
  { x: 1775, y: 238 }, { x: 2130, y: 168 }, { x: 2470, y: 247 }, { x: 2840, y: 187 },
  { x: 3215, y: 257 }, { x: 3580, y: 170 }, { x: 3935, y: 232 }, { x: 4310, y: 157 },
  { x: 4665, y: 230 }, { x: 4900, y: 310 },
];

const powerUps = [
  { x: 850, y: 202, type: 'shield', label: 'S' },
  { x: 1460, y: 182, type: 'magnet', label: 'M' },
  { x: 2200, y: 166, type: 'turbo', label: '⚡' },
  { x: 2880, y: 185, type: 'repair', label: '+' },
  { x: 3600, y: 168, type: 'double', label: '2×' },
  { x: 4320, y: 155, type: 'freeze', label: '❄' },
];

const checkpoints = [1840, 3650];

const zones = [
  { start: 0, end: 1800, level: '01', name: 'LOCAL LAB', tint: 'rgba(101,165,255,.035)' },
  { start: 1800, end: 3650, level: '02', name: 'HYBRID CLOUD', tint: 'rgba(104,217,223,.045)' },
  { start: 3650, end: WORLD_WIDTH, level: '03', name: 'GOVERNED PROD', tint: 'rgba(217,233,118,.035)' },
];

const movingPlatforms = [
  { baseX: 1900, baseY: 305, w: 145, h: 16, axis: 'y', range: 72, speed: .00125, phase: 0 },
  { baseX: 3270, baseY: 255, w: 140, h: 16, axis: 'x', range: 105, speed: .00105, phase: 1.4 },
  { baseX: 4470, baseY: 225, w: 135, h: 16, axis: 'y', range: 82, speed: .00135, phase: 2.5 },
];

const enemyTemplates = [
  { x: 900, y: GROUND_Y - 44, minX: 885, maxX: 1120, speed: 1.05, kind: 'bot', size: 44 },
  { x: 1360, y: 188, minX: 1335, maxX: 1490, speed: .75, kind: 'bot', size: 42 },
  { x: 1910, y: 275, minX: 1890, maxX: 2160, speed: 1.15, kind: 'drone', size: 42, phase: .8 },
  { x: 2500, y: GROUND_Y - 46, minX: 2440, maxX: 2720, speed: 1.25, kind: 'bot', size: 46 },
  { x: 3030, y: 190, minX: 2970, maxX: 3250, speed: 1.05, kind: 'drone', size: 42, phase: 2.1 },
  { x: 3740, y: GROUND_Y - 46, minX: 3690, maxX: 4050, speed: 1.35, kind: 'bot', size: 46 },
  { x: 4250, y: 164, minX: 4160, maxX: 4430, speed: 1.2, kind: 'drone', size: 44, phase: 3.4 },
  { x: 4700, y: GROUND_Y - 58, minX: 4600, maxX: 4870, speed: 1.25, kind: 'guardian', size: 58, hp: 2 },
];

const getMovingPlatform = (platform, elapsed) => ({
  x: platform.baseX + (platform.axis === 'x' ? Math.sin(elapsed * platform.speed + platform.phase) * platform.range : 0),
  y: platform.baseY + (platform.axis === 'y' ? Math.sin(elapsed * platform.speed + platform.phase) * platform.range : 0),
  w: platform.w,
  h: platform.h,
});

const roundedRect = (context, x, y, width, height, radius) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
};

const overlaps = (a, b) => (
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
);

const OpenClawGame = ({ isOpen, onClose }) => {
  const canvasRef = useRef(null);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const frameRef = useRef(0);
  const keysRef = useRef({ left: false, right: false, jump: false });
  const stateRef = useRef(null);
  const spriteRef = useRef(null);
  const audioRef = useRef(null);
  const mutedRef = useRef(false);
  const [status, setStatus] = useState('ready');
  const [hud, setHud] = useState({ tokens: 0, lives: 3, power: '—', zone: 1 });
  const [muted, setMuted] = useState(false);
  const { content, theme } = usePreferences();
  const labels = content.game;

  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioRef.current = new AudioContext();
    }
    if (audioRef.current?.state === 'suspended') audioRef.current.resume();
  }, []);

  const playSound = useCallback((type) => {
    if (mutedRef.current) return;
    ensureAudio();
    const audio = audioRef.current;
    if (!audio) return;
    const sounds = {
      start: [330, .11, 'sine'], jump: [260, .07, 'sine'], token: [660, .08, 'triangle'],
      power: [520, .15, 'sine'], stomp: [150, .08, 'square'], hit: [95, .16, 'sawtooth'],
      shield: [420, .13, 'triangle'], checkpoint: [740, .13, 'sine'], blocked: [120, .09, 'square'],
      win: [880, .3, 'sine'], fail: [75, .28, 'sawtooth'],
    };
    const [frequency, duration, wave] = sounds[type] || sounds.token;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    if (type === 'win' || type === 'power') oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, audio.currentTime + duration);
    gain.gain.setValueAtTime(.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.035, audio.currentTime + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration + .02);
  }, [ensureAudio]);

  const syncHud = useCallback((state, now = performance.now()) => {
    const powers = [];
    if (state.shield) powers.push('SHIELD');
    if (state.doubleJump) powers.push('2× JUMP');
    if (state.turboUntil > now) powers.push('TURBO');
    if (state.magnetUntil > now) powers.push('MAGNET');
    if (state.freezeUntil > now) powers.push('FREEZE');
    setHud({ tokens: state.collected.size, lives: state.lives, power: powers.join(' + ') || '—', zone: state.zone + 1 });
  }, []);

  const resetGame = useCallback((nextStatus = 'running') => {
    const state = {
      player: { x: 76, y: GROUND_Y - PLAYER_SIZE, vx: 0, vy: 0, grounded: true, jumps: 0 },
      cameraX: 0,
      collected: new Set(),
      claimedPower: new Set(),
      enemies: enemyTemplates.map((enemy) => ({ ...enemy, direction: 1, alive: true, baseY: enemy.y })),
      particles: [],
      checkpoint: 76,
      reachedCheckpoints: new Set(),
      lives: 3,
      shield: false,
      doubleJump: false,
      turboUntil: 0,
      magnetUntil: 0,
      freezeUntil: 0,
      invincibleUntil: 0,
      blockedUntil: 0,
      zone: 0,
      zoneBannerUntil: performance.now() + 1800,
      lastTime: 0,
    };
    stateRef.current = state;
    keysRef.current = { left: false, right: false, jump: false };
    setHud({ tokens: 0, lives: 3, power: '—', zone: 1 });
    setStatus(nextStatus);
  }, []);

  const startGame = () => {
    ensureAudio();
    resetGame('running');
    playSound('start');
  };

  useEffect(() => {
    const image = new Image();
    image.src = openClawSprite;
    spriteRef.current = image;
    return () => audioRef.current?.close();
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    if (!stateRef.current) resetGame('ready');
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key === 'escape') { onClose(); return; }
      if (key === 'tab') {
        const controls = [...(dialogRef.current?.querySelectorAll('button') || [])].filter((button) => !button.disabled);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        return;
      }
      if (['arrowleft', 'arrowright', 'arrowup', ' ', 'a', 'd', 'w'].includes(key)) event.preventDefault();
      if (key === 'arrowleft' || key === 'a') keysRef.current.left = true;
      if (key === 'arrowright' || key === 'd') keysRef.current.right = true;
      if (key === 'arrowup' || key === 'w' || key === ' ') keysRef.current.jump = true;
    };
    const onKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') keysRef.current.left = false;
      if (key === 'arrowright' || key === 'd') keysRef.current.right = false;
      if (key === 'arrowup' || key === 'w' || key === ' ') keysRef.current.jump = false;
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (audioRef.current?.state === 'running') audioRef.current.suspend();
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose, resetGame]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return undefined;

    const palette = theme === 'dark'
      ? { sky: '#111b2b', skyEnd: '#1b2940', grid: 'rgba(117,229,237,.09)', ground: '#26364b', ink: '#f2f5ee', platform: '#6ee7e9', coral: '#ff766d', cloud: 'rgba(255,255,255,.07)', enemy: '#ef5d63' }
      : { sky: '#eef7f4', skyEnd: '#dfeeff', grid: 'rgba(31,79,191,.08)', ground: '#173f74', ink: '#11233d', platform: '#24b8c7', coral: '#f45f57', cloud: 'rgba(255,255,255,.72)', enemy: '#d94d57' };

    const burst = (state, x, y, color, count = 8) => {
      for (let index = 0; index < count; index += 1) {
        state.particles.push({ x, y, vx: (Math.random() - .5) * 5, vy: -Math.random() * 4, life: 34 + Math.random() * 18, color });
      }
    };

    const drawEnemy = (enemy, cameraX, elapsed) => {
      const x = enemy.x - cameraX;
      const y = enemy.kind === 'drone' ? enemy.baseY + Math.sin(elapsed / 420 + enemy.phase) * 26 : enemy.y;
      context.save();
      context.translate(x + enemy.size / 2, y + enemy.size / 2);
      if (enemy.kind === 'drone') {
        context.strokeStyle = palette.enemy; context.lineWidth = 3;
        context.beginPath(); context.moveTo(-24, -15); context.lineTo(24, -15); context.stroke();
        context.fillStyle = palette.enemy;
        context.beginPath(); context.ellipse(0, 0, enemy.size / 2, enemy.size / 2.7, 0, 0, Math.PI * 2); context.fill();
      } else {
        context.fillStyle = enemy.kind === 'guardian' ? '#8d6be8' : palette.enemy;
        roundedRect(context, -enemy.size / 2, -enemy.size / 2, enemy.size, enemy.size, 12);
        context.fillStyle = enemy.kind === 'guardian' ? '#5b3ca8' : '#8f2936';
        context.fillRect(-enemy.size / 2 + 7, enemy.size / 2 - 2, 10, 7);
        context.fillRect(enemy.size / 2 - 17, enemy.size / 2 - 2, 10, 7);
      }
      context.fillStyle = '#0c2638';
      context.beginPath(); context.arc(-8, -3, 5, 0, Math.PI * 2); context.arc(8, -3, 5, 0, Math.PI * 2); context.fill();
      context.fillStyle = '#75f1ed';
      context.beginPath(); context.arc(-8, -3, 2, 0, Math.PI * 2); context.arc(8, -3, 2, 0, Math.PI * 2); context.fill();
      if (enemy.kind === 'guardian') {
        context.fillStyle = '#fff';
        for (let hit = 0; hit < enemy.hp; hit += 1) {
          context.beginPath(); context.arc(-7 + hit * 14, -enemy.size / 2 - 8, 4, 0, Math.PI * 2); context.fill();
        }
      }
      context.restore();
      return y;
    };

    const draw = (state, elapsed) => {
      const cameraX = state.cameraX;
      const gradient = context.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
      gradient.addColorStop(0, palette.sky); gradient.addColorStop(1, palette.skyEnd);
      context.fillStyle = gradient; context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

      zones.forEach((zone) => {
        context.fillStyle = zone.tint;
        context.fillRect(zone.start - cameraX, 0, zone.end - zone.start, GROUND_Y);
      });

      context.strokeStyle = palette.grid; context.lineWidth = 1;
      for (let x = -(cameraX * .18) % 60; x < VIEW_WIDTH; x += 60) {
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, VIEW_HEIGHT); context.stroke();
      }
      for (let y = 28; y < GROUND_Y; y += 52) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(VIEW_WIDTH, y); context.stroke();
      }

      context.fillStyle = palette.cloud;
      [[150, 75, 180], [860, 108, 230], [1670, 62, 190], [2520, 96, 240], [3420, 72, 210], [4480, 105, 230]].forEach(([x, y, w]) => {
        roundedRect(context, x - cameraX * .32, y, w, 34, 18);
      });

      context.fillStyle = palette.ground; context.fillRect(0, GROUND_Y, VIEW_WIDTH, VIEW_HEIGHT - GROUND_Y);
      context.fillStyle = palette.platform; context.fillRect(0, GROUND_Y, VIEW_WIDTH, 7);

      platforms.forEach((platform) => {
        context.fillStyle = palette.platform;
        roundedRect(context, platform.x - cameraX, platform.y, platform.w, platform.h, 8);
        context.fillStyle = 'rgba(255,255,255,.35)';
        context.fillRect(platform.x - cameraX + 10, platform.y + 4, platform.w - 20, 2);
      });

      movingPlatforms.forEach((platform) => {
        const current = getMovingPlatform(platform, elapsed);
        context.fillStyle = '#a98cff';
        roundedRect(context, current.x - cameraX, current.y, current.w, current.h, 8);
        context.strokeStyle = 'rgba(255,255,255,.55)'; context.lineWidth = 2;
        context.beginPath(); context.moveTo(current.x - cameraX + 12, current.y + 5); context.lineTo(current.x - cameraX + current.w - 12, current.y + 5); context.stroke();
      });

      hazards.forEach((hazard) => {
        for (let x = hazard.x; x < hazard.x + hazard.w; x += 20) {
          context.fillStyle = palette.coral;
          context.beginPath(); context.moveTo(x - cameraX, GROUND_Y); context.lineTo(x + 10 - cameraX, GROUND_Y - 24); context.lineTo(x + 20 - cameraX, GROUND_Y); context.fill();
        }
      });

      checkpoints.forEach((checkpoint) => {
        const active = state.reachedCheckpoints.has(checkpoint);
        const x = checkpoint - cameraX;
        context.strokeStyle = active ? '#8be7a3' : palette.ink; context.lineWidth = 3;
        context.beginPath(); context.moveTo(x, GROUND_Y); context.lineTo(x, GROUND_Y - 95); context.stroke();
        context.fillStyle = active ? '#62d986' : palette.cloud;
        context.beginPath(); context.moveTo(x + 2, GROUND_Y - 92); context.lineTo(x + 48, GROUND_Y - 76); context.lineTo(x + 2, GROUND_Y - 60); context.fill();
      });

      tokenPositions.forEach((token, index) => {
        if (state.collected.has(index)) return;
        const pulse = 1 + Math.sin(elapsed / 180 + index) * .12;
        context.save(); context.translate(token.x - cameraX, token.y); context.scale(pulse, pulse);
        context.fillStyle = '#f4c84d'; context.strokeStyle = '#fff2a8'; context.lineWidth = 3;
        context.beginPath(); context.arc(0, 0, 12, 0, Math.PI * 2); context.fill(); context.stroke();
        context.fillStyle = '#7c5a00'; context.font = '700 11px sans-serif'; context.textAlign = 'center'; context.fillText('AI', 0, 4);
        context.restore();
      });

      powerUps.forEach((power, index) => {
        if (state.claimedPower.has(index)) return;
        const y = power.y + Math.sin(elapsed / 260 + index) * 7;
        const colors = { shield: '#65a5ff', turbo: '#ffd35b', double: '#9ce56d', magnet: '#ef80d6', repair: '#7ee29a', freeze: '#79e8f0' };
        context.save(); context.translate(power.x - cameraX, y);
        context.shadowBlur = 16; context.shadowColor = colors[power.type];
        context.fillStyle = colors[power.type]; context.beginPath(); context.arc(0, 0, 17, 0, Math.PI * 2); context.fill();
        context.shadowBlur = 0; context.fillStyle = '#14233b'; context.font = '800 12px sans-serif'; context.textAlign = 'center'; context.fillText(power.label, 0, 4);
        context.restore();
      });

      state.enemies.forEach((enemy) => { if (enemy.alive) drawEnemy(enemy, cameraX, elapsed); });

      const goalX = GOAL_X - cameraX;
      context.strokeStyle = palette.ink; context.lineWidth = 5;
      context.beginPath(); context.moveTo(goalX, GROUND_Y); context.lineTo(goalX, 135); context.stroke();
      context.fillStyle = palette.coral;
      context.beginPath(); context.moveTo(goalX + 2, 140); context.lineTo(goalX + 96, 171); context.lineTo(goalX + 2, 204); context.fill();
      context.fillStyle = palette.ink; context.font = '700 12px sans-serif'; context.textAlign = 'left'; context.fillText(`PROD · ${REQUIRED_TOKENS} AI`, goalX + 18, 176);

      if (state.blockedUntil > elapsed) {
        context.fillStyle = 'rgba(12,25,42,.82)'; roundedRect(context, VIEW_WIDTH / 2 - 130, 26, 260, 40, 20);
        context.fillStyle = '#fff'; context.font = '700 13px sans-serif'; context.textAlign = 'center';
        context.fillText(`${REQUIRED_TOKENS - state.collected.size} AI TOKENS REQUIRED`, VIEW_WIDTH / 2, 51);
      }

      const activeZone = zones[state.zone];
      context.fillStyle = 'rgba(12,25,42,.72)'; roundedRect(context, 18, 18, 176, 34, 17);
      context.fillStyle = '#d9f5f4'; context.font = '700 11px sans-serif'; context.textAlign = 'left';
      context.fillText(`${activeZone.level} / ${activeZone.name}`, 34, 40);
      if (state.zoneBannerUntil > elapsed) {
        context.save(); context.globalAlpha = Math.min(1, (state.zoneBannerUntil - elapsed) / 450);
        context.fillStyle = 'rgba(12,25,42,.84)'; roundedRect(context, VIEW_WIDTH / 2 - 170, 78, 340, 66, 22);
        context.fillStyle = '#fff'; context.font = '500 24px serif'; context.textAlign = 'center'; context.fillText(activeZone.name, VIEW_WIDTH / 2, 117);
        context.restore();
      }

      state.particles = state.particles.filter((particle) => particle.life > 0);
      state.particles.forEach((particle) => {
        particle.x += particle.vx; particle.y += particle.vy; particle.vy += .14; particle.life -= 1;
        context.globalAlpha = Math.min(1, particle.life / 20); context.fillStyle = particle.color;
        context.beginPath(); context.arc(particle.x - cameraX, particle.y, 3, 0, Math.PI * 2); context.fill();
      });
      context.globalAlpha = 1;

      const player = state.player;
      const sprite = spriteRef.current;
      if (sprite?.complete) {
        context.save();
        if (state.invincibleUntil > elapsed && Math.floor(elapsed / 80) % 2 === 0) context.globalAlpha = .35;
        if (state.turboUntil > elapsed) {
          context.fillStyle = 'rgba(255,211,91,.22)'; context.beginPath(); context.ellipse(player.x - cameraX + 12, player.y + PLAYER_SIZE / 2, 42, 20, 0, 0, Math.PI * 2); context.fill();
        }
        if (player.vx < -.1) {
          context.translate(player.x - cameraX + PLAYER_SIZE, 0); context.scale(-1, 1); context.drawImage(sprite, 0, player.y, PLAYER_SIZE, PLAYER_SIZE);
        } else context.drawImage(sprite, player.x - cameraX, player.y, PLAYER_SIZE, PLAYER_SIZE);
        context.restore();
        if (state.shield) {
          context.strokeStyle = '#65a5ff'; context.lineWidth = 3; context.globalAlpha = .72;
          context.beginPath(); context.arc(player.x - cameraX + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2, PLAYER_SIZE * .63, 0, Math.PI * 2); context.stroke(); context.globalAlpha = 1;
        }
      }
    };

    const damagePlayer = (state, elapsed) => {
      if (state.invincibleUntil > elapsed) return;
      if (state.shield) {
        state.shield = false; state.invincibleUntil = elapsed + 1200;
        burst(state, state.player.x + PLAYER_SIZE / 2, state.player.y + PLAYER_SIZE / 2, '#65a5ff', 14);
        playSound('shield'); syncHud(state); return;
      }
      state.lives -= 1; playSound(state.lives > 0 ? 'hit' : 'fail'); syncHud(state);
      if (state.lives <= 0) { setStatus('gameover'); return; }
      state.player = { x: state.checkpoint, y: GROUND_Y - PLAYER_SIZE, vx: 0, vy: 0, grounded: true, jumps: 0 };
      state.cameraX = Math.max(0, state.checkpoint - 160); state.invincibleUntil = elapsed + 1700;
    };

    const tick = (time) => {
      const state = stateRef.current;
      if (!state) return;
      const delta = Math.min(1.8, state.lastTime ? (time - state.lastTime) / 16.667 : 1);
      state.lastTime = time;

      if (status === 'running') {
        const player = state.player;
        const oldBottom = player.y + PLAYER_SIZE;
        const direction = Number(keysRef.current.right) - Number(keysRef.current.left);
        const turbo = state.turboUntil > time;
        player.vx += direction * (turbo ? .92 : .7) * delta;
        player.vx *= Math.pow(.83, delta);
        player.vx = Math.max(turbo ? -10.2 : -7.2, Math.min(turbo ? 10.2 : 7.2, player.vx));

        if (keysRef.current.jump && (player.grounded || (state.doubleJump && player.jumps < 2))) {
          player.vy = player.grounded ? -12.5 : -11.2; player.grounded = false; player.jumps += 1; keysRef.current.jump = false; playSound('jump');
        }

        player.vy += .68 * delta;
        player.x = Math.max(0, Math.min(WORLD_WIDTH - PLAYER_SIZE, player.x + player.vx * delta));
        player.y += player.vy * delta; player.grounded = false;

        if (player.y + PLAYER_SIZE >= GROUND_Y) {
          player.y = GROUND_Y - PLAYER_SIZE; player.vy = 0; player.grounded = true; player.jumps = 0;
        }
        const activePlatforms = [...platforms, ...movingPlatforms.map((platform) => getMovingPlatform(platform, time))];
        activePlatforms.forEach((platform) => {
          const nextBottom = player.y + PLAYER_SIZE;
          const overlapsX = player.x + PLAYER_SIZE - 9 > platform.x && player.x + 9 < platform.x + platform.w;
          if (overlapsX && player.vy >= 0 && oldBottom <= platform.y + 8 && nextBottom >= platform.y) {
            player.y = platform.y - PLAYER_SIZE; player.vy = 0; player.grounded = true; player.jumps = 0;
          }
        });

        const hitHazard = hazards.some((hazard) => player.x + PLAYER_SIZE - 12 > hazard.x && player.x + 12 < hazard.x + hazard.w && player.y + PLAYER_SIZE > GROUND_Y - 24);
        if (hitHazard || player.y > VIEW_HEIGHT + 100) damagePlayer(state, time);

        tokenPositions.forEach((token, index) => {
          if (state.collected.has(index)) return;
          const collectionRadius = state.magnetUntil > time ? 180 : 45;
          if (Math.hypot(player.x + PLAYER_SIZE / 2 - token.x, player.y + PLAYER_SIZE / 2 - token.y) < collectionRadius) {
            state.collected.add(index); burst(state, token.x, token.y, '#f4c84d'); playSound('token'); syncHud(state, time);
          }
        });

        powerUps.forEach((power, index) => {
          if (state.claimedPower.has(index)) return;
          if (Math.hypot(player.x + PLAYER_SIZE / 2 - power.x, player.y + PLAYER_SIZE / 2 - power.y) < 49) {
            state.claimedPower.add(index);
            if (power.type === 'shield') state.shield = true;
            if (power.type === 'turbo') state.turboUntil = time + 9000;
            if (power.type === 'double') state.doubleJump = true;
            if (power.type === 'magnet') state.magnetUntil = time + 11000;
            if (power.type === 'freeze') state.freezeUntil = time + 9000;
            if (power.type === 'repair') {
              if (state.lives < 4) state.lives += 1;
              else state.shield = true;
            }
            burst(state, power.x, power.y, '#8de8de', 16); playSound('power'); syncHud(state, time);
          }
        });

        state.enemies.forEach((enemy) => {
          if (!enemy.alive) return;
          const freezeFactor = state.freezeUntil > time ? .32 : 1;
          enemy.x += enemy.direction * enemy.speed * freezeFactor * delta;
          if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) enemy.direction *= -1;
          const enemyY = enemy.kind === 'drone' ? enemy.baseY + Math.sin(time / 420 + enemy.phase) * 26 : enemy.y;
          const enemyBox = { x: enemy.x + 3, y: enemyY + 3, w: enemy.size - 6, h: enemy.size - 6 };
          const playerBox = { x: player.x + 8, y: player.y + 5, w: PLAYER_SIZE - 16, h: PLAYER_SIZE - 8 };
          if (!overlaps(playerBox, enemyBox)) return;
          if (player.vy > 1.5 && oldBottom <= enemyY + 17) {
            enemy.hp = (enemy.hp || 1) - 1;
            enemy.alive = enemy.hp > 0;
            enemy.direction *= -1; player.vy = -9.5;
            burst(state, enemy.x + enemy.size / 2, enemyY + enemy.size / 2, enemy.kind === 'guardian' ? '#a98cff' : palette.enemy, 12); playSound('stomp');
          } else damagePlayer(state, time);
        });

        checkpoints.forEach((checkpoint) => {
          if (player.x < checkpoint || state.reachedCheckpoints.has(checkpoint)) return;
          state.reachedCheckpoints.add(checkpoint); state.checkpoint = checkpoint + 30; playSound('checkpoint');
        });

        const nextZone = Math.max(0, zones.findIndex((zone) => player.x >= zone.start && player.x < zone.end));
        if (nextZone !== state.zone) {
          state.zone = nextZone; state.zoneBannerUntil = time + 1800; playSound('checkpoint'); syncHud(state, time);
        }

        if (player.x > GOAL_X - PLAYER_SIZE) {
          if (state.collected.size >= REQUIRED_TOKENS) { setStatus('won'); playSound('win'); }
          else { player.x = GOAL_X - PLAYER_SIZE - 8; player.vx = -4; state.blockedUntil = time + 1500; playSound('blocked'); }
        }

        if (state.turboUntil && state.turboUntil <= time) { state.turboUntil = 0; syncHud(state, time); }
        if (state.magnetUntil && state.magnetUntil <= time) { state.magnetUntil = 0; syncHud(state, time); }
        if (state.freezeUntil && state.freezeUntil <= time) { state.freezeUntil = 0; syncHud(state, time); }
        const targetCamera = Math.max(0, Math.min(WORLD_WIDTH - VIEW_WIDTH, player.x - VIEW_WIDTH * .34));
        state.cameraX += (targetCamera - state.cameraX) * .09 * delta;
      }

      draw(state, time);
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [isOpen, playSound, status, syncHud, theme]);

  const setControl = (control, value) => { keysRef.current[control] = value; };
  const toggleSound = () => setMuted((current) => !current);
  if (!isOpen) return null;

  const isWon = status === 'won';
  const isGameOver = status === 'gameover';

  return (
    <div ref={dialogRef} className="game-overlay" role="dialog" aria-modal="true" aria-labelledby="game-title">
      <div className="game-shell">
        <header className="game-header">
          <div><p>AC / EASTER EGG</p><h2 id="game-title">{labels.title}</h2></div>
          <div className="game-hud" aria-live="polite">
            <div className="game-level">L{hud.zone} / {zones.length}</div>
            <div className="game-score"><span>{hud.tokens} / {tokenPositions.length}</span> {labels.tokens}</div>
            <div className="game-vital"><strong>{'♥'.repeat(hud.lives)}</strong> {labels.lives}</div>
            <div className="game-vital game-power">{hud.power} · {labels.power}</div>
            <button className="game-sound" type="button" onClick={toggleSound} aria-label={muted ? labels.soundOff : labels.soundOn}>{muted ? '♪̸' : '♪'}</button>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label={labels.close}>×</button>
        </header>
        <div className="game-viewport">
          <canvas ref={canvasRef} width={VIEW_WIDTH} height={VIEW_HEIGHT} role="img" aria-label={labels.title} />
          {status !== 'running' && (
            <div className="game-state">
              <img src={openClawSprite} alt="OpenClaw" />
              <p>{isWon ? labels.win : isGameOver ? labels.gameOver : labels.intro}</p>
              {(isWon || isGameOver) && <span>{isWon ? labels.winText : labels.gameOverText}</span>}
              <button type="button" onClick={startGame}>{isWon || isGameOver ? labels.retry : labels.start}</button>
            </div>
          )}
        </div>
        <footer className="game-footer">
          <p>{labels.controls}</p>
          <div className="touch-controls">
            <button aria-label={labels.mobileLeft} onPointerDown={() => setControl('left', true)} onPointerUp={() => setControl('left', false)} onPointerCancel={() => setControl('left', false)}>←</button>
            <button aria-label={labels.mobileRight} onPointerDown={() => setControl('right', true)} onPointerUp={() => setControl('right', false)} onPointerCancel={() => setControl('right', false)}>→</button>
            <button className="jump-control" aria-label={labels.mobileJump} onPointerDown={() => setControl('jump', true)} onPointerUp={() => setControl('jump', false)}>↑</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default OpenClawGame;
