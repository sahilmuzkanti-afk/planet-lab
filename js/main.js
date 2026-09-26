import * as THREE from 'three';
import { planets } from './planets.js';
import { SolarSystemScene } from './solar-system.js';
import { PlanetViewScene } from './planet-view.js';
import { PlanetLabScene } from './planet-lab.js';
import { ExperimentController } from './experiments.js';
import { UI } from './ui.js';

const STATES = {
  LANDING: 'LANDING',
  SOLAR_SYSTEM: 'SOLAR_SYSTEM',
  PLANET_VIEW: 'PLANET_VIEW',
  PLANET_LAB: 'PLANET_LAB',
  EXPERIMENT: 'EXPERIMENT'
};

const canvas = document.getElementById('space-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;

const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 240);
const clock = new THREE.Clock();
let state = STATES.LANDING;
let selectedPlanet = planets[2];
let activeScene;
let activeUpdater;
let transition = null;
let interactionLocked = true;
let lastWheelTime = 0;

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
  loaderClouds();
  function loaderClouds() {
    const cloudLoader = new THREE.TextureLoader();
    cloudLoader.load(planets[2].clouds, (texture) => {
      cloudMaterial.alphaMap = texture;
      cloudMaterial.needsUpdate = true;
    }, undefined, () => { clouds.visible = false; });
  }
  let resolveReady;
  const ready = new Promise((resolve) => { resolveReady = resolve; });
  const loader = new THREE.TextureLoader();
  loader.load(
    planets[2].texture,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      material.map = texture;
      material.color.set(0xffffff);
      material.needsUpdate = true;
      resolveReady();
    },
    (event) => {
      if (event.total) ui.showLoading(18 + (event.loaded / event.total) * 60);
    },
    () => resolveReady()
  );
  return {
    scene,
    earth,
    stars,
    ready,
    enter(targetCamera) {
      earth.scale.setScalar(1);
      targetCamera.position.set(0, 0.5, 8.8);
      targetCamera.fov = 46;
      targetCamera.updateProjectionMatrix();
      targetCamera.lookAt(1.7, -0.7, 0);
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
  const startZ = camera.position.z;
  transition = {
    elapsed: 0,
    duration: 2.1,
    update(t) {
      const eased = easeInOutCubic(t);
      camera.position.z = THREE.MathUtils.lerp(startZ, 19, eased);
      camera.position.x = THREE.MathUtils.lerp(0, -0.5, eased);
      landing.earth.scale.setScalar(THREE.MathUtils.lerp(1, 0.48, eased));
      camera.lookAt(1.7, -0.7, 0);
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

function explorePlanet() {
  if (interactionLocked || state !== STATES.SOLAR_SYSTEM) return;
  interactionLocked = true;
  selectedPlanet = solar.getSelectedPlanet();
  ui.show(null);
  const startZ = camera.position.z;
  const startFov = camera.fov;
  transition = {
    elapsed: 0,
    duration: 1.55,
    update(t) {
      const eased = easeInOutCubic(t);
      camera.position.z = THREE.MathUtils.lerp(startZ, 4.2, eased);
      camera.fov = THREE.MathUtils.lerp(startFov, 39, eased);
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);
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
  const startZ = camera.position.z;
  transition = {
    elapsed: 0,
    duration: 1.65,
    update(t) {
      const eased = easeInOutCubic(t);
      camera.position.z = THREE.MathUtils.lerp(startZ, 4.3, eased);
      camera.position.y = THREE.MathUtils.lerp(0.3, -0.25, eased);
      camera.lookAt(1.6, -0.3, 0);
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
