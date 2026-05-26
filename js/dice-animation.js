import * as THREE from 'three';

const SPIN_DURATION = 1500;
const DECEL_DURATION = 1200;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function createAnimator(mesh, onDone) {
  let state = 'idle';
  let spinAxis = new THREE.Vector3(1, 1, 0).normalize();
  let spinStartTime = 0;
  let decelStartTime = 0;
  let decelStartQuat = new THREE.Quaternion();
  let targetQuat = new THREE.Quaternion();
  let lastTimestamp = 0;

  function roll(faceIndex, faceQuaternions) {
    if (state !== 'idle' && state !== 'done') return false;
    targetQuat = faceQuaternions[faceIndex].clone();
    spinAxis.set(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    spinStartTime = performance.now();
    state = 'spinning';
    return true;
  }

  function tick(timestamp) {
    const delta = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, 0.05) : 0.016;
    lastTimestamp = timestamp;

    if (state === 'spinning') {
      const elapsed = timestamp - spinStartTime;
      mesh.rotateOnWorldAxis(spinAxis, 8 * delta);

      if (elapsed >= SPIN_DURATION) {
        state = 'decelerating';
        decelStartTime = timestamp;
        decelStartQuat.copy(mesh.quaternion);
      }
    } else if (state === 'decelerating') {
      const elapsed = timestamp - decelStartTime;
      const t = Math.min(elapsed / DECEL_DURATION, 1);
      const eased = easeOutCubic(t);
      mesh.quaternion.slerpQuaternions(decelStartQuat, targetQuat, eased);

      if (t >= 1) {
        mesh.quaternion.copy(targetQuat);
        state = 'done';
        onDone();
      }
    }
  }

  function reset() {
    state = 'idle';
    lastTimestamp = 0;
  }

  function isIdle() {
    return state === 'idle' || state === 'done';
  }

  return { roll, tick, reset, isIdle };
}
