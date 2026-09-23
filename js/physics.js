export const G = 6.67430e-11;

export function calculateFallTime(height, gravity) {
    if (height < 0 || gravity <= 0) return 0;
    return Math.sqrt((2 * height) / gravity);
}

export function calculateDropPosition(initialHeight, time, gravity) {
    return Math.max(0, initialHeight - 0.5 * gravity * time * time);
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
    return (initialVelocity * initialVelocity) / (2 * gravity);
}

export function calculateJumpDuration(initialVelocity, gravity) {
    return (2 * initialVelocity) / gravity;
}

export function calculateJumpPosition(initialVelocity, time, gravity) {
    return Math.max(0, initialVelocity * time - 0.5 * gravity * time * time);
}

export function calculatePendulumPeriod(length, gravity) {
    return 2 * Math.PI * Math.sqrt(length / gravity);
}

export function calculateEscapeVelocity(mass, radiusMeters) {
    return Math.sqrt((2 * G * mass) / radiusMeters);
}
