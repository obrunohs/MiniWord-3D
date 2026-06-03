import { applyAvatarItemIds } from './avatarItems.js';

export function avatarVersion() {
  return 'v3';
}

function colorToNumber(value, fallback = 0xffffff) {
  if (typeof value === 'number') return value;
  if (!value) return fallback;
  return Number(String(value).replace('#', '0x')) || fallback;
}

export function createAvatarModel(THREE, block, character = {}, profile = {}, type = 'player') {
  const c = applyAvatarItemIds(character);
  const group = new THREE.Group();

  const skin = colorToNumber(c.skin, 0xf2b879);
  const hairColor = colorToNumber(c.hair, 0x020617);
  const shirt = colorToNumber(c.shirt, 0x2563eb);
  const pants = colorToNumber(c.pants, 0x1e3a8a);
  const shoesColor = colorToNumber(c.shoes, 0x111827);
  const accessoryColor = colorToNumber(c.accessoryColor, 0x111827);
  const wingsColor = colorToNumber(c.wingsColor, 0xf8fafc);
  const extra = colorToNumber(c.extra, 0xfbbf24);

  const hairStyle = c.hairStyle || 'curto';
  const eyeStyle = c.eyeStyle || 'normal';
  const mouthStyle = c.mouthStyle || 'sorriso';

  // Corpo base social: sem queixo quebrado, cabeça limpa, rosto frontal.
  const neck = block(0.24, 0.16, 0.22, skin, 0, 1.72, 0, group);
  const head = block(0.76, 0.72, 0.60, skin, 0, 2.13, 0, group);

  let hair = null;
  if (hairStyle !== 'careca') {
    hair = block(0.84, 0.24, 0.64, hairColor, 0, 2.58, -0.02, group);
    block(0.78, 0.18, 0.18, hairColor, 0, 2.42, -0.32, group);
    block(0.16, 0.22, 0.56, hairColor, -0.42, 2.30, -0.03, group);
    block(0.16, 0.22, 0.56, hairColor, 0.42, 2.30, -0.03, group);
    if (hairStyle === 'topete') {
      block(0.46, 0.24, 0.24, hairColor, 0.08, 2.78, -0.12, group);
      block(0.32, 0.16, 0.20, hairColor, 0.22, 2.91, -0.05, group);
    }
  }

  const eyeY = eyeStyle === 'feliz' ? 2.17 : 2.22;
  const eyeL = block(0.11, 0.10, 0.045, 0x111111, -0.19, eyeY, 0.326, group);
  const eyeR = block(0.11, 0.10, 0.045, 0x111111, 0.19, eyeY, 0.326, group);
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
    mouth = block(0.14, 0.14, 0.045, 0x4b1d12, 0, 1.96, 0.33, group);
  } else if (mouthStyle === 'neutra') {
    mouth = block(0.22, 0.045, 0.045, 0x4b1d12, 0, 1.94, 0.33, group);
  } else {
    mouth = block(0.26, 0.055, 0.045, 0x7f1d1d, 0, 1.94, 0.33, group);
  }

  const chest = block(0.84, 0.62, 0.52, shirt, 0, 1.26, 0, group);
  const waist = block(0.70, 0.26, 0.48, shirt, 0, 0.88, 0, group);
  if (c.shirtStyle === 'jaqueta') {
    block(0.12, 0.66, 0.56, 0x111827, -0.30, 1.25, 0.02, group);
    block(0.12, 0.66, 0.56, 0x111827, 0.30, 1.25, 0.02, group);
  }
  if (c.shirtStyle === 'moletom') {
    block(0.34, 0.18, 0.16, shirt, 0, 1.67, -0.28, group);
  }
  const belt = block(0.78, 0.10, 0.52, extra, 0, 0.99, 0.02, group);

  const armL = block(0.22, 0.76, 0.28, shirt, -0.63, 1.17, 0, group);
  const armR = block(0.22, 0.76, 0.28, shirt, 0.63, 1.17, 0, group);
  const handL = block(0.23, 0.19, 0.30, skin, -0.64, 0.69, 0.02, group);
  const handR = block(0.23, 0.19, 0.30, skin, 0.64, 0.69, 0.02, group);

  const legL = block(0.30, 0.78, 0.34, pants, -0.20, 0.43, 0, group);
  const legR = block(0.30, 0.78, 0.34, pants, 0.20, 0.43, 0, group);
  if (c.pantsStyle === 'short') {
    block(0.32, 0.28, 0.36, skin, -0.20, 0.20, 0, group);
    block(0.32, 0.28, 0.36, skin, 0.20, 0.20, 0, group);
  }
  const footL = block(0.40, 0.18, 0.54, shoesColor, -0.20, 0.06, 0.10, group);
  const footR = block(0.40, 0.18, 0.54, shoesColor, 0.20, 0.06, 0.10, group);

  let glasses = null;
  let crown = null;
  if (c.accessoryType === 'glasses') {
    glasses = block(0.58, 0.07, 0.05, accessoryColor, 0, 2.22, 0.36, group);
    block(0.10, 0.10, 0.05, accessoryColor, -0.19, 2.22, 0.37, group);
    block(0.10, 0.10, 0.05, accessoryColor, 0.19, 2.22, 0.37, group);
  }
  if (c.accessoryType === 'crown') {
    crown = block(0.58, 0.16, 0.48, accessoryColor, 0, 2.93, -0.02, group);
    block(0.12, 0.18, 0.12, 0xfef08a, -0.22, 3.10, -0.05, group);
    block(0.12, 0.22, 0.12, 0xfef08a, 0, 3.13, -0.05, group);
    block(0.12, 0.18, 0.12, 0xfef08a, 0.22, 3.10, -0.05, group);
  }
  let wingL = null;
  let wingR = null;
  if (c.wingsType === 'wings') {
    wingL = block(0.18, 0.86, 0.58, wingsColor, -0.62, 1.34, -0.38, group);
    wingR = block(0.18, 0.86, 0.58, wingsColor, 0.62, 1.34, -0.38, group);
    wingL.rotation.z = 0.35;
    wingR.rotation.z = -0.35;
  }

  group.userData = {
    type,
    profile: { ...profile, character: c },
    parts: {
      neck, head, hair, eyeL, eyeR, mouth,
      chest, waist, body: chest, belt,
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
