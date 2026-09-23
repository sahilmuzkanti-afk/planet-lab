import * as THREE from 'three';
import { planets } from './planets.js';

function starField(count = 2200, radius = 120) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = radius * (0.55 + Math.random() * 0.45);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xbec3c8, size: 0.12, sizeAttenuation: true });
    return new THREE.Points(geometry, material);
}

export class SolarSystemScene {
    constructor(onSelectionChange) {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x050609);
      this.onSelectionChange = onSelectionChange;
      this.selectedIndex = 2;
      this.targetIndex = 2;
      this.planetMeshes = [];
      this.textureLoader = new THREE.TextureLoader();
      this.group = new THREE.Group();
      this.scene.add(this.group);
      this.scene.add(starField());
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.16));
      this.sunLight = new THREE.PointLight(0xffe7bd, 180, 140, 1.1);
      this.sunLight.position.set(-18, 3, 2);
      this.scene.add(this.sunLight);
      this.createSun();
      this.createPlanets();
    }

    createSun() {
      const material = new THREE.MeshBasicMaterial({ color: 0xd99b42 });
      const sun = new THREE.Mesh(new THREE.SphereGeometry(5.2, 64, 64), material);
      sun.position.set(-24, 1, -6);
      this.group.add(sun);
      this.textureLoader.load(
        'https://edu.solarsystemscope.com/textures/download/2k_sun.jpg',
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          material.map = texture;
          material.color.set(0xffffff);
          material.needsUpdate = true;
        },
        undefined,
        () => {}
      );
    }

    createPlanets() {
      planets.forEach((planet, index) => {
        const baseRadius = 1.15 * planet.scale;
        const geometry = new THREE.SphereGeometry(baseRadius, 64, 48);
        const material = new THREE.MeshStandardMaterial({
          color: planet.surfaceColor,
          roughness: planet.hasSolidSurface ? 0.82 : 0.62,
          metalness: 0
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.planet = planet;
        mesh.userData.baseRadius = baseRadius;
        this.group.add(mesh);
        this.planetMeshes.push(mesh);
        this.textureLoader.load(
          planet.texture,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 4;
            material.map = texture;
            material.color.set(0xffffff);
