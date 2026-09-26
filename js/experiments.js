import * as THREE from 'three';
import { earth } from './planets.js';
import {
    calculateFallTime,
    calculateDropPosition,
    calculateWeight,
    calculateProjectilePosition,
    calculateProjectileRange,
    calculateProjectileHeight,
    calculateProjectileFlightTime,
    calculateJumpHeight,
    calculateJumpDuration,
    calculateJumpPosition,
    calculatePendulumPeriod,
    calculateDragForce,
    simulateDragFall
} from './physics.js';

const OBJECTS = {
    bowling: { mass: 6.8, dragCoefficient: 0.47, area: 0.038, shape: 'sphere', color: 0x222428 },
    basketball: { mass: 0.62, dragCoefficient: 0.47, area: 0.045, shape: 'sphere', color: 0xa95f27 },
    rock: { mass: 1.2, dragCoefficient: 0.8, area: 0.025, shape: 'rock', color: 0x6c6760 },
    hammer: { mass: 1.5, dragCoefficient: 1.0, area: 0.015, shape: 'hammer', color: 0x8f9499 },
    feather: { mass: 0.003, dragCoefficient: 1.3, area: 0.02, shape: 'feather', color: 0xd9d6cc }
};

function material(color) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.04 });
}

function createObject(key, scale = 1) {
    const data = OBJECTS[key] || OBJECTS.bowling;
    if (data.shape === 'hammer') {
      const group = new THREE.Group();
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12), material(0x77523a));
      handle.rotation.z = Math.PI / 2;
      group.add(handle);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.2), material(data.color));
      head.position.x = 0.32;
      group.add(head);
      group.scale.setScalar(scale);
      return group;
    }
    if (data.shape === 'feather') {
      const group = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.65, 8), material(0xb7b1a3));
      shaft.rotation.z = 0.2;
      group.add(shaft);
      const plume = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.62), new THREE.MeshStandardMaterial({ color: data.color, side: THREE.DoubleSide, roughness: 0.9 }));
      plume.position.y = 0.12;
      plume.rotation.z = -0.2;
      group.add(plume);
      group.scale.setScalar(scale);
      return group;
