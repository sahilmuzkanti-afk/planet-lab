import * as THREE from 'three';
import { planets } from './planets.js';
import { SolarSystemScene } from './solar-system.js';
import { PlanetViewScene } from './planet-view.js';
import { PlanetLabScene } from './planet-lab.js';
import { ExperimentController } from './experiments.js';
import { UI } from './ui.js';
import { applyAlphaTexture, applyColorTexture, keepTextureFallback, loadColorTexture } from './textures.js';
import { placeCamera, resizeRenderer } from './camera.js';

const STATES = {
  LANDING: 'LANDING',
  SOLAR_SYSTEM: 'SOLAR_SYSTEM',
  PLANET_VIEW: 'PLANET_VIEW',
  PLANET_LAB: 'PLANET_LAB',
  EXPERIMENT: 'EXPERIMENT'
};

const canvas = document.getElementById('space-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;

const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 240);
resizeRenderer(renderer, camera, window.innerWidth, window.innerHeight, window.devicePixelRatio);
const clock = new THREE.Clock();
let state = STATES.LANDING;
let selectedPlanet = planets[2];
let activeScene;
let activeUpdater;
let transition = null;
let interactionLocked = true;
let lastWheelTime = 0;
let wheelDistance = 0;
let pointerStart = null;

const ui = new UI({
  startJourney,
  previousPlanet: () => movePlanet(-1),
  nextPlanet: () => movePlanet(1),
  explorePlanet,
  home: returnHome,
  backToSolar,
  enterLab,
  backToPlanet,
  openExperiment,
  backToLab,
  runExperiment: (settings) => experiments.run(settings),
  resetExperiment: () => experiments.reset()
});

const landing = createLandingScene();
const solar = new SolarSystemScene((planet, index) => {
  selectedPlanet = planet;
  ui.updateSolar(planet, index, planets.length);
});
const detail = new PlanetViewScene();
const lab = new PlanetLabScene();
const experiments = new ExperimentController(lab, ui);

activeScene = landing.scene;
activeUpdater = landing;
landing.enter(camera);
ui.showLoading(18);

landing.ready.then(() => {
  ui.showLoading(100, 'Ready.');
  window.setTimeout(() => {
    ui.showLanding();
    interactionLocked = false;
  }, 220);
});

function createLandingScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050609);
  const stars = createStars(1800, 90);
  scene.add(stars);
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));
  const light = new THREE.DirectionalLight(0xffefd8, 3.8);
  light.position.set(-7, 4, 9);
  scene.add(light);
  const material = new THREE.MeshStandardMaterial({ color: 0x315477, roughness: 0.76 });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(4.2, 96, 64), material);
  earth.position.set(3.8, -1.7, -0.8);
  scene.add(earth);
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(4.29, 72, 54),
    new THREE.MeshBasicMaterial({ color: 0x5b82a8, transparent: true, opacity: 0.075, side: THREE.BackSide })
  );
  earth.add(atmosphere);
  const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false, roughness: 1 });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(4.25, 72, 54), cloudMaterial);
  clouds.name = 'landing-clouds';
  earth.add(clouds);
  const loader = new THREE.TextureLoader();
  loader.load(
    planets[2].clouds,
    (texture) => applyAlphaTexture(cloudMaterial, texture),
    undefined,
    () => { clouds.visible = false; }
  );
  let resolveReady;
  let readySettled = false;
  const ready = new Promise((resolve) => {
    resolveReady = () => {
      if (readySettled) return;
      readySettled = true;
      resolve();
    };
  });
  window.setTimeout(resolveReady, 8000);
  loadColorTexture(
    loader,
    planets[2].texture,
    (texture) => {
      applyColorTexture(material, texture);
      resolveReady();
    },
    () => {
      keepTextureFallback(material, earth, 'earth');
      resolveReady();
    }
  );
  return {
    scene,
    earth,
    stars,
    ready,
    enter(targetCamera) {
      earth.scale.setScalar(1);
      placeCamera(targetCamera, [0, 0.5, 8.8], 46, [1.7, -0.7, 0]);
    },
    update(dt) {
      earth.rotation.y += dt * 0.035;
      clouds.rotation.y += dt * 0.018;
      stars.rotation.y += dt * 0.0015;
    }
  };
}

function createStars(count, radius) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = radius * (0.5 + Math.random() * 0.5);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xc0c5cb, size: 0.09, sizeAttenuation: true }));
}

function startJourney() {
  if (interactionLocked || state !== STATES.LANDING) return;
  interactionLocked = true;
  ui.show(null);
  const startPosition = camera.position.clone();
  const startRotation = camera.quaternion.clone();
  const endPosition = new THREE.Vector3(-0.5, 0.5, 19);
  const endRotation = rotationFor(endPosition, new THREE.Vector3(1.7, -0.7, 0));
  transition = {
    elapsed: 0,
    duration: 2.1,
    update(t) {
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(startPosition, endPosition, eased);
      camera.quaternion.slerpQuaternions(startRotation, endRotation, eased);
      landing.earth.scale.setScalar(THREE.MathUtils.lerp(1, 0.48, eased));
    },
    complete() {
      state = STATES.SOLAR_SYSTEM;
      activeScene = solar.scene;
      activeUpdater = solar;
      solar.enter(camera);
      selectedPlanet = solar.getSelectedPlanet();
      ui.showSolar(selectedPlanet, solar.selectedIndex, planets.length);
      interactionLocked = false;
    }
  };
}

function movePlanet(direction) {
  if (interactionLocked || state !== STATES.SOLAR_SYSTEM) return;
  if (direction > 0) solar.next();
  else solar.previous();
}

function selectPlanet(index) {
  if (interactionLocked || state !== STATES.SOLAR_SYSTEM) return;
  solar.setSelectedIndex(index);
}

function explorePlanet() {
  if (interactionLocked || state !== STATES.SOLAR_SYSTEM) return;
  interactionLocked = true;
  selectedPlanet = solar.getSelectedPlanet();
  ui.show(null);
  const startPosition = camera.position.clone();
  const startRotation = camera.quaternion.clone();
  const endPosition = new THREE.Vector3(0, 0.3, 4.2);
  const endRotation = rotationFor(endPosition, new THREE.Vector3(0, 0, 0));
  const startFov = camera.fov;
  transition = {
    elapsed: 0,
    duration: 1.55,
    update(t) {
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(startPosition, endPosition, eased);
      camera.quaternion.slerpQuaternions(startRotation, endRotation, eased);
      camera.fov = THREE.MathUtils.lerp(startFov, 39, eased);
      camera.updateProjectionMatrix();
    },
    complete() {
      detail.setPlanet(selectedPlanet);
      state = STATES.PLANET_VIEW;
      activeScene = detail.scene;
      activeUpdater = detail;
      detail.enter(camera);
      ui.showDetail(selectedPlanet);
      interactionLocked = false;
    }
  };
}

function backToSolar() {
  if (interactionLocked || state !== STATES.PLANET_VIEW) return;
  swapScene(() => {
    state = STATES.SOLAR_SYSTEM;
    activeScene = solar.scene;
    activeUpdater = solar;
    solar.enter(camera);
    ui.showSolar(selectedPlanet, solar.selectedIndex, planets.length);
  });
}

function enterLab() {
  if (interactionLocked || state !== STATES.PLANET_VIEW) return;
  interactionLocked = true;
  ui.show(null);
  const startPosition = camera.position.clone();
  const startRotation = camera.quaternion.clone();
  const endPosition = new THREE.Vector3(0, -0.25, 4.3);
  const endRotation = rotationFor(endPosition, new THREE.Vector3(1.6, -0.3, 0));
  transition = {
    elapsed: 0,
    duration: 1.65,
    update(t) {
      const eased = easeInOutCubic(t);
      camera.position.lerpVectors(startPosition, endPosition, eased);
      camera.quaternion.slerpQuaternions(startRotation, endRotation, eased);
    },
    complete() {
      lab.setPlanet(selectedPlanet);
      experiments.setPlanet(selectedPlanet);
      state = STATES.PLANET_LAB;
      activeScene = lab.scene;
      activeUpdater = lab;
      lab.enter(camera);
      ui.showLab(selectedPlanet);
      interactionLocked = false;
    }
  };
}

function backToPlanet() {
  if (interactionLocked || state !== STATES.PLANET_LAB) return;
  swapScene(() => {
    detail.setPlanet(selectedPlanet);
    state = STATES.PLANET_VIEW;
    activeScene = detail.scene;
    activeUpdater = detail;
    detail.enter(camera);
    ui.showDetail(selectedPlanet);
  });
}

function openExperiment(name) {
  if (interactionLocked || state !== STATES.PLANET_LAB) return;
  lab.setExperimentMode(true);
  experiments.setPlanet(selectedPlanet);
  experiments.open(name);
  state = STATES.EXPERIMENT;
  ui.showExperiment(name, selectedPlanet);
}

function backToLab() {
  if (interactionLocked || state !== STATES.EXPERIMENT) return;
  experiments.reset();
  lab.setExperimentMode(false);
  state = STATES.PLANET_LAB;
  ui.showLab(selectedPlanet);
}

function returnHome() {
  if (interactionLocked || state !== STATES.SOLAR_SYSTEM) return;
  swapScene(() => {
    state = STATES.LANDING;
    activeScene = landing.scene;
    activeUpdater = landing;
    landing.enter(camera);
    ui.showLanding();
  });
}

function swapScene(change) {
  interactionLocked = true;
  ui.transition(true);
  window.setTimeout(() => {
    change();
    window.setTimeout(() => {
      ui.transition(false);
      interactionLocked = false;
    }, 90);
  }, 250);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function rotationFor(position, target) {
  const probe = camera.clone();
  probe.position.copy(position);
  probe.lookAt(target);
  return probe.quaternion;
}

window.addEventListener('wheel', (event) => {
  if (state !== STATES.SOLAR_SYSTEM || interactionLocked) return;
  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1;
  wheelDistance += event.deltaY * unit;
  if (Math.abs(wheelDistance) < 40) return;
  const now = performance.now();
  if (now - lastWheelTime < 250) return;
  lastWheelTime = now;
  movePlanet(wheelDistance > 0 ? 1 : -1);
  wheelDistance = 0;
}, { passive: true });

window.addEventListener('keydown', (event) => {
  const target = event.target;
  if (interactionLocked || event.repeat || target instanceof HTMLInputElement || target instanceof HTMLSelectElement) return;
  if (state === STATES.SOLAR_SYSTEM) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      movePlanet(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      movePlanet(-1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      selectPlanet(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      selectPlanet(planets.length - 1);
    }
    if (event.key === 'Enter' && target === document.body) explorePlanet();
  } else if (state === STATES.PLANET_VIEW && event.key === 'Escape') {
    backToSolar();
  } else if (state === STATES.PLANET_LAB && event.key === 'Escape') {
    backToPlanet();
  } else if (state === STATES.EXPERIMENT && event.key === 'Escape') {
    backToLab();
  }
});

canvas.addEventListener('pointerdown', (event) => {
  if (state !== STATES.SOLAR_SYSTEM || interactionLocked || !event.isPrimary || event.button !== 0) return;
  pointerStart = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    time: performance.now()
  };
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) {
    pointerStart = null;
    canvas.releasePointerCapture(event.pointerId);
  }
});

canvas.addEventListener('pointerup', (event) => {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  const dx = event.clientX - pointerStart.x;
  const dy = event.clientY - pointerStart.y;
  const elapsed = performance.now() - pointerStart.time;
  pointerStart = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  if (elapsed <= 800 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) movePlanet(dx < 0 ? 1 : -1);
});

canvas.addEventListener('pointercancel', () => {
  pointerStart = null;
});

window.addEventListener('blur', () => {
  pointerStart = null;
  wheelDistance = 0;
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) clock.getDelta();
});

const shell = document.getElementById('game-shell');
const resizeObserver = new ResizeObserver((entries) => {
  const box = entries[0].contentRect;
  resizeRenderer(renderer, camera, box.width, box.height, window.devicePixelRatio);
});
resizeObserver.observe(shell);

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 1 / 20);
  if (transition) {
    transition.elapsed += dt;
    const t = Math.min(1, transition.elapsed / transition.duration);
    transition.update(t);
    if (t >= 1) {
      const done = transition.complete;
      transition = null;
      done();
    }
  }
  if (activeUpdater) activeUpdater.update(dt);
  if (state === STATES.EXPERIMENT) experiments.update(dt);
  renderer.render(activeScene, camera);
}

animate();
