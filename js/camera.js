export function placeCamera(camera, position, fov, target) {
  camera.position.set(position[0], position[1], position[2]);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.lookAt(target[0], target[1], target[2]);
}

export function renderSize(width, height, devicePixelRatio = 1) {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const pixelRatio = Math.max(1, Math.min(devicePixelRatio || 1, 2));
  return {
    width: safeWidth,
    height: safeHeight,
    pixelRatio,
    aspect: safeWidth / safeHeight
  };
}

export function resizeRenderer(renderer, camera, width, height, devicePixelRatio) {
  const size = renderSize(width, height, devicePixelRatio);
  camera.aspect = size.aspect;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(size.pixelRatio);
  renderer.setSize(size.width, size.height, false);
  return size;
}
