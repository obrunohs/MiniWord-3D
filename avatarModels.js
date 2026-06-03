export function avatarVersion() {
  return 'v2';
}

function colorToNumber(value, fallback = 0xffffff) {
  if (typeof value === 'number') return value;
  if (!value) return fallback;
  return Number(String(value).replace('#', '0x')) || fallback;
}

export function createAvatarModel(THREE, block, character = {}, profile = {}, type = 'player') {
  const group = new THREE.Group();

  const skin = colorToNumber(character.skin, 0xf2b879);
  const hairColor = colorToNumber(character.hair, 0x020617);
  const shirt = colorToNumber(character.shirt, 0x2563eb);
  const pants = colorToNumber(character.pants, 0x1e3a8a);
  const extra = colorToNumber(character.extra, 0xfbbf24);
  const shoesColor = colorToNumber(character.shoes || character.shoe || '#111827', 0x111827);
  const hairStyle = character.hairStyle || 'curto';
  const eyeStyle = character.eyeStyle || 'normal';
  const mouthStyle = character.mouthStyle || 'sorriso';

  // Cabeça maior e menos "robô" visualmente, mantendo voxel leve.
  const neck = block(0.26, 0.18, 0.24, skin, 0, 1.72, 0, group);
  const head = block(0.74, 0.68, 0.58, skin, 0, 2.14, 0, group);
  const chin = block(0.58, 0.12, 0.48, skin, 0, 1.78, 0.02, group);

  let hair = null;
  if (hairStyle !== 'careca') {
    hair = block(0.82, 0.26, 0.62, hairColor, 0, 2.55, -0.02, group);
    block(0.82, 0.20, 0.22, hairColor, 0, 2.38, -0.28, group);
    if (hairStyle === 'topete') {
      block(0.45, 0.26, 0.28, hairColor, 0.05, 2.74, -0.16, group);
      block(0.34, 0.18, 0.20, hairColor, 0.18, 2.88, -0.10, group);
    }
  }

  // Olhos e boca separados para futuras faces.
  const eyeY = eyeStyle === 'feliz' ? 2.17 : 2.20;
  const eyeL = block(0.11, eyeStyle === 'bravo' ? 0.08 : 0.10, 0.045, 0x111111, -0.18, eyeY, 0.315, group);
  const eyeR = block(0.11, eyeStyle === 'bravo' ? 0.08 : 0.10, 0.045, 0x111111, 0.18, eyeY, 0.315, group);
  if (eyeStyle === 'feliz') {
    eyeL.rotation.z = -0.35;
    eyeR.rotation.z = 0.35;
  }
  if (eyeStyle === 'bravo') {
    eyeL.rotation.z = 0.25;
    eyeR.rotation.z = -0.25;
  }

  let mouth;
  if (mouthStyle === 'surpreso') {
    mouth = block(0.16, 0.16, 0.045, 0x4b1d12, 0, 1.98, 0.325, group);
  } else if (mouthStyle === 'neutra') {
    mouth = block(0.24, 0.055, 0.045, 0x4b1d12, 0, 1.96, 0.325, group);
  } else {
    mouth = block(0.30, 0.065, 0.045, 0x7f1d1d, 0, 1.96, 0.325, group);
    block(0.12, 0.04, 0.048, 0xffffff, 0, 1.985, 0.33, group);
  }

  // Corpo com ombros e cintura levemente diferentes.
  const chest = block(0.82, 0.62, 0.50, shirt, 0, 1.28, 0, group);
  const waist = block(0.70, 0.28, 0.48, shirt, 0, 0.88, 0, group);
  const belt = block(0.78, 0.10, 0.52, extra, 0, 0.98, 0.02, group);

  // Braços um pouco afastados, com mãos.
  const armL = block(0.22, 0.78, 0.28, shirt, -0.62, 1.18, 0, group);
  const armR = block(0.22, 0.78, 0.28, shirt, 0.62, 1.18, 0, group);
  armL.rotation.z = -0.08;
  armR.rotation.z = 0.08;
  const handL = block(0.24, 0.20, 0.30, skin, -0.64, 0.70, 0.02, group);
  const handR = block(0.24, 0.20, 0.30, skin, 0.64, 0.70, 0.02, group);

  // Pernas, pés e sapatos.
  const legL = block(0.30, 0.78, 0.34, pants, -0.20, 0.43, 0, group);
  const legR = block(0.30, 0.78, 0.34, pants, 0.20, 0.43, 0, group);
  const footL = block(0.38, 0.18, 0.52, shoesColor, -0.20, 0.06, 0.10, group);
  const footR = block(0.38, 0.18, 0.52, shoesColor, 0.20, 0.06, 0.10, group);

  group.userData = {
    type,
    profile,
    parts: {
      neck, head, chin, hair, eyeL, eyeR, mouth,
      chest, waist, body: chest, belt,
      armL, armR, handL, handR,
      legL, legR, footL, footR
    },
    baseY: 0,
    walkClock: 0,
    lastX: null,
    lastZ: null
  };

  return group;
}
