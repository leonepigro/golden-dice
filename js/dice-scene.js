import * as THREE from 'three';

export function createScene(container) {
  const w = container.clientWidth || 300;
  const h = container.clientHeight || 300;
  const size = Math.min(w, h);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);

  const ambient = new THREE.AmbientLight(0xfde68a, 0.6);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffd700, 1.2);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xf59e0b, 0.4);
  fillLight.position.set(-4, 0, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xfbbf24, 0.3);
  rimLight.position.set(0, -3, -3);
  scene.add(rimLight);

  function onResize() {
    const newSize = Math.min(container.clientWidth, container.clientHeight);
    renderer.setSize(newSize, newSize);
  }
  window.addEventListener('resize', onResize);

  return { renderer, scene, camera };
}
