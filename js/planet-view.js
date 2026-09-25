import * as THREE from 'three';

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
    }

    setPlanet(planet) {
      this.planet = planet;
      while (this.planetGroup.children.length) {
        const child = this.planetGroup.children.pop();
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
      const radius = planet.name === 'jupiter' ? 2.7 : planet.name === 'saturn' ? 2.45 : Math.max(1.75, 1.95 * planet.scale);
      const material = new THREE.MeshStandardMaterial({ color: planet.surfaceColor, roughness: 0.72 });
      this.mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 64), material);
      this.planetGroup.add(this.mesh);
      this.loader.load(
        planet.texture,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          material.map = texture;
          material.color.set(0xffffff);
          material.needsUpdate = true;
        },
        undefined,
        () => {}
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
        this.loader.load(planet.clouds, (texture) => {
          cloudMaterial.alphaMap = texture;
          cloudMaterial.needsUpdate = true;
        }, undefined, () => { clouds.visible = false; });
      }
    }

    addRings(radius, planet) {
      const material = new THREE.MeshStandardMaterial({ color: 0xc2b083, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 1.25, radius * 2.05, 160), material);
      ring.rotation.x = Math.PI / 2.08;
      this.planetGroup.add(ring);
      this.loader.load(planet.rings, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.alphaMap = texture;
        material.color.set(0xffffff);
        material.needsUpdate = true;
      }, undefined, () => {});
    }

    enter(camera) {
      camera.position.set(0, 0.3, 9.8);
      camera.fov = 43;
      camera.updateProjectionMatrix();
      camera.lookAt(0.8, 0, 0);
    }

    update(dt) {
      if (this.mesh) this.mesh.rotation.y += dt * 0.07;
      const clouds = this.planetGroup.getObjectByName('detail-earth-clouds');
      if (clouds) clouds.rotation.y += dt * 0.045;
      this.planetGroup.rotation.z = Math.sin(performance.now() * 0.00007) * 0.012;
    }
}
