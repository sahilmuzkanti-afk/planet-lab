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
  object.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    if (Array.isArray(node.material)) {
      node.material.forEach(disposeMaterial);
    } else {
      disposeMaterial(node.material);
    }
  });
  if (object.parent) object.parent.remove(object);
}

export function clearGroup(group) {
  while (group.children.length) disposeObject(group.children[0]);
}
