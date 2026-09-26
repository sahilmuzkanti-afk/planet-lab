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
    }
    if (data.shape === 'rock') {
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), material(data.color));
      rock.scale.set(1.2, 0.85, 1);
      rock.scale.multiplyScalar(scale);
      return rock;
    }
    return new THREE.Mesh(new THREE.SphereGeometry(0.27 * scale, 24, 18), material(data.color));
}

function createTrajectory(points, color = 0x737981) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 }));
}

function createPendulum() {
    const pivot = new THREE.Group();
    pivot.position.set(0, 4, 0);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.1, 10), material(0x8e949b));
    rod.position.y = -1.55;
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 18), material(0xc2c4c2));
    bob.position.y = -3.1;
    pivot.add(rod, bob);
    const support = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.08), material(0x60666d));
    support.position.set(0, 4, 0);
    return { pivot, support };
}

function createSpacecraft() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, 0.7, 16), material(0xd0d2cf));
    body.position.y = 0.35;
    group.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 16), material(0xc9cbc8));
    nose.position.y = 0.86;
    group.add(nose);
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.18, 16), material(0x555b62));
    engine.position.y = -0.08;
    group.add(engine);
    return group;
}

export class ExperimentController {
    constructor(labScene, ui) {
      this.lab = labScene;
      this.ui = ui;
      this.planet = earth;
      this.current = 'drop';
      this.active = false;
      this.runtime = null;
    }

    setPlanet(planet) {
      this.planet = planet;
    }

    open(name) {
      this.current = name;
      this.reset();
    }

    reset() {
      this.active = false;
      this.runtime = null;
      this.lab.clearExperimentVisuals();
      this.ui.clearResults();
      this.ui.setStatus('Ready.');
      this.ui.setRunEnabled(true);
    }

    run(settings) {
      this.reset();
      this.ui.setRunEnabled(false);
      this.ui.setStatus('Running...');
      const actions = {
        drop: () => this.setupDrop(settings),
        jump: () => this.setupJump(settings),
        throw: () => this.setupThrow(settings),
        weight: () => this.setupWeight(settings),
        pendulum: () => this.setupPendulum(settings),
        launch: () => this.setupLaunch(settings),
        feather: () => this.setupFeather(settings)
      };
      actions[this.current]();
    }

    setupDrop(settings) {
      const height = Math.max(1, settings.height);
      const earthObject = createObject(settings.object);
      const planetObject = createObject(settings.object);
      earthObject.position.set(0, 5.25, 0);
      planetObject.position.set(0, 5.25, 0);
      this.lab.getStage('earth').add(earthObject);
      this.lab.getStage('planet').add(planetObject);
      const earthTime = calculateFallTime(height, earth.gravity);
      const planetTime = calculateFallTime(height, this.planet.gravity);
      this.runtime = { kind: 'drop', t: 0, height, earthObject, planetObject, earthTime, planetTime, duration: Math.max(earthTime, planetTime) };
