export function placeCamera(camera, position, fov, target) {
    camera.position.set(position[0], position[1], position[2]);
    camera.fov = fov;
    camera.updateProProjectionMatrix();
    camera.lookAt(target[0])
}