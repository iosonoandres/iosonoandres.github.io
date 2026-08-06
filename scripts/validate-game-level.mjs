import {
  GROUND_Y, PLAYER_SIZE, WORLD_WIDTH, bossTemplate, hazards, platforms,
  powerUps, tokenPositions, zones,
} from '../src/components/easter-egg/gameConfig.js';

const errors = [];
const jumpVelocity = 13.8;
const gravity = .64;
const jumpRise = (jumpVelocity ** 2) / (2 * gravity);
const playerCenterAtApex = GROUND_Y - PLAYER_SIZE / 2 - jumpRise;

if (zones[0].start !== 0 || zones.at(-1).end !== WORLD_WIDTH) errors.push('Zones do not cover the complete world.');
zones.forEach((zone, index) => {
  if (index && zone.start !== zones[index - 1].end) errors.push(`Gap between zones ${index} and ${index + 1}.`);
});

hazards.forEach((hazard) => {
  if (hazard.w > 72) errors.push(`Hazard at x=${hazard.x} is wider than the validated mobile jump span.`);
});

platforms.forEach((platform) => {
  if (platform.y < GROUND_Y - jumpRise - 8) errors.push(`Platform at x=${platform.x} is too high for a standard jump.`);
});

const validatePickup = (pickup, radius, label) => {
  const directlyReachable = pickup.y >= playerCenterAtApex - radius;
  const platformReachable = platforms.some((platform) => (
    pickup.x >= platform.x - radius && pickup.x <= platform.x + platform.w + radius &&
    pickup.y >= platform.y - PLAYER_SIZE - radius
  ));
  if (!directlyReachable && !platformReachable) errors.push(`${label} at x=${pickup.x}, y=${pickup.y} is unreachable.`);
};

tokenPositions.forEach((token, index) => validatePickup(token, 45, `Token ${index + 1}`));
powerUps.forEach((power) => validatePickup(power, 49, `Power-up ${power.type}`));

if (bossTemplate.minX < zones.at(-1).start) errors.push('Boss arena starts outside the final zone.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Level valid: ${zones.length} zones, ${platforms.length} platforms, ${tokenPositions.length} tokens and all mandatory paths reachable.`);
