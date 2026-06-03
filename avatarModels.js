import { applyAvatarItemIds } from './avatarItems.js';

export function avatarVersion() {
  return 'kenney-style-v4';
}

function colorToNumber(value, fallback = 0xffffff) {
  if (typeof value === 'number') return value;
  if (!value) return fallback;
  return Number(String(value).replace('#', '0x')) || fallback;
}

function shade(color, amount = 0x202020) {
  return Math.max(0, color - amount);
}

export function createAvatarModel(THREE, block, character = {}, profile = {}, type = 'player') {
  const c = applyAvatarItemIds(character);
  const group = new THREE.Group();

  const skin = colorToNumber(c.skin, 0xf2b879);
  const skinDark = shade(skin, 0x181818);
  const hairColor = colorToNumber(c.hair, 0x020617);
  const shirt = colorToNumber(c.shirt, 0x2563eb);
  const shirtDark = shade(shirt, 0x222222);
  const pants = colorToNumber(c.pants, 0x1e3a8a);
  const pantsDark = shade(pants, 0x151515);
  const shoesColor = colorToNumber(c.shoes, 0x111827);
  const accessoryColor = colorToNumber(c.accessoryColor, 0x111827);
  const wingsColor = colorToNumber(c.wingsColor, 0xf8fafc);
  const extra = colorToNumber(c.extra, 0xfbbf24);

  const hairStyle = c.hairStyle || 'curto';
  const eyeStyle = c.eyeStyle || 'normal';
  const mouthStyle = c.mouthStyle || 'sorriso';

  // Avatar V4 inspirado no Kenney: cabeça limpa, cabelo sem sobreposição,
  // corpo compacto, mãos/pés visíveis e menos aparência de robô.
  const neck = block(0.26, 0.16, 0.24, skinDark, 0, 1.42, 0, group);

  // Cabeça única, sem painel/queixo na frente para evitar falhas de projeção.
  const head = block(0.86, 0.78, 0.68, skin, 0, 1.88, 0, group);

  // Cabelo fica por cima e nas laterais, sempre afastado da face.
  let hair = null;
  if (hairStyle !== 'careca') {
    hair = block(0.92, 0.22, 0.72, hairColor, 0, 2.34, -0.04, group);
    block(0.88, 0.18, 0.18, hairColor, 0, 2.16, -0.42, group);
    block(0.18, 0.34, 0.58, hairColor, -0.52, 1.98, -0.08, group);
    block(0.18, 0.34, 0.58, hairColor, 0.52, 1.98, -0.08, group);

    if (hairStyle === 'topete') {
      block(0.46, 0.28, 0.26, hairColor, 0.02, 2.56, -0.16, group);
      block(0.30, 0.18, 0.22, hairColor, 0.18, 2.72, -0.08, group);
    }
  }

  // Face posicionada um pouco à frente da cabeça para evitar z-fighting.
  const faceZ = 0.372;
  const eyeY = eyeStyle === 'feliz' ? 1.90 : 1.93;
  const eyeL = block(0.12, 0.12, 0.055, 0x111111, -0.21, eyeY, faceZ, group);
  const eyeR = block(0.12, 0.12, 0.055, 0x111111, 0.21, eyeY, faceZ, group);
  if (eyeStyle === 'feliz') {
    eyeL.rotation.z = -0.35;
    eyeR.rotation.z = 0.35;
  }
  if (eyeStyle === 'bravo') {
    eyeL.rotation.z = 0.25;
    eyeR.rotation.z = -0.25;
    block(0.18, 0.045, 0.058, hairColor, -0.21, 2.06, faceZ + 0.006, group).rotation.z = 0.22;
    block(0.18, 0.045, 0.058, hairColor, 0.21, 2.06, faceZ + 0.006, group).rotation.z = -0.22;
  }

  let mouth;
  if (mouthStyle === 'surpreso') {
    mouth = block(0.14, 0.14, 0.055, 0x4b1d12, 0, 1.68, faceZ + 0.008, group);
  } else if (mouthStyle === 'neutra') {
    mouth = block(0.25, 0.045, 0.055, 0x4b1d12, 0, 1.65, faceZ + 0.008, group);
  } else {
    mouth = block(0.28, 0.055, 0.055, 0x7f1d1d, 0, 1.65, faceZ + 0.008, group);
    block(0.11, 0.028, 0.058, 0xffffff, 0, 1.672, faceZ + 0.014, group);
  }

  // Corpo inspirado nos blocky characters: tronco simples com volume e sem peças finas demais.
  const chest = block(0.88, 0.58, 0.54, shirt, 0, 1.10, 0, group);
  const torsoFront = block(0.70, 0.46, 0.06, shirtDark, 0, 1.10, 0.32, group);
  const waist = block(0.74, 0.22, 0.50, shirt, 0, 0.75, 0, group);
  const belt = block(0.78, 0.08, 0.54, extra, 0, 0.86, 0.02, group);

  if (c.shirtStyle === 'jaqueta') {
    block(0.15, 0.56, 0.60, 0x111827, -0.33, 1.10, 0.02, group);
    block(0.15, 0.56, 0.60, 0x111827, 0.33, 1.10, 0.02, group);
    block(0.08, 0.42, 0.07, 0xf8fafc, 0, 1.08, 0.36, group);
  }
  if (c.shirtStyle === 'moletom') {
    block(0.38, 0.17, 0.18, shirtDark, 0, 1.46, -0.30, group);
  }

  // Braços e mãos estilo bonequinho: curtos e grossos.
  const armL = block(0.25, 0.62, 0.32, shirt, -0.66, 1.03, 0, group);
  const armR = block(0.25, 0.62, 0.32, shirt, 0.66, 1.03, 0, group);
  armL.rotation.z = -0.08;
  armR.rotation.z = 0.08;
  const handL = block(0.26, 0.20, 0.32, skin, -0.68, 0.62, 0.02, group);
  const handR = block(0.26, 0.20, 0.32, skin, 0.68, 0.62, 0.02, group);

  // Pernas compactas e sapatos maiores.
  const legL = block(0.33, 0.56, 0.36, pants, -0.21, 0.38, 0, group);
  const legR = block(0.33, 0.56, 0.36, pants, 0.21, 0.38, 0, group);
  if (c.pantsStyle === 'short') {
    block(0.33, 0.24, 0.37, skinDark, -0.21, 0.19, 0, group);
    block(0.33, 0.24, 0.37, skinDark, 0.21, 0.19, 0, group);
  } else {
    block(0.33, 0.18, 0.37, pantsDark, -0.21, 0.17, 0, group);
    block(0.33, 0.18, 0.37, pantsDark, 0.21, 0.17, 0, group);
  }
  const footL = block(0.45, 0.18, 0.58, shoesColor, -0.22, 0.06, 0.13, group);
  const footR = block(0.45, 0.18, 0.58, shoesColor, 0.22, 0.06, 0.13, group);

  let glasses = null;
  let crown = null;
  if (c.accessoryType === 'glasses') {
    glasses = block(0.66, 0.07, 0.06, accessoryColor, 0, 1.94, faceZ + 0.036, group);
    block(0.13, 0.13, 0.06, accessoryColor, -0.22, 1.94, faceZ + 0.044, group);
    block(0.13, 0.13, 0.06, accessoryColor, 0.22, 1.94, faceZ + 0.044, group);
  }
  if (c.accessoryType === 'crown') {
    crown = block(0.62, 0.15, 0.50, accessoryColor, 0, 2.66, -0.02, group);
    block(0.12, 0.18, 0.12, 0xfef08a, -0.24, 2.82, -0.05, group);
    block(0.12, 0.22, 0.12, 0xfef08a, 0, 2.85, -0.05, group);
    block(0.12, 0.18, 0.12, 0xfef08a, 0.24, 2.82, -0.05, group);
  }

  let wingL = null;
  let wingR = null;
  if (c.wingsType === 'wings') {
    wingL = block(0.18, 0.76, 0.60, wingsColor, -0.66, 1.16, -0.42, group);
    wingR = block(0.18, 0.76, 0.60, wingsColor, 0.66, 1.16, -0.42, group);
    wingL.rotation.z = 0.35;
    wingR.rotation.z = -0.35;
  }

  group.userData = {
    type,
    profile: { ...profile, character: c },
    parts: {
      neck, head, hair, eyeL, eyeR, mouth,
      chest, torsoFront, waist, body: chest, belt,
      armL, armR, handL, handR,
      legL, legR, footL, footR,
      glasses, crown, wingL, wingR
    },
    baseY: 0,
    walkClock: 0,
    lastX: null,
    lastZ: null
  };

  return group;
}
