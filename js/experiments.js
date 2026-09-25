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
      this.active = true;
    }

    setupJump(settings) {
      const speed = Math.max(0.5, settings.jumpSpeed);
      const earthAstronaut = this.lab.createAstronaut(0.65);
      const planetAstronaut = this.lab.createAstronaut(0.65);
      this.lab.getStage('earth').add(earthAstronaut);
      this.lab.getStage('planet').add(planetAstronaut);
      const earthTime = calculateJumpDuration(speed, earth.gravity);
      const planetTime = calculateJumpDuration(speed, this.planet.gravity);
      this.runtime = {
        kind: 'jump', t: 0, speed, earthAstronaut, planetAstronaut,
        earthTime, planetTime, earthHeight: calculateJumpHeight(speed, earth.gravity),
        planetHeight: calculateJumpHeight(speed, this.planet.gravity), duration: Math.max(earthTime, planetTime)
      };
      this.active = true;
    }

    setupThrow(settings) {
      const speed = Math.max(1, settings.speed);
      const angle = Math.max(5, Math.min(85, settings.angle));
      const earthBall = createObject('basketball', 0.8);
      const planetBall = createObject('basketball', 0.8);
      earthBall.position.set(-2.4, 0.3, 0);
      planetBall.position.set(-2.4, 0.3, 0);
      this.lab.getStage('earth').add(earthBall);
      this.lab.getStage('planet').add(planetBall);
      const earthRange = calculateProjectileRange(speed, angle, earth.gravity);
      const planetRange = calculateProjectileRange(speed, angle, this.planet.gravity);
      const earthHeight = calculateProjectileHeight(speed, angle, earth.gravity);
      const planetHeight = calculateProjectileHeight(speed, angle, this.planet.gravity);
      const earthTime = calculateProjectileFlightTime(speed, angle, earth.gravity);
      const planetTime = calculateProjectileFlightTime(speed, angle, this.planet.gravity);
      const maxRange = Math.max(earthRange, planetRange, 1);
      const maxHeight = Math.max(earthHeight, planetHeight, 1);
      const xScale = 4.8 / maxRange;
      const yScale = 3.6 / maxHeight;
      this.lab.getStage('earth').add(this.trajectory(speed, angle, earth.gravity, earthTime, xScale, yScale));
      this.lab.getStage('planet').add(this.trajectory(speed, angle, this.planet.gravity, planetTime, xScale, yScale));
      this.runtime = {
        kind: 'throw', t: 0, speed, angle, earthBall, planetBall, earthRange, planetRange, earthHeight, planetHeight,
        earthTime, planetTime, xScale, yScale, duration: Math.max(earthTime, planetTime)
      };
      this.active = true;
    }

    trajectory(speed, angle, gravity, flightTime, xScale, yScale) {
      const points = [];
      for (let i = 0; i <= 48; i += 1) {
        const time = flightTime * i / 48;
        const p = calculateProjectilePosition(speed, angle, time, gravity);
        points.push(new THREE.Vector3(-2.4 + p.x * xScale, 0.3 + p.y * yScale, 0));
      }
      return createTrajectory(points);
    }

    setupWeight(settings) {
      const massKg = Math.max(1, settings.mass);
      const earthWeight = calculateWeight(massKg, earth.gravity);
      const planetWeight = calculateWeight(massKg, this.planet.gravity);
      const boxMaterial = material(0x777c82);
      const earthBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), boxMaterial.clone());
      const planetBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), boxMaterial.clone());
      earthBox.position.y = 0.55;
      planetBox.position.y = 0.55;
      this.lab.getStage('earth').add(earthBox);
      this.lab.getStage('planet').add(planetBox);
      this.addForceGauge(this.lab.getStage('earth'), earthWeight, Math.max(earthWeight, planetWeight));
      this.addForceGauge(this.lab.getStage('planet'), planetWeight, Math.max(earthWeight, planetWeight));
      this.ui.setResults([
        ['Mass on both worlds', `${massKg.toFixed(1)} kg`],
        ['Earth weight', `${earthWeight.toFixed(1)} N`],
        [`${this.planet.displayName} weight`, `${planetWeight.toFixed(1)} N`],
        ['Difference', `${(planetWeight - earthWeight).toFixed(1)} N`]
      ]);
      this.ui.setStatus('Complete. Mass stayed the same; weight changed with gravity.');
      this.ui.setRunEnabled(true);
    }

    addForceGauge(stage, force, maximum) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.6, 0.18), material(0x43484f));
      frame.position.set(1.25, 1.8, 0);
      stage.add(frame);
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.28), material(0xd8d7d0));
      marker.position.set(1.25, 0.2 + 3.2 * force / Math.max(maximum, 1), 0.05);
      stage.add(marker);
    }

    setupPendulum(settings) {
      const length = Math.max(0.2, settings.length);
      const earthPendulum = createPendulum();
      const planetPendulum = createPendulum();
      this.lab.getStage('earth').add(earthPendulum.support, earthPendulum.pivot);
      this.lab.getStage('planet').add(planetPendulum.support, planetPendulum.pivot);
      const earthPeriod = calculatePendulumPeriod(length, earth.gravity);
      const planetPeriod = calculatePendulumPeriod(length, this.planet.gravity);
      this.runtime = { kind: 'pendulum', t: 0, length, earthPendulum, planetPendulum, earthPeriod, planetPeriod, duration: 8 };
      this.active = true;
    }

    setupLaunch() {
      const earthCraft = createSpacecraft();
      const planetCraft = createSpacecraft();
      earthCraft.position.set(0, 0.2, 0);
      planetCraft.position.set(0, 0.2, 0);
      this.lab.getStage('earth').add(earthCraft);
      this.lab.getStage('planet').add(planetCraft);
      this.runtime = { kind: 'launch', t: 0, earthCraft, planetCraft, duration: 4.5 };
      this.active = true;
    }

    setupFeather(settings) {
      const height = Math.max(1, settings.height);
      const sides = [
        { key: 'earth', planet: earth, stage: this.lab.getStage('earth') },
        { key: 'planet', planet: this.planet, stage: this.lab.getStage('planet') }
      ];
      const states = {};
      const times = {};
      sides.forEach(({ key, planet, stage }) => {
        states[key] = {};
        ['feather', 'hammer'].forEach((objectKey, index) => {
          const mesh = createObject(objectKey, objectKey === 'feather' ? 1.15 : 1);
          mesh.position.set(index === 0 ? -0.7 : 0.7, 5.25, 0);
          stage.add(mesh);
          states[key][objectKey] = { mesh, y: height, velocity: 0, done: false };
          const data = OBJECTS[objectKey];
          times[`${key}-${objectKey}`] = simulateDragFall({
            height,
            gravity: planet.gravity,
            density: planet.atmosphericDensity,
            mass: data.mass,
            dragCoefficient: data.dragCoefficient,
            area: data.area,
            dt: 1 / 240
          }).time;
        });
      });
      const maxTime = Math.max(...Object.values(times));
      this.runtime = { kind: 'feather', t: 0, height, states, times, simTime: 0, speedFactor: Math.max(1, maxTime / 7.5), duration: maxTime };
      this.active = true;
    }

    update(dt) {
      if (!this.active || !this.runtime) return;
      this.runtime.t += dt;
      const handlers = {
        drop: () => this.updateDrop(),
        jump: () => this.updateJump(),
        throw: () => this.updateThrow(),
        pendulum: () => this.updatePendulum(),
        launch: () => this.updateLaunch(),
        feather: () => this.updateFeather(dt)
      };
      handlers[this.runtime.kind]();
    }

    updateDrop() {
      const r = this.runtime;
      const setY = (mesh, gravity, landingTime) => {
        const y = calculateDropPosition(r.height, Math.min(r.t, landingTime), gravity);
        mesh.position.y = 0.28 + 5 * y / r.height;
      };
      setY(r.earthObject, earth.gravity, r.earthTime);
      setY(r.planetObject, this.planet.gravity, r.planetTime);
      if (r.t >= r.duration + 0.15) {
        this.complete([
          ['Earth fall time', `${r.earthTime.toFixed(2)} s`],
          [`${this.planet.displayName} fall time`, `${r.planetTime.toFixed(2)} s`],
          ['Difference', `${(r.planetTime - r.earthTime >= 0 ? '+' : '')}${(r.planetTime - r.earthTime).toFixed(2)} s`]
        ]);
      }
    }

    updateJump() {
      const r = this.runtime;
      const visualScale = 1.7;
      r.earthAstronaut.position.y = calculateJumpPosition(r.speed, Math.min(r.t, r.earthTime), earth.gravity) * visualScale;
      r.planetAstronaut.position.y = calculateJumpPosition(r.speed, Math.min(r.t, r.planetTime), this.planet.gravity) * visualScale;
      if (r.t >= r.duration + 0.15) {
        this.complete([
          ['Earth max height', `${r.earthHeight.toFixed(2)} m`],
          ['Earth air time', `${r.earthTime.toFixed(2)} s`],
          [`${this.planet.displayName} max height`, `${r.planetHeight.toFixed(2)} m`],
          [`${this.planet.displayName} air time`, `${r.planetTime.toFixed(2)} s`]
        ]);
      }
    }

    updateThrow() {
      const r = this.runtime;
      const move = (mesh, gravity, flightTime) => {
        const p = calculateProjectilePosition(r.speed, r.angle, Math.min(r.t, flightTime), gravity);
        mesh.position.x = -2.4 + p.x * r.xScale;
        mesh.position.y = 0.3 + p.y * r.yScale;
      };
      move(r.earthBall, earth.gravity, r.earthTime);
      move(r.planetBall, this.planet.gravity, r.planetTime);
      if (r.t >= r.duration + 0.15) {
        this.complete([
          ['Earth range', `${r.earthRange.toFixed(2)} m`],
          ['Earth max height', `${r.earthHeight.toFixed(2)} m`],
          [`${this.planet.displayName} range`, `${r.planetRange.toFixed(2)} m`],
          [`${this.planet.displayName} max height`, `${r.planetHeight.toFixed(2)} m`]
        ]);
      }
    }

    updatePendulum() {
      const r = this.runtime;
      r.earthPendulum.pivot.rotation.z = 0.48 * Math.cos(2 * Math.PI * r.t / r.earthPeriod);
      r.planetPendulum.pivot.rotation.z = 0.48 * Math.cos(2 * Math.PI * r.t / r.planetPeriod);
      if (r.t >= r.duration) {
        this.complete([
          ['Earth period', `${r.earthPeriod.toFixed(2)} s`],
          [`${this.planet.displayName} period`, `${r.planetPeriod.toFixed(2)} s`],
          ['Pendulum length', `${r.length.toFixed(2)} m`]
        ]);
      }
    }

    updateLaunch() {
      const r = this.runtime;
      const earthRate = earth.escapeVelocity / Math.max(earth.escapeVelocity, this.planet.escapeVelocity);
      const planetRate = this.planet.escapeVelocity / Math.max(earth.escapeVelocity, this.planet.escapeVelocity);
      r.earthCraft.position.y = 0.2 + Math.min(5.8, r.t * 1.4 * earthRate);
      r.planetCraft.position.y = 0.2 + Math.min(5.8, r.t * 1.4 * planetRate);
      if (r.t >= r.duration) {
        this.complete([
          ['Earth escape velocity', `${earth.escapeVelocity.toFixed(2)} km/s`],
          [`${this.planet.displayName} escape velocity`, `${this.planet.escapeVelocity.toFixed(2)} km/s`],
          ['Difference', `${(this.planet.escapeVelocity - earth.escapeVelocity >= 0 ? '+' : '')}${(this.planet.escapeVelocity - earth.escapeVelocity).toFixed(2)} km/s`]
        ]);
      }
    }

    updateFeather(dt) {
      const r = this.runtime;
      const simDelta = Math.min(0.12, dt * r.speedFactor);
      const substeps = Math.max(1, Math.ceil(simDelta / (1 / 120)));
      const h = simDelta / substeps;
      for (let step = 0; step < substeps; step += 1) {
        r.simTime += h;
        this.integrateDragPair(r.states.earth, earth, h, r.height);
        this.integrateDragPair(r.states.planet, this.planet, h, r.height);
      }
      const allDone = Object.values(r.states).every((pair) => pair.feather.done && pair.hammer.done);
      if (allDone || r.simTime >= r.duration + 0.5) {
        this.complete([
          ['Earth feather', `${r.times['earth-feather'].toFixed(2)} s`],
          ['Earth hammer', `${r.times['earth-hammer'].toFixed(2)} s`],
          [`${this.planet.displayName} feather`, `${r.times['planet-feather'].toFixed(2)} s`],
          [`${this.planet.displayName} hammer`, `${r.times['planet-hammer'].toFixed(2)} s`]
        ], 'Complete. Air resistance changes the feather most; in a vacuum both share the same gravitational acceleration.');
      }
    }

    integrateDragPair(pair, planet, dt, height) {
      ['feather', 'hammer'].forEach((key) => {
        const state = pair[key];
        if (state.done) return;
        const data = OBJECTS[key];
      const drag = calculateDragForce(planet.atmosphericDensity, state.velocity, data.dragCoefficient, data.area);
      const acceleration = Math.max(-planet.gravity, planet.gravity - drag / data.mass);
      state.velocity = Math.max(0, state.velocity + acceleration * dt);
      state.y = Math.max(0, state.y - state.velocity * dt);
      state.mesh.position.y = 0.28 + 5 * state.y / height;
      if (state.y <= 0) state.done = true;
    });
  }

  complete(rows, status = 'Complete.') {
    this.active = false;
    this.ui.setRunEnabled(true);
    this.ui.setStatus(status);
    this.ui.setResults(rows);
  }
}
