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
