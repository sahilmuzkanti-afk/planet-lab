import * as THREE from 'three';
import { applyAlphaTexture, applyColorTexture, keepTextureFallback, loadColorTexture } from './textures.js';
import { placeCamera } from './camera.js';
import { clearGroup } from './dispose.js';
import { advanceAngle } from './motion.js';

function makeStars() {
    const count = 1600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = -10 - Math.random() * 60;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xaeb5bd, size: 0.08 }));
}

export class PlanetViewScene {
    constructor() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x050609);
      this.scene.add(makeStars());
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.13));
      this.keyLight = new THREE.DirectionalLight(0xffefd6, 3.1);
      this.keyLight.position.set(-6, 4, 8);
      this.scene.add(this.keyLight);
      this.loader = new THREE.TextureLoader();
      this.planetGroup = new THREE.Group();
      this.planetGroup.position.set(2.9, 0, 0);
      this.scene.add(this.planetGroup);
      this.planet = null;
      this.mesh = null;
      this.loadVersion = 0;
      this.elapsed = 0;
    }

    setPlanet(planet) {
      if (this.planet === planet && this.mesh) return false;
      const loadVersion = ++this.loadVersion;
      this.planet = planet;
      clearGroup(this.planetGroup);
      const radius = planet.name === 'jupiter' ? 2.7 : planet.name === 'saturn' ? 2.45 : Math.max(1.75, 1.95 * planet.scale);
      const material = new THREE.MeshStandardMaterial({ color: planet.surfaceColor, roughness: 0.72 });
      this.mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 64), material);
      this.planetGroup.add(this.mesh);
      loadColorTexture(
        this.loader,
        planet.texture,
        (texture) => {
          if (loadVersion !== this.loadVersion) return texture.dispose();
          applyColorTexture(material, texture);
        },
        () => {
          if (loadVersion === this.loadVersion) keepTextureFallback(material, this.mesh, planet.name);
        }
      );
      if (planet.name === 'saturn') this.addRings(radius, planet);
      if (planet.name === 'earth') {
        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 1.025, 64, 48),
          new THREE.MeshBasicMaterial({ color: planet.accentColor, transparent: true, opacity: 0.075, side: THREE.BackSide })
        );
        this.planetGroup.add(atmosphere);
        const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.32, depthWrite: false, roughness: 1 });
        const clouds = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.012, 64, 48), cloudMaterial);
        clouds.name = 'detail-earth-clouds';
        this.planetGroup.add(clouds);
        this.loader.load(
          planet.clouds,
          (texture) => {
            if (loadVersion !== this.loadVersion) return texture.dispose();
            applyAlphaTexture(cloudMaterial, texture);
          },
          undefined,
          () => {
            if (loadVersion === this.loadVersion) clouds.visible = false;
          }
        );
      }
      return true;
    }

    addRings(radius, planet) {
      const material = new THREE.MeshStandardMaterial({ color: 0xc2b083, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 1.25, radius * 2.05, 160), material);
      ring.rotation.x = Math.PI / 2.08;
      this.planetGroup.add(ring);
      const loadVersion = this.loadVersion;
      loadColorTexture(this.loader, planet.rings, (texture) => {
        if (loadVersion !== this.loadVersion) return texture.dispose();
        applyColorTexture(material, texture);
        material.alphaMap = texture;
      }, () => {
        if (loadVersion === this.loadVersion) keepTextureFallback(material, ring, 'saturn rings');
      });
    }

    enter(camera) {
      placeCamera(camera, [0, 0.3, 9.8], 43, [0.8, 0, 0]);
    }

    update(dt) {
      this.elapsed += dt;
      if (this.mesh) this.mesh.rotation.y = advanceAngle(this.mesh.rotation.y, 0.07, dt);
      const clouds = this.planetGroup.getObjectByName('detail-earth-clouds');
      if (clouds) clouds.rotation.y = advanceAngle(clouds.rotation.y, 0.045, dt);
      this.planetGroup.rotation.z = Math.sin(this.elapsed * 0.07) * 0.012;
    }
}
