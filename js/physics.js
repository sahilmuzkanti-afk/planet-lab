export const G = 6.67430e-11;

export function calculateFallTime(height, gravity) {
    if (!Number.isFinite(height) || !Number.isFinite(gravity) || height <= 0 || gravity <= 0) return 0;
    return Math.sqrt((2 * height) / gravity);
}

export function calculateDropPosition(initialHeight, time, gravity) {
    if (!Number.isFinite(initialHeight) || !Number.isFinite(time) || !Number.isFinite(gravity)) return 0;
    if (initialHeight <= 0 || gravity <= 0) return 0;
    const elapsed = Math.max(0, time);
    return Math.max(0, initialHeight - 0.5 * gravity * elapsed * elapsed);
}

export function calculateImpactSpeed(height, gravity) {
    if (!Number.isFinite(height) || !Number.isFinite(gravity) || height <= 0 || gravity <= 0) return 0;
    return Math.sqrt(2 * gravity * height);
}

export function calculateWeight(mass, gravity) {
    if (!Number.isFinite(mass) || !Number.isFinite(gravity) || mass < 0 || gravity < 0) return 0;
    return mass * gravity;
}

export function calculateMassFromWeight(weight, gravity) {
    if (!Number.isFinite(weight) || !Number.isFinite(gravity) || weight < 0 || gravity <= 0) return 0;
    return weight / gravity;
}

export function calculateWeightDifference(mass, firstGravity, secondGravity) {
    return calculateWeight(mass, secondGravity) - calculateWeight(mass, firstGravity);
}

export function calculateProjectileVelocity(speed, angleDegrees) {
    if (!Number.isFinite(speed) || !Number.isFinite(angleDegrees) || speed <= 0) return { x: 0, y: 0 };
    const angle = angleDegrees * Math.PI / 180;
    return {
      x: speed * Math.cos(angle),
      y: speed * Math.sin(angle)
    };
}

export function calculateProjectilePosition(speed, angleDegrees, time, gravity) {
    if (!Number.isFinite(time) || !Number.isFinite(gravity) || time < 0 || gravity <= 0) return { x: 0, y: 0 };
    const velocity = calculateProjectileVelocity(speed, angleDegrees);
    return {
      x: velocity.x * time,
      y: Math.max(0, velocity.y * time - 0.5 * gravity * time * time)
    };
}

export function calculateProjectileFlightTime(speed, angleDegrees, gravity) {
    if (!Number.isFinite(gravity) || gravity <= 0) return 0;
    const velocity = calculateProjectileVelocity(speed, angleDegrees);
    return velocity.y > 0 ? (2 * velocity.y) / gravity : 0;
}

export function calculateProjectileRange(speed, angleDegrees, gravity) {
    const velocity = calculateProjectileVelocity(speed, angleDegrees);
    const flightTime = calculateProjectileFlightTime(speed, angleDegrees, gravity);
    return Math.max(0, velocity.x * flightTime);
}

export function calculateProjectileHeight(speed, angleDegrees, gravity) {
    if (!Number.isFinite(gravity) || gravity <= 0) return 0;
    const velocity = calculateProjectileVelocity(speed, angleDegrees);
    return velocity.y > 0 ? (velocity.y * velocity.y) / (2 * gravity) : 0;
}

export function sampleProjectilePath(speed, angleDegrees, gravity, segments = 48) {
    const flightTime = calculateProjectileFlightTime(speed, angleDegrees, gravity);
    if (flightTime === 0) return [{ x: 0, y: 0 }];
    const count = Math.max(2, Math.min(200, Math.round(segments) || 48));
    const points = [];
    for (let index = 0; index <= count; index += 1) {
      points.push(calculateProjectilePosition(speed, angleDegrees, flightTime * index / count, gravity));
    }
    return points;
}

export function calculateJumpHeight(initialVelocity, gravity) {
    if (!Number.isFinite(initialVelocity) || !Number.isFinite(gravity) || initialVelocity <= 0 || gravity <= 0) return 0;
    return (initialVelocity * initialVelocity) / (2 * gravity);
}

export function calculateJumpDuration(initialVelocity, gravity) {
    if (!Number.isFinite(initialVelocity) || !Number.isFinite(gravity) || initialVelocity <= 0 || gravity <= 0) return 0;
    return (2 * initialVelocity) / gravity;
}

export function calculateJumpApexTime(initialVelocity, gravity) {
    return calculateJumpDuration(initialVelocity, gravity) / 2;
}

export function calculateJumpPosition(initialVelocity, time, gravity) {
    if (![initialVelocity, time, gravity].every(Number.isFinite)) return 0;
    if (initialVelocity <= 0 || gravity <= 0) return 0;
    const elapsed = Math.max(0, time);
    return Math.max(0, initialVelocity * elapsed - 0.5 * gravity * elapsed * elapsed);
}

export function calculatePendulumPeriod(length, gravity, amplitude = 0) {
    if (![length, gravity, amplitude].every(Number.isFinite) || length <= 0 || gravity <= 0) return 0;
    const angle = Math.min(Math.abs(amplitude), Math.PI / 2);
    const correction = 1 + angle * angle / 16 + 11 * angle ** 4 / 3072;
    return 2 * Math.PI * Math.sqrt(length / gravity) * correction;
}

export function calculatePendulumAngle(amplitude, time, period) {
    if (![amplitude, time, period].every(Number.isFinite) || period <= 0) return 0;
    return amplitude * Math.cos(2 * Math.PI * Math.max(0, time) / period);
}

export function calculateEscapeVelocity(mass, radiusMeters) {
    return Math.sqrt((2 * G * mass) / radiusMeters);
}

export function calculateDragForce(density, velocity, dragCoefficient, area) {
    return 0.5 * density * velocity * velocity * dragCoefficient * area;
}

export function simulateDragFall({ height, gravity, density, mass, dragCoefficient, area, dt = 1 / 120 }) {
    let y = height;
    let velocity = 0;
    let time = 0;
    const maxTime = 120;
    while (y > 0 && time < maxTime) {
      const drag = calculateDragForce(density, velocity, dragCoefficient, area);
      const acceleration = gravity - drag / mass;
      velocity = Math.max(0, velocity + acceleration * dt);
      y = Math.max(0, y - velocity * dt);
      time += dt;
    }
    return { time, velocity };
}
