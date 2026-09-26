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
