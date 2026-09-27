const TURN = Math.PI * 2;

export function advanceAngle(angle, speed, dt) {
  if (!Number.isFinite(angle) || !Number.isFinite(speed) || !Number.isFinite(dt)) return 0;
  const next = angle + speed * Math.max(0, dt);
  return ((next % TURN) + TURN) % TURN;
}

export function dampedStep(current, target, rate, dt) {
  if (current === target) return target;
  const blend = 1 - Math.exp(-Math.max(0, rate) * Math.max(0, dt));
  return current + (target - current) * blend;
}

export function playbackRate(duration, maximumSeconds = 7.5) {
  if (!Number.isFinite(duration) || duration <= 0) return 1;
  if (!Number.isFinite(maximumSeconds) || maximumSeconds <= 0) return 1;
  return Math.max(1, duration / maximumSeconds);
}

export function playbackTime(elapsed, rate, duration) {
  if (![elapsed, rate, duration].every(Number.isFinite)) return 0;
  return Math.min(Math.max(0, duration), Math.max(0, elapsed) * Math.max(0, rate));
}