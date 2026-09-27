function disposeMaterial(material) {
  if (!material) return;
  const textures = new Set();
  Object.values(material).forEach((value) => {
    if (value && value.isTexture) textures.add(value);
  });
  textures.forEach((texture) => texture.dispose());
  material.dispose();
}

export function disposeObject(object) {
  const geometries = new Set();
  const materials = new Set();
  object.traverse((node) => {
    if (node.geometry) geometries.add(node.geometry);
    if (Array.isArray(node.material)) {
      node.material.forEach((material) => materials.add(material));
    } else if (node.material) {
      materials.add(node.material);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach(disposeMaterial);
  if (object.parent) object.parent.remove(object);
}

export function clearGroup(group) {
  while (group.children.length) disposeObject(group.children[0]);
}
