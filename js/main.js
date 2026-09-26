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
