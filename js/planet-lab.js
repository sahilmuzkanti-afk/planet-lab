import * as THREE from 'three';

function createAstronaut(scale = 1) {
    const group = new THREE.Group();
    const suit = new THREE.MeshStandardMaterial({ color: 0xd7d8d4, roughness: 0.72 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x24282d, roughness: 0.55 });
    const visor = new THREE.MeshStandardMaterial({ color: 0x6f685e, roughness: 0.3, metalness: 0.25 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.78, 0.34), suit);
    body.position.y = 1.08;
    group.add(body);
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.24), dark);
    backpack.position.set(0, 1.08, -0.28);
    group.add(backpack);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 18), suit);
    head.position.y = 1.67;
    group.add(head);
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.225, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.64), visor);
    face.position.set(0, 1.67, 0.09);
    face.rotation.x = -0.2;
    group.add(face);
    [-1, 1].forEach((side) => {
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.48, 5, 10), suit);
      arm.position.set(0.42 * side, 1.06, 0);
      arm.rotation.z = -0.13 * side;
      group.add(arm);
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.55, 5, 10), suit);
      leg.position.set(0.18 * side, 0.38, 0);
      group.add(leg);
    });
    group.scale.setScalar(scale);
    return group;
}

function createPlatform(width = 6, depth = 5) {
    const group = new THREE.Group();
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.18, depth),
      new THREE.MeshStandardMaterial({ color: 0x2b3036, roughness: 0.82, metalness: 0.08 })
    );
    top.position.y = -0.08;
    group.add(top);
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.08, 0.06, depth + 0.08),
      new THREE.MeshStandardMaterial({ color: 0x4a5058, roughness: 0.65 })
    );
    trim.position.y = 0.035;
    group.add(trim);
    return group;
}

export class PlanetLabScene {
    constructor() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x07090c);
      this.scene.fog = new THREE.Fog(0x07090c, 18, 42);
      this.planet = null;
      this.loader = new THREE.TextureLoader();
      this.environment = new THREE.Group();
      this.defaultLab = new THREE.Group();
      this.comparison = new THREE.Group();
      this.scene.add(this.environment, this.defaultLab, this.comparison);
      this.comparison.visible = false;
      this.leftStage = new THREE.Group();
      this.rightStage = new THREE.Group();
      this.leftStage.position.set(-4.1, -1.35, 0);
      this.rightStage.position.set(4.1, -1.35, 0);
      this.comparison.add(this.leftStage, this.rightStage);
      this.leftStage.add(createPlatform(6.2, 5.4));
      this.rightStage.add(createPlatform(6.2, 5.4));
      this.leftVisuals = new THREE.Group();
      this.rightVisuals = new THREE.Group();
      this.leftStage.add(this.leftVisuals);
      this.rightStage.add(this.rightVisuals);
      this.ambient = new THREE.HemisphereLight(0xaeb5bf, 0x15181c, 1.25);
      this.scene.add(this.ambient);
      this.keyLight = new THREE.DirectionalLight(0xffeed8, 3.3);
      this.keyLight.position.set(-6, 10, 7);
      this.scene.add(this.keyLight);
    }

    setPlanet(planet) {
      this.planet = planet;
      this.clearGroup(this.environment);
      this.clearGroup(this.defaultLab);
      this.clearExperimentVisuals();
      if (planet.hasSolidSurface) this.buildSurfaceEnvironment(planet);
      else this.buildOrbitalEnvironment(planet);
      this.buildDefaultLab(planet);
    }

    buildSurfaceEnvironment(planet) {
      const groundColor = planet.name === 'earth' ? 0x273535 : planet.surfaceColor;
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50, 1, 1),
        new THREE.MeshStandardMaterial({ color: groundColor, roughness: 1 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -1.5;
      this.environment.add(ground);
      for (let i = 0; i < 9; i += 1) {
        const hill = new THREE.Mesh(
          new THREE.ConeGeometry(2.5 + Math.random() * 4, 2 + Math.random() * 3.5, 7),
          new THREE.MeshStandardMaterial({ color: groundColor, roughness: 1 })
        );
        hill.position.set(-18 + i * 4.8, -0.5, -14 - Math.random() * 5);
        hill.scale.x = 1.8;
        this.environment.add(hill);
      }
      if (planet.name === 'earth') {
        this.scene.background = new THREE.Color(0x111921);
        this.scene.fog.color.set(0x111921);
      } else if (planet.name === 'mars') {
        this.scene.background = new THREE.Color(0x160d0a);
        this.scene.fog.color.set(0x160d0a);
      } else if (planet.name === 'venus') {
        this.scene.background = new THREE.Color(0x1a130c);
        this.scene.fog.color.set(0x1a130c);
      } else {
        this.scene.background = new THREE.Color(0x08090b);
        this.scene.fog.color.set(0x08090b);
      }
    }

    buildOrbitalEnvironment(planet) {
      this.scene.background = new THREE.Color(0x050609);
      this.scene.fog.color.set(0x050609);
      const planetMaterial = new THREE.MeshStandardMaterial({ color: planet.surfaceColor, roughness: 0.7 });
      const backdrop = new THREE.Mesh(new THREE.SphereGeometry(8.5, 64, 48), planetMaterial);
      backdrop.position.set(0, -9.5, -12);
      this.environment.add(backdrop);
      this.loader.load(planet.texture, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        planetMaterial.map = texture;
        planetMaterial.color.set(0xffffff);
        planetMaterial.needsUpdate = true;
      }, undefined, () => {});
      const orbitalDeck = createPlatform(15, 8);
      orbitalDeck.position.set(0, -1.5, 0);
      this.environment.add(orbitalDeck);
      const railMaterial = new THREE.MeshStandardMaterial({ color: 0x50565e, roughness: 0.65, metalness: 0.18 });
      [-6.5, 6.5].forEach((x) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1, 7), railMaterial);
        rail.position.set(x, -0.9, 0);
        this.environment.add(rail);
      });
    }

    buildDefaultLab(planet) {
      const astronaut = createAstronaut(1.02);
      astronaut.position.set(-1.4, -1.5, 1.1);
      this.defaultLab.add(astronaut);
      const consoleMaterial = new THREE.MeshStandardMaterial({ color: 0x252a30, roughness: 0.72, metalness: 0.12 });
      const console = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.05, 0.7), consoleMaterial);
      console.position.set(1.35, -0.95, 0.8);
      console.rotation.x = -0.08;
      this.defaultLab.add(console);
      const testPad = createPlatform(4.2, 3.6);
      testPad.position.set(0, -1.45, -2.5);
      this.defaultLab.add(testPad);
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 2.6, 8),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(planet.accentColor), roughness: 0.8 })
      );
      marker.position.set(0, -0.2, -2.5);
      this.defaultLab.add(marker);
    }

    enter(camera) {
      camera.position.set(0, 2.2, 12.2);
      camera.fov = 47;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, -1.8);
      this.setExperimentMode(false);
    }

    setExperimentMode(active) {
      this.defaultLab.visible = !active;
      this.comparison.visible = active;
    }

    getStage(side) {
      return side === 'earth' ? this.leftVisuals : this.rightVisuals;
    }

    clearExperimentVisuals() {
      this.clearGroup(this.leftVisuals);
      this.clearGroup(this.rightVisuals);
    }

    clearGroup(group) {
      while (group.children.length) {
        const child = group.children.pop();
        child.traverse((node) => {
          if (node.geometry) node.geometry.dispose();
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach((material) => material.dispose());
          }
        });
      }
    }

    createAstronaut(scale = 0.72) {
      return createAstronaut(scale);
    }

    update(dt) {
      const backdrop = this.environment.children.find((child) => child.geometry?.type === 'SphereGeometry');
      if (backdrop && !this.planet?.hasSolidSurface) backdrop.rotation.y += dt * 0.025;
    }
}
