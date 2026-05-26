import * as THREE from 'three';

export function toFacedGeometry(srcGeo, trisPerFace = 1) {
  const geo = srcGeo.toNonIndexed();

  // BoxGeometry and similar already carry one group per face — reuse them.
  if (srcGeo.groups.length > 0) {
    geo.groups = [];
    srcGeo.groups.forEach((g, i) => geo.addGroup(g.start, g.count, i));
    geo.computeVertexNormals();
    return geo;
  }

  // No pre-defined groups: group consecutive triangles into faces.
  const triCount = geo.attributes.position.count / 3;
  const faceCount = triCount / trisPerFace;
  const uvArray = new Float32Array(triCount * 6);
  for (let i = 0; i < triCount; i++) {
    const b = i * 6;
    uvArray[b]     = 0.5; uvArray[b + 1] = 1.0;
    uvArray[b + 2] = 0.0; uvArray[b + 3] = 0.0;
    uvArray[b + 4] = 1.0; uvArray[b + 5] = 0.0;
  }
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArray, 2));
  for (let i = 0; i < faceCount; i++) {
    geo.addGroup(i * trisPerFace * 3, trisPerFace * 3, i);
  }
  geo.computeVertexNormals();
  return geo;
}

export function createD10Geometry() {
  const verts = [
    [0, 1.2, 0],
    [0, -1.2, 0],
  ];
  for (let i = 0; i < 5; i++) {
    const a = (2 * Math.PI * i) / 5;
    verts.push([Math.cos(a), 0, Math.sin(a)]);
  }

  const faceIndices = [];
  for (let i = 0; i < 5; i++) {
    const a = 2 + i, b = 2 + (i + 1) % 5;
    faceIndices.push([0, a, b]);
    faceIndices.push([1, b, a]);
  }

  const positions = [], normsArr = [], uvs = [];
  const groups = [];

  faceIndices.forEach((face, idx) => {
    const v0 = new THREE.Vector3(...verts[face[0]]);
    const v1 = new THREE.Vector3(...verts[face[1]]);
    const v2 = new THREE.Vector3(...verts[face[2]]);

    positions.push(...v0.toArray(), ...v1.toArray(), ...v2.toArray());

    const edge1 = v1.clone().sub(v0);
    const edge2 = v2.clone().sub(v0);
    const n = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
    normsArr.push(...n.toArray(), ...n.toArray(), ...n.toArray());

    uvs.push(0.5, 1.0, 0.0, 0.0, 1.0, 0.0);
    groups.push({ start: idx * 3, count: 3, materialIndex: idx });
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normsArr, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  groups.forEach(g => geo.addGroup(g.start, g.count, g.materialIndex));
  return geo;
}

export function buildGeometry(diceType) {
  switch (diceType) {
    case 'd4':  return toFacedGeometry(new THREE.TetrahedronGeometry(1.4));
    case 'd6':  return toFacedGeometry(new THREE.BoxGeometry(1.6, 1.6, 1.6));
    case 'd8':  return toFacedGeometry(new THREE.OctahedronGeometry(1.5));
    case 'd10': return createD10Geometry();
    case 'd12': return toFacedGeometry(new THREE.DodecahedronGeometry(1.4), 3);
    case 'd20': return toFacedGeometry(new THREE.IcosahedronGeometry(1.5));
    default:    return toFacedGeometry(new THREE.IcosahedronGeometry(1.5));
  }
}

export function getFaceQuaternions(geo) {
  const normals = geo.attributes.normal;
  const cameraDir = new THREE.Vector3(0, 0, 1);
  return geo.groups.map(group => {
    const n = new THREE.Vector3(
      normals.getX(group.start),
      normals.getY(group.start),
      normals.getZ(group.start)
    ).normalize();
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(n, cameraDir);
    return q;
  });
}
