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
