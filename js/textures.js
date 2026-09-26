import * as THREE from 'three';

export function loadColorTexture(loader, url, onLoad, onError) {
  return loader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      onLoad(texture);
    },
    undefined,
    onError
  );
}

export function applyColorTexture(material, texture) {
  material.map = texture;
  material.color.set(0xffffff);
  material.needsUpdate = true;
}

export function applyAlphaTexture(material, texture) {
  material.alphaMap = texture;
  material.needsUpdate = true;
}

export function keepTextureFallback(material, object, name) {
  material.map = null;
  material.alphaMap = null;
  material.needsUpdate = true;
  if (object) object.visible = true;
  console.warn(`Texture unavailable: ${name}`);
}
