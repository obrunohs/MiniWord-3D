export function roomShapePreviewHTML(shape) {
  const type = shape.preview || shape.css || 'square';
  return `<span class="shape-preview habbo-shape-preview preview-${type}">
    <i></i><b></b><em></em><strong></strong>
  </span>`;
}

function buildTileSet(shape) {
  const sections = Array.isArray(shape.sections) && shape.sections.length
    ? shape.sections
    : [{ x: 0, z: 0, w: Number(shape.w || 14), d: Number(shape.d || 14) }];

  const tiles = new Set();

  sections.forEach(section => {
    const w = Math.round(Number(section.w || 0));
    const d = Math.round(Number(section.d || 0));
    const cx = Math.round(Number(section.x || 0));
    const cz = Math.round(Number(section.z || 0));
    const startX = Math.round(cx - w / 2);
    const startZ = Math.round(cz - d / 2);

    for (let x = startX; x < startX + w; x++) {
      for (let z = startZ; z < startZ + d; z++) {
        tiles.add(`${x},${z}`);
      }
    }
  });

  return tiles;
}

function hasTile(tiles, x, z) {
  return tiles.has(`${x},${z}`);
}

function mergeEdges(edges, horizontal = true) {
  const groups = new Map();

  edges.forEach(edge => {
    const key = horizontal ? edge.z : edge.x;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(edge);
  });

  const merged = [];
  groups.forEach((items, key) => {
    items.sort((a, b) => horizontal ? a.x - b.x : a.z - b.z);

    let current = null;
    items.forEach(edge => {
      const start = horizontal ? edge.x : edge.z;
      const end = start + 1;

      if (!current) {
        current = { key, start, end };
      } else if (Math.abs(current.end - start) < 0.001) {
        current.end = end;
      } else {
        merged.push({ key, start: current.start, end: current.end });
        current = { key, start, end };
      }
    });

    if (current) merged.push({ key, start: current.start, end: current.end });
  });

  return merged;
}

export function createRoomShell(THREE, block, room, shape) {
  const w = Number(shape.w || 14);
  const d = Number(shape.d || 14);
  const halfW = w / 2;
  const halfD = d / 2;
  const sections = Array.isArray(shape.sections) && shape.sections.length
    ? shape.sections
    : [{ x: 0, z: 0, w, d }];

  let floorMesh = null;

  sections.forEach((section, index) => {
    const floor = block(section.w, 0.25, section.d, room.floor, section.x || 0, -0.13, section.z || 0);
    floor.userData = { type: 'floor', roomSection: index };
    if (!floorMesh) floorMesh = floor;
  });

  const tiles = buildTileSet(shape);

  const northEdges = [];
  const westEdges = [];
  const eastEdges = [];

  tiles.forEach(key => {
    const [x, z] = key.split(',').map(Number);

    // Parede do fundo/parte superior do piso.
    if (!hasTile(tiles, x, z - 1)) northEdges.push({ x, z });

    // Parede lateral esquerda contornando buracos e formatos L/T/U.
    if (!hasTile(tiles, x - 1, z)) westEdges.push({ x, z });

    // Em formatos recortados, a lateral direita também ajuda a fechar o contorno
    // visual onde existe vazio, sem virar um quarto totalmente fechado.
    if (!hasTile(tiles, x + 1, z)) eastEdges.push({ x: x + 1, z });
  });

  mergeEdges(northEdges, true).forEach(seg => {
    const length = seg.end - seg.start;
    const centerX = seg.start + length / 2;
    const z = seg.key;
    block(length, 4.2, 0.28, room.wall, centerX, 2, z);
  });

  mergeEdges(westEdges, false).forEach(seg => {
    const length = seg.end - seg.start;
    const centerZ = seg.start + length / 2;
    const x = seg.key;
    block(0.28, 4.2, length, room.wall, x, 2, centerZ);
  });

  // Só coloca parede direita nos formatos especiais para fechar contornos estranhos.
  const special = ['formato_l', 'formato_t', 'formato_u', 'dividido', 'corredor'];
  if (special.includes(shape.id)) {
    mergeEdges(eastEdges, false).forEach(seg => {
      const length = seg.end - seg.start;
      const centerZ = seg.start + length / 2;
      const x = seg.key;
      block(0.28, 4.2, length, room.wall, x, 2, centerZ);
    });
  }

  const doorX = Math.max(-halfW + 1.6, -5.2);
  const doorZ = -halfD + 0.22;
  const spawnPoint = {
    x: Math.max(-halfW + 0.8, Math.min(halfW - 0.8, doorX)),
    z: Math.max(-halfD + 1.35, Math.min(halfD - 0.8, doorZ + 1.25)),
    rot: Math.PI
  };

  return {
    floorMesh,
    bounds: { minX: -halfW, maxX: halfW, minZ: -halfD, maxZ: halfD },
    door: { x: doorX, z: doorZ },
    spawnPoint
  };
}
