import * as THREE from 'three';
import { parseCSV, getDiceType } from './dice-logic.js';
import { loadSessions, saveSession } from './sessions.js';
import { createScene } from './dice-scene.js';
import { buildGeometry, getFaceQuaternions } from './dice-geometry.js';
import { buildMaterials, disposeMaterials } from './dice-materials.js';
import { createAnimator } from './dice-animation.js';

const sessionSelect = document.getElementById('session-select');
const optionsInput  = document.getElementById('options-input');
const canvasWrap    = document.getElementById('canvas-wrap');
const hint          = document.getElementById('hint');
const resultBanner  = document.getElementById('result-banner');
const resultValue   = document.getElementById('result-value');
const statusBar     = document.getElementById('status-bar');
const minWarn       = document.getElementById('min-warn');

let sessions = loadSessions();
let options = [];
let currentMesh = null;
let faceQuaternions = [];
let animator = null;
let lastResult = null;
let idleTime = 0;

const { renderer, scene, camera } = createScene(canvasWrap);

function renderDropdown() {
  sessionSelect.innerHTML = '';
  sessions.forEach((s, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = s.csv.length > 40 ? s.csv.slice(0, 40) + '…' : s.csv;
    sessionSelect.appendChild(opt);
  });
}

function loadSessionIntoInput(index) {
  optionsInput.value = sessions[index].csv;
  rebuildDice();
}

sessionSelect.addEventListener('change', () => {
  loadSessionIntoInput(Number(sessionSelect.value));
});

function rebuildDice() {
  options = parseCSV(optionsInput.value);
  const valid = options.length >= 2;

  minWarn.style.display = valid ? 'none' : 'block';
  canvasWrap.style.pointerEvents = valid ? 'auto' : 'none';
  hint.textContent = valid ? 'tocca il dado' : '';

  resultBanner.classList.remove('visible');
  resultValue.textContent = '';
  lastResult = null;
  idleTime = 0;

  if (currentMesh) {
    disposeMaterials(
      Array.isArray(currentMesh.material) ? currentMesh.material : [currentMesh.material]
    );
    scene.remove(currentMesh);
    currentMesh.geometry.dispose();
    currentMesh = null;
  }

  if (!valid) {
    statusBar.textContent = '';
    return;
  }

  const diceInfo = getDiceType(options.length);
  const geo = buildGeometry(diceInfo.type);
  faceQuaternions = getFaceQuaternions(geo);
  const mats = buildMaterials(options, geo.groups.length);

  currentMesh = new THREE.Mesh(geo, mats);
  scene.add(currentMesh);

  animator = createAnimator(currentMesh, () => {
    resultValue.textContent = lastResult + ' 🎉';
    resultBanner.classList.add('visible');
    hint.textContent = 'tocca per rilancio';
    sessions = saveSession(sessions, optionsInput.value);
    renderDropdown();
    statusBar.textContent = `${options.length} facce · ultima: ${lastResult}`;
  });

  statusBar.textContent = `${options.length} facce · ${diceInfo.type}`;
}

optionsInput.addEventListener('input', () => {
  rebuildDice();
});

canvasWrap.addEventListener('click', () => {
  if (!animator || !animator.isIdle() || options.length < 2) return;
  const idx = Math.floor(Math.random() * options.length);
  lastResult = options[idx];
  const faceIdx = idx % faceQuaternions.length;
  resultBanner.classList.remove('visible');
  hint.textContent = '';
  idleTime = 0;
  animator.roll(faceIdx, faceQuaternions);
});

function renderLoop(timestamp) {
  requestAnimationFrame(renderLoop);
  if (animator) animator.tick(timestamp);
  if (currentMesh && animator && animator.isIdle()) {
    idleTime += 0.01;
    currentMesh.position.y = Math.sin(idleTime) * 0.06;
  }
  renderer.render(scene, camera);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

renderDropdown();
if (sessions.length > 0) loadSessionIntoInput(0);
requestAnimationFrame(renderLoop);
