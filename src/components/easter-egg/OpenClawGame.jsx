import { useCallback, useEffect, useRef, useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import openClawSprite from '../../assets/game/openclaw-sprite.png';
import {
  BOSS_MAX_HP, GOAL_X, GROUND_Y, PLAYER_SIZE, REQUIRED_TOKENS, VIEW_HEIGHT,
  VIEW_WIDTH, WORLD_WIDTH, bossTemplate, checkpoints, enemyTemplates,
  getMovingPlatform, hazards, movingPlatforms, platforms, powerUps,
  tokenPositions, zones,
} from './gameConfig';

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
  const shellRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const frameRef = useRef(0);
  const keysRef = useRef({ left: false, right: false, jump: false });
  const stateRef = useRef(null);
  const spriteRef = useRef(null);
  const audioRef = useRef(null);
  const musicRef = useRef({ timer: 0, step: 0 });
  const noticeTimerRef = useRef(0);
  const mutedRef = useRef(false);
  const statusRef = useRef('ready');
  const [status, setStatus] = useState('ready');
  const [hud, setHud] = useState({ tokens: 0, lives: 3, power: '—', zone: 1, bossHp: BOSS_MAX_HP });
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [immersiveFallback, setImmersiveFallback] = useState(false);
  const [powerNotice, setPowerNotice] = useState(null);
  const { content, theme } = usePreferences();
  const labels = content.game;

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { statusRef.current = status; }, [status]);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioRef.current = new AudioContext();
    }
    if (audioRef.current?.state === 'suspended') audioRef.current.resume();
  }, []);

  const playTone = useCallback((frequency, duration, wave = 'sine', volume = .035, slide = 1) => {
    if (mutedRef.current) return;
    ensureAudio();
    const audio = audioRef.current;
    if (!audio) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    if (slide !== 1) oscillator.frequency.exponentialRampToValueAtTime(frequency * slide, audio.currentTime + duration);
    gain.gain.setValueAtTime(.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, audio.currentTime + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration + .02);
  }, [ensureAudio]);

  const playSound = useCallback((type) => {
    const sounds = {
      start: [330, .11, 'sine'], jump: [260, .07, 'sine'], token: [660, .08, 'triangle'],
      power: [520, .15, 'sine'], stomp: [150, .08, 'square'], hit: [95, .16, 'sawtooth'],
      shield: [420, .13, 'triangle'], checkpoint: [740, .13, 'sine'], blocked: [120, .09, 'square'],
      boss: [110, .16, 'sawtooth'], pulse: [390, .2, 'triangle'], win: [880, .3, 'sine'], fail: [75, .28, 'sawtooth'],
    };
    const [frequency, duration, wave] = sounds[type] || sounds.token;
    playTone(frequency, duration, wave, .035, type === 'win' || type === 'power' ? 1.5 : 1);
  }, [playTone]);

  const stopMusic = useCallback(() => {
    window.clearInterval(musicRef.current.timer);
    musicRef.current.timer = 0;
  }, []);

  const startMusic = useCallback(() => {
    if (musicRef.current.timer || mutedRef.current) return;
    ensureAudio();
    const melodies = [
      [196, 246.94, 293.66, 246.94, 220, 261.63, 329.63, 261.63],
      [174.61, 220, 261.63, 329.63, 196, 246.94, 293.66, 369.99],
      [220, 277.18, 329.63, 415.3, 246.94, 311.13, 369.99, 466.16],
      [164.81, 207.65, 246.94, 329.63, 185, 233.08, 277.18, 369.99],
    ];
    musicRef.current.timer = window.setInterval(() => {
      if (mutedRef.current || statusRef.current !== 'running') return;
      const zone = stateRef.current?.zone || 0;
      const step = musicRef.current.step;
      const note = melodies[zone][step % melodies[zone].length];
      playTone(note, .2, 'triangle', .008);
      if (step % 4 === 0) playTone(note / 2, .38, 'sine', .006);
      musicRef.current.step = step + 1;
    }, 235);
  }, [ensureAudio, playTone]);

  const syncHud = useCallback((state, now = performance.now()) => {
    const powers = [];
    if (state.shield) powers.push('SHIELD');
    if (state.doubleJump) powers.push('2× JUMP');
    if (state.turboUntil > now) powers.push('TURBO');
    if (state.magnetUntil > now) powers.push('MAGNET');
    if (state.freezeUntil > now) powers.push('FREEZE');
    setHud({
      tokens: state.collected.size,
      lives: state.lives,
      power: powers.join(' + ') || '—',
      zone: state.zone + 1,
      bossHp: state.boss.hp,
    });
  }, []);

  const announcePower = useCallback((type) => {
    const copy = labels.powerups[type];
    if (!copy) return;
    window.clearTimeout(noticeTimerRef.current);
    setPowerNotice({ ...copy, type });
    noticeTimerRef.current = window.setTimeout(() => setPowerNotice(null), 3200);
  }, [labels.powerups]);

  const resetGame = useCallback((nextStatus = 'running') => {
    const state = {
      player: { x: 76, y: GROUND_Y - PLAYER_SIZE, vx: 0, vy: 0, grounded: true, jumps: 0 },
      cameraX: 0,
      collected: new Set(),
      claimedPower: new Set(),
      enemies: enemyTemplates.map((enemy) => ({ ...enemy, direction: 1, alive: true, baseY: enemy.y })),
      boss: { ...bossTemplate, attackAt: performance.now() + 1800, chargeUntil: 0 },
      projectiles: [],
      bossStarted: false,
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
      bossBannerUntil: 0,
      zone: 0,
      zoneBannerUntil: performance.now() + 1800,
      lastTime: 0,
    };
    stateRef.current = state;
    keysRef.current = { left: false, right: false, jump: false };
    setHud({ tokens: 0, lives: 3, power: '—', zone: 1, bossHp: BOSS_MAX_HP });
    setPowerNotice(null);
    setStatus(nextStatus);
  }, []);

  const startGame = () => {
    ensureAudio();
    resetGame('running');
    playSound('start');
  };

  const togglePause = useCallback(() => {
    setStatus((current) => (current === 'running' ? 'paused' : current === 'paused' ? 'running' : current));
    keysRef.current = { left: false, right: false, jump: false };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current;
    if (!shell) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      const request = shell.requestFullscreen || shell.webkitRequestFullscreen;
      if (request) {
        await request.call(shell, { navigationUI: 'hide' });
        window.screen?.orientation?.lock?.('landscape').catch(() => {});
      } else {
        setImmersiveFallback((current) => !current);
      }
    } catch {
      setImmersiveFallback((current) => !current);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setImmersiveFallback(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const image = new Image();
    image.src = openClawSprite;
    spriteRef.current = image;
    return () => {
      stopMusic();
      window.clearTimeout(noticeTimerRef.current);
      audioRef.current?.close();
    };
  }, [stopMusic]);

  useEffect(() => {
    if (isOpen && status === 'running' && !muted) startMusic();
    else stopMusic();
    return stopMusic;
  }, [isOpen, muted, startMusic, status, stopMusic]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    if (!stateRef.current) resetGame('ready');
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key === 'escape') {
        if (!document.fullscreenElement) handleClose();
        return;
      }
      if (key === 'p') { event.preventDefault(); togglePause(); return; }
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
    const onVisibilityChange = () => {
      if (document.hidden && statusRef.current === 'running') setStatus('paused');
    };
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (audioRef.current?.state === 'running') audioRef.current.suspend();
      previousFocusRef.current?.focus?.();
    };
  }, [handleClose, isOpen, resetGame, togglePause]);

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

    const drawZoneBackdrop = (zone, cameraX, elapsed) => {
      const startX = zone.start - cameraX;
      const endX = zone.end - cameraX;
      context.save();
      context.beginPath();
      context.rect(startX, 0, endX - startX, GROUND_Y);
      context.clip();

      if (zone.mood === 'lab') {
        for (let x = zone.start + 120; x < zone.end; x += 310) {
          context.fillStyle = 'rgba(102,220,226,.08)';
          roundedRect(context, x - cameraX, 96, 92, 190, 12);
          context.fillStyle = 'rgba(102,220,226,.34)';
          for (let y = 120; y < 258; y += 31) context.fillRect(x - cameraX + 15, y, 62, 4);
        }
      } else if (zone.mood === 'data') {
        context.strokeStyle = 'rgba(124,165,255,.22)'; context.lineWidth = 2;
        for (let lane = 0; lane < 5; lane += 1) {
          const y = 88 + lane * 49;
          context.beginPath(); context.moveTo(startX, y); context.lineTo(endX, y); context.stroke();
          const packetX = zone.start + ((elapsed * (.08 + lane * .012) + lane * 290) % (zone.end - zone.start));
          context.fillStyle = '#7ca5ff'; context.beginPath(); context.arc(packetX - cameraX, y, 5, 0, Math.PI * 2); context.fill();
        }
      } else if (zone.mood === 'cloud') {
        context.fillStyle = 'rgba(255,255,255,.08)';
        for (let x = zone.start + 130; x < zone.end; x += 360) {
          context.beginPath();
          context.arc(x - cameraX, 135, 46, 0, Math.PI * 2);
          context.arc(x + 48 - cameraX, 125, 58, 0, Math.PI * 2);
          context.arc(x + 105 - cameraX, 144, 42, 0, Math.PI * 2);
          context.fill();
        }
      } else {
        context.fillStyle = 'rgba(156,229,109,.07)';
        for (let x = zone.start + 90; x < zone.end; x += 230) {
          const height = 90 + ((x / 10) % 85);
          context.fillRect(x - cameraX, GROUND_Y - height, 105, height);
          context.fillStyle = 'rgba(156,229,109,.2)';
          for (let y = GROUND_Y - height + 20; y < GROUND_Y - 20; y += 28) context.fillRect(x - cameraX + 18, y, 69, 3);
          context.fillStyle = 'rgba(156,229,109,.07)';
        }
      }
      context.restore();
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

    const drawBoss = (boss, cameraX, elapsed) => {
      if (!boss.alive) return;
      const x = boss.x - cameraX;
      const hover = Math.sin(elapsed / 180) * 3;
      context.save();
      context.translate(x + boss.size / 2, boss.y + boss.size / 2 + hover);
      context.shadowBlur = 28; context.shadowColor = '#ff766d';
      context.fillStyle = '#8d3048'; roundedRect(context, -44, -44, 88, 88, 24);
      context.shadowBlur = 0;
      context.strokeStyle = '#ff9a85'; context.lineWidth = 5;
      context.beginPath(); context.arc(0, 0, 35, 0, Math.PI * 2); context.stroke();
      context.fillStyle = '#0c2638';
      context.beginPath(); context.arc(-15, -8, 9, 0, Math.PI * 2); context.arc(15, -8, 9, 0, Math.PI * 2); context.fill();
      context.fillStyle = '#75f1ed';
      context.beginPath(); context.arc(-15, -8, 4, 0, Math.PI * 2); context.arc(15, -8, 4, 0, Math.PI * 2); context.fill();
      context.fillStyle = '#ffb15b'; context.fillRect(-20, 19, 40, 7);
      context.restore();

      const barWidth = 180;
      context.fillStyle = 'rgba(8,18,31,.75)'; roundedRect(context, x - 46, boss.y - 34, barWidth, 18, 9);
      context.fillStyle = '#ff766d';
      context.fillRect(x - 40, boss.y - 28, (barWidth - 12) * (boss.hp / boss.maxHp), 6);
    };

    const draw = (state, elapsed) => {
      const cameraX = state.cameraX;
      const activeZone = zones[state.zone];
      const gradient = context.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
      gradient.addColorStop(0, theme === 'dark' ? activeZone.colors[0] : '#eef7f4');
      gradient.addColorStop(1, theme === 'dark' ? activeZone.colors[1] : '#dfeeff');
      context.fillStyle = gradient; context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

      context.strokeStyle = palette.grid; context.lineWidth = 1;
      for (let x = -(cameraX * .18) % 60; x < VIEW_WIDTH; x += 60) {
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, VIEW_HEIGHT); context.stroke();
      }
      for (let y = 28; y < GROUND_Y; y += 52) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(VIEW_WIDTH, y); context.stroke();
      }

      zones.forEach((zone) => drawZoneBackdrop(zone, cameraX, elapsed));

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
        const colors = { shield: '#65a5ff', turbo: '#ffd35b', double: '#9ce56d', magnet: '#ef80d6', repair: '#7ee29a', freeze: '#79e8f0', pulse: '#ff8f82' };
        context.save(); context.translate(power.x - cameraX, y);
        context.shadowBlur = 16; context.shadowColor = colors[power.type];
        context.fillStyle = colors[power.type]; context.beginPath(); context.arc(0, 0, 17, 0, Math.PI * 2); context.fill();
        context.shadowBlur = 0; context.fillStyle = '#14233b'; context.font = '800 12px sans-serif'; context.textAlign = 'center'; context.fillText(power.label, 0, 4);
        context.restore();
      });

      state.enemies.forEach((enemy) => { if (enemy.alive) drawEnemy(enemy, cameraX, elapsed); });
      drawBoss(state.boss, cameraX, elapsed);

      state.projectiles.forEach((projectile) => {
        context.save();
        context.translate(projectile.x - cameraX, projectile.y);
        context.shadowBlur = 18; context.shadowColor = '#ff766d';
        context.fillStyle = '#ff9a72'; context.beginPath(); context.arc(0, 0, projectile.radius, 0, Math.PI * 2); context.fill();
        context.shadowBlur = 0; context.strokeStyle = '#fff0c7'; context.lineWidth = 2;
        context.beginPath(); context.moveTo(-projectile.vx * 5, 0); context.lineTo(0, 0); context.stroke();
        context.restore();
      });

      const goalX = GOAL_X - cameraX;
      context.strokeStyle = palette.ink; context.lineWidth = 5;
      context.beginPath(); context.moveTo(goalX, GROUND_Y); context.lineTo(goalX, 135); context.stroke();
      context.fillStyle = palette.coral;
      context.beginPath(); context.moveTo(goalX + 2, 140); context.lineTo(goalX + 96, 171); context.lineTo(goalX + 2, 204); context.fill();
      context.fillStyle = palette.ink; context.font = '700 12px sans-serif'; context.textAlign = 'left';
      context.fillText(state.boss.alive ? labels.bossGate : `PROD · ${REQUIRED_TOKENS} AI`, goalX + 18, 176);

      if (state.blockedUntil > elapsed) {
        context.fillStyle = 'rgba(12,25,42,.82)'; roundedRect(context, VIEW_WIDTH / 2 - 130, 26, 260, 40, 20);
        context.fillStyle = '#fff'; context.font = '700 13px sans-serif'; context.textAlign = 'center';
        const missing = Math.max(0, REQUIRED_TOKENS - state.collected.size);
        context.fillText(state.boss.alive ? labels.defeatBoss : `${missing} ${labels.tokensRequired}`, VIEW_WIDTH / 2, 51);
      }

      context.fillStyle = 'rgba(12,25,42,.72)'; roundedRect(context, 18, 18, 176, 34, 17);
      context.fillStyle = '#d9f5f4'; context.font = '700 11px sans-serif'; context.textAlign = 'left';
      context.fillText(`${activeZone.level} / ${activeZone.name}`, 34, 40);
      if (state.zoneBannerUntil > elapsed) {
        context.save(); context.globalAlpha = Math.min(1, (state.zoneBannerUntil - elapsed) / 450);
        context.fillStyle = 'rgba(12,25,42,.84)'; roundedRect(context, VIEW_WIDTH / 2 - 170, 78, 340, 66, 22);
        context.fillStyle = '#fff'; context.font = '500 24px serif'; context.textAlign = 'center'; context.fillText(activeZone.name, VIEW_WIDTH / 2, 117);
        context.restore();
      }
      if (state.bossBannerUntil > elapsed) {
        context.save(); context.globalAlpha = Math.min(1, (state.bossBannerUntil - elapsed) / 500);
        context.fillStyle = 'rgba(95,20,42,.9)'; roundedRect(context, VIEW_WIDTH / 2 - 190, 74, 380, 72, 22);
        context.fillStyle = '#fff'; context.font = '700 13px sans-serif'; context.textAlign = 'center';
        context.fillText(labels.bossIncoming, VIEW_WIDTH / 2, 103);
        context.font = '500 23px serif'; context.fillText(labels.bossName, VIEW_WIDTH / 2, 132);
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
          player.vy = player.grounded ? -13.8 : -12.2; player.grounded = false; player.jumps += 1; keysRef.current.jump = false; playSound('jump');
        }

        player.vy += .64 * delta;
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
            if (power.type === 'pulse') {
              state.enemies.forEach((enemy) => {
                if (enemy.alive && Math.abs(enemy.x - player.x) < 620) {
                  enemy.alive = false;
                  burst(state, enemy.x, enemy.y, '#ff8f82', 12);
                }
              });
              if (state.boss.alive && Math.abs(state.boss.x - player.x) < 700) {
                state.boss.hp -= 1;
                if (state.boss.hp <= 0) state.boss.alive = false;
              }
              playSound('pulse');
            }
            if (power.type === 'repair') {
              if (state.lives < 4) state.lives += 1;
              else state.shield = true;
            }
            burst(state, power.x, power.y, '#8de8de', 16);
            playSound('power'); announcePower(power.type); syncHud(state, time);
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

        const boss = state.boss;
        if (boss.alive && player.x > 5900) {
          if (!state.bossStarted) {
            state.bossStarted = true; state.bossBannerUntil = time + 2300; playSound('boss');
          }
          const playerCenter = player.x + PLAYER_SIZE / 2;
          const bossCenter = boss.x + boss.size / 2;
          const charging = boss.chargeUntil > time;
          if (!charging) boss.direction = playerCenter < bossCenter ? -1 : 1;
          boss.x += boss.direction * boss.speed * (charging ? 3.2 : 1) * delta;
          if (boss.x <= boss.minX || boss.x >= boss.maxX) {
            boss.x = Math.max(boss.minX, Math.min(boss.maxX, boss.x)); boss.direction *= -1;
          }

          if (time >= boss.attackAt) {
            boss.attackCount = (boss.attackCount || 0) + 1;
            if (boss.attackCount % 3 === 0) {
              boss.direction = playerCenter < bossCenter ? -1 : 1;
              boss.chargeUntil = time + 850;
              playSound('boss');
            } else {
              const directionToPlayer = playerCenter < bossCenter ? -1 : 1;
              state.projectiles.push({
                x: bossCenter, y: boss.y + 32, vx: directionToPlayer * (4.2 + boss.attackCount * .06),
                vy: -2.8, radius: 11,
              });
              playSound('boss');
            }
            boss.attackAt = time + Math.max(900, 1650 - (boss.maxHp - boss.hp) * 120);
          }

          const bossBox = { x: boss.x + 7, y: boss.y + 5, w: boss.size - 14, h: boss.size - 5 };
          const playerBox = { x: player.x + 8, y: player.y + 5, w: PLAYER_SIZE - 16, h: PLAYER_SIZE - 8 };
          if (overlaps(playerBox, bossBox)) {
            if (player.vy > 1.5 && oldBottom <= boss.y + 24) {
              boss.hp -= 1; player.vy = -11; boss.direction *= -1;
              burst(state, bossCenter, boss.y + 35, '#ff8f82', 22); playSound('stomp');
              if (boss.hp <= 0) {
                boss.alive = false; state.projectiles = [];
                burst(state, bossCenter, boss.y + 35, '#9ce56d', 38); playSound('checkpoint');
              }
              syncHud(state, time);
            } else damagePlayer(state, time);
          }
        }

        state.projectiles.forEach((projectile) => {
          projectile.x += projectile.vx * delta;
          projectile.y += projectile.vy * delta;
          projectile.vy += .08 * delta;
          const projectileBox = { x: projectile.x - projectile.radius, y: projectile.y - projectile.radius, w: projectile.radius * 2, h: projectile.radius * 2 };
          const playerBox = { x: player.x + 8, y: player.y + 5, w: PLAYER_SIZE - 16, h: PLAYER_SIZE - 8 };
          if (!projectile.hit && overlaps(playerBox, projectileBox)) {
            projectile.hit = true; damagePlayer(state, time);
          }
        });
        state.projectiles = state.projectiles.filter((projectile) => (
          !projectile.hit && projectile.x > 5850 && projectile.x < WORLD_WIDTH && projectile.y < GROUND_Y + 20
        ));

        checkpoints.forEach((checkpoint) => {
          if (player.x < checkpoint || state.reachedCheckpoints.has(checkpoint)) return;
          state.reachedCheckpoints.add(checkpoint); state.checkpoint = checkpoint + 30; playSound('checkpoint');
        });

        const nextZone = Math.max(0, zones.findIndex((zone) => player.x >= zone.start && player.x < zone.end));
        if (nextZone !== state.zone) {
          state.zone = nextZone; state.zoneBannerUntil = time + 1800; playSound('checkpoint'); syncHud(state, time);
        }

        if (player.x > GOAL_X - PLAYER_SIZE) {
          if (!state.boss.alive && state.collected.size >= REQUIRED_TOKENS) { setStatus('won'); playSound('win'); }
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
  }, [announcePower, isOpen, labels, playSound, status, syncHud, theme]);

  const setControl = (control, value) => { keysRef.current[control] = value; };
  const controlHandlers = (control) => ({
    onPointerDown: (event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setControl(control, true);
    },
    onPointerUp: (event) => {
      event.preventDefault();
      setControl(control, false);
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel: () => setControl(control, false),
    onLostPointerCapture: () => setControl(control, false),
    onContextMenu: (event) => event.preventDefault(),
  });
  const toggleSound = () => setMuted((current) => {
    if (current) ensureAudio();
    return !current;
  });
  if (!isOpen) return null;

  const isWon = status === 'won';
  const isGameOver = status === 'gameover';
  const isPaused = status === 'paused';

  return (
    <div ref={dialogRef} className="game-overlay" role="dialog" aria-modal="true" aria-labelledby="game-title">
      <div ref={shellRef} className={`game-shell${immersiveFallback ? ' game-shell--immersive' : ''}`}>
        <header className="game-header">
          <div><p>AC / EASTER EGG</p><h2 id="game-title">{labels.title}</h2></div>
          <div className="game-hud" aria-live="polite">
            <div className="game-level">L{hud.zone} / {zones.length}</div>
            <div className="game-score"><span>{hud.tokens} / {tokenPositions.length}</span> {labels.tokens}</div>
            <div className="game-vital"><strong>{'♥'.repeat(hud.lives)}</strong> {labels.lives}</div>
            <div className="game-vital game-power">{hud.power} · {labels.power}</div>
            {hud.zone === zones.length && hud.bossHp > 0 && <div className="game-vital game-boss-hud">BOSS {hud.bossHp}/{BOSS_MAX_HP}</div>}
            <div className="game-tools">
              {(status === 'running' || isPaused) && <button type="button" onClick={togglePause} aria-label={isPaused ? labels.resume : labels.pause}>{isPaused ? '▶' : 'Ⅱ'}</button>}
              <button type="button" onClick={toggleSound} aria-label={muted ? labels.soundOn : labels.soundOff}>{muted ? '♪̸' : '♪'}</button>
              <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen || immersiveFallback ? labels.exitFullscreen : labels.fullscreen}>⛶</button>
            </div>
          </div>
          <button ref={closeButtonRef} className="game-close" type="button" onClick={handleClose} aria-label={labels.close}>×</button>
        </header>
        <div className="game-rotate-hint" aria-hidden="true">↻ {labels.rotate}</div>
        <div className="game-viewport" onContextMenu={(event) => event.preventDefault()}>
          <canvas ref={canvasRef} width={VIEW_WIDTH} height={VIEW_HEIGHT} role="img" aria-label={labels.title} />
          {powerNotice && (
            <div className={`power-notice power-notice--${powerNotice.type}`} role="status" aria-live="assertive">
              <strong>{powerNotice.name}</strong>
              <span>{powerNotice.description}</span>
            </div>
          )}
          {status !== 'running' && (
            <div className="game-state">
              <img src={openClawSprite} alt="OpenClaw" />
              <p>{isWon ? labels.win : isGameOver ? labels.gameOver : isPaused ? labels.paused : labels.intro}</p>
              {(isWon || isGameOver || isPaused) && <span>{isWon ? labels.winText : isGameOver ? labels.gameOverText : labels.pausedText}</span>}
              <button type="button" onClick={isPaused ? togglePause : startGame}>{isPaused ? labels.resume : isWon || isGameOver ? labels.retry : labels.start}</button>
            </div>
          )}
        </div>
        <footer className="game-footer">
          <p>{labels.controls}</p>
          <div className="touch-controls" aria-label={labels.mobileControls}>
            <div className="touch-move-group">
              <button type="button" aria-label={labels.mobileLeft} {...controlHandlers('left')}>←</button>
              <button type="button" aria-label={labels.mobileRight} {...controlHandlers('right')}>→</button>
            </div>
            <button type="button" className="jump-control" aria-label={labels.mobileJump} {...controlHandlers('jump')}>↑<small>JUMP</small></button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default OpenClawGame;
