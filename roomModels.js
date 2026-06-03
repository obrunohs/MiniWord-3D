export function roomShapePreviewHTML(shape) {
  const type = shape.preview || shape.css || 'square';
  return `<span class="shape-preview habbo-shape-preview preview-${type}">
    <i></i><b></b><em></em><strong></strong>
  </span>`;
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

  // Por enquanto os formatos especiais usam paredes externas retangulares.
  // Na fase 3 podemos evoluir para paredes por tile, altura de piso e escadas.
  block(w, 4.2, 0.28, room.wall, 0, 2, -halfD);
  block(0.28, 4.2, d, room.wall, -halfW, 2, 0);

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
