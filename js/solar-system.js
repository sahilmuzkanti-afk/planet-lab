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
            material.needsUpdate = true;
          },
          undefined,
          () => {}
        );
        if (planet.name === 'saturn') this.addRings(mesh, planet);
        if (planet.name === 'earth') this.addEarthLayers(mesh, planet);
        mesh.position.x = (index - this.selectedIndex) * 7;
      });
    }

    addEarthLayers(planetMesh, planet) {
      const radius = planetMesh.userData.baseRadius;
      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.035, 48, 36),
        new THREE.MeshBasicMaterial({ color: planet.accentColor, transparent: true, opacity: 0.08, side: THREE.BackSide })
      );
      planetMesh.add(atmosphere);
      const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, depthWrite: false, roughness: 1 });
      const clouds = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.012, 48, 36), cloudMaterial);
      clouds.name = 'earth-clouds';
      planetMesh.add(clouds);
      this.textureLoader.load(planet.clouds, (texture) => {
        cloudMaterial.alphaMap = texture;
        cloudMaterial.needsUpdate = true;
      }, undefined, () => { clouds.visible = false; });
    }

    addRings(planetMesh, planet) {
      const radius = planetMesh.userData.baseRadius;
      const geometry = new THREE.RingGeometry(radius * 1.25, radius * 2.05, 128);
      const material = new THREE.MeshStandardMaterial({
        color: 0xb8a679,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        roughness: 0.8
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2.15;
      planetMesh.add(ring);
      this.textureLoader.load(
        planet.rings,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          material.map = texture;
          material.alphaMap = texture;
          material.color.set(0xffffff);
          material.needsUpdate = true;
        },
        undefined,
        () => {}
      );
    }

    enter(camera) {
      camera.position.set(0, 1.2, 13);
      camera.fov = 46;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);
      this.snapLayout();
    }

    snapLayout() {
      this.planetMeshes.forEach((mesh, index) => {
        mesh.position.x = (index - this.selectedIndex) * 7;
        mesh.position.y = index % 2 === 0 ? 0 : 0.25;
        mesh.position.z = index === this.selectedIndex ? 0 : -1.6;
        const prominence = index === this.selectedIndex ? 1.15 : 0.72;
        mesh.scale.setScalar(prominence);
      });
    }

    setSelectedIndex(index) {
      this.targetIndex = Math.max(0, Math.min(planets.length - 1, index));
      if (this.targetIndex !== this.selectedIndex) {
        this.selectedIndex = this.targetIndex;
        if (this.onSelectionChange) this.onSelectionChange(this.getSelectedPlanet(), this.selectedIndex);
      }
    }

    next() {
      this.setSelectedIndex(this.selectedIndex + 1);
    }

    previous() {
      this.setSelectedIndex(this.selectedIndex - 1);
    }

    getSelectedPlanet() {
      return planets[this.selectedIndex];
    }

    getSelectedMesh() {
      return this.planetMeshes[this.selectedIndex];
    }

