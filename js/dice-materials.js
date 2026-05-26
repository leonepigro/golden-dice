import * as THREE from 'three';
import { getFontSize } from './dice-logic.js';

const TEX_SIZE = 256;
const PADDING = 32;

function makeCanvas(drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  drawFn(canvas.getContext('2d'));
  return canvas;
}

function goldGradient(ctx) {
  const g = ctx.createLinearGradient(0, 0, TEX_SIZE, TEX_SIZE);
  g.addColorStop(0, '#fef3c7');
  g.addColorStop(0.35, '#fde68a');
  g.addColorStop(0.7, '#fcd34d');
  g.addColorStop(1, '#f59e0b');
  return g;
}

function makeFaceMaterial(text) {
  const canvas = makeCanvas(ctx => {
    ctx.fillStyle = goldGradient(ctx);
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    const inner = ctx.createRadialGradient(
      TEX_SIZE / 2, TEX_SIZE / 2, TEX_SIZE * 0.3,
      TEX_SIZE / 2, TEX_SIZE / 2, TEX_SIZE * 0.72
    );
    inner.addColorStop(0, 'rgba(0,0,0,0)');
    inner.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = inner;
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    ctx.fillStyle = '#12100a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let fontSize = getFontSize(text);
    const maxWidth = TEX_SIZE - PADDING * 2;

    ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    while (ctx.measureText(text).width > maxWidth && fontSize > 20) {
      fontSize -= 4;
      ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    }

    const words = text.split(' ');
    if (words.length > 1 && ctx.measureText(text).width > maxWidth) {
      const lineH = fontSize * 1.2;
      const half = Math.ceil(words.length / 2);
      const line1 = words.slice(0, half).join(' ');
      const line2 = words.slice(half).join(' ');
      ctx.fillText(line1, TEX_SIZE / 2, TEX_SIZE / 2 - lineH / 2);
      ctx.fillText(line2, TEX_SIZE / 2, TEX_SIZE / 2 + lineH / 2);
    } else {
      ctx.fillText(text, TEX_SIZE / 2, TEX_SIZE / 2);
    }
  });

  return new THREE.MeshStandardMaterial({
    map: new THREE.CanvasTexture(canvas),
    roughness: 0.25,
    metalness: 0.75,
  });
}

function makeDecorativeMaterial() {
  const canvas = makeCanvas(ctx => {
    ctx.fillStyle = goldGradient(ctx);
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
    ctx.fillStyle = 'rgba(18,16,10,0.3)';
    ctx.font = '900 60px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', TEX_SIZE / 2, TEX_SIZE / 2);
  });
  return new THREE.MeshStandardMaterial({
    map: new THREE.CanvasTexture(canvas),
    roughness: 0.25,
    metalness: 0.75,
  });
}

export function buildMaterials(options, faceCount) {
  const mats = [];
  for (let i = 0; i < faceCount; i++) {
    mats.push(i < options.length ? makeFaceMaterial(options[i]) : makeDecorativeMaterial());
  }
  return mats;
}

export function disposeMaterials(mats) {
  mats.forEach(m => { m.map?.dispose(); m.dispose(); });
}
