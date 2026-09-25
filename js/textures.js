import * as THREE from 'three';

export function loadColorTexture(loader, url, onload, onErroe) {
    return loader.load (
        url,
        (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            onload(texture);
        },
        undefined,
        onerror
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