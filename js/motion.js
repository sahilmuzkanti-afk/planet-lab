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

export function boundedDelta(delta, maximum = 1 / 20) {
  if (!Number.isFinite(delta) || delta <= 0) return 0;
  if (!Number.isFinite(maximum) || maximum <= 0) return 0;
  return Math.min(delta, maximum);
}

export function substepCount(delta, step = 1 / 120, maximum = 24) {
  if (![delta, step, maximum].every(Number.isFinite)) return 1;
  if (delta <= 0 || step <= 0 || maximum < 1) return 1;
  return Math.min(Math.floor(maximum), Math.max(1, Math.ceil(delta / step)));
}
