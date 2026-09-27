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
    return mass * gravity;
}

export function calculateProjectilePosition(speed, angleDegrees, time, gravity) {
    const angle = angleDegrees * Math.PI / 180;
    return {
      x: speed * Math.cos(angle) * time,
      y: Math.max(0, speed * Math.sin(angle) * time - 0.5 * gravity * time * time)
    };
}

export function calculateProjectileFlightTime(speed, angleDegrees, gravity) {
    const angle = angleDegrees * Math.PI / 180;
    return (2 * speed * Math.sin(angle)) / gravity;
}

export function calculateProjectileRange(speed, angleDegrees, gravity) {
    const angle = angleDegrees * Math.PI / 180;
    return (speed * speed * Math.sin(2 * angle)) / gravity;
}

export function calculateProjectileHeight(speed, angleDegrees, gravity) {
    const angle = angleDegrees * Math.PI / 180;
    const vertical = speed * Math.sin(angle);
    return (vertical * vertical) / (2 * gravity);
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

export function calculatePendulumPeriod(length, gravity) {
    return 2 * Math.PI * Math.sqrt(length / gravity);
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
