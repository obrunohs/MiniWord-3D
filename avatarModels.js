import { applyAvatarItemIds } from './avatarItems.js';

export function avatarVersion() {
  return 'habbo-like-v1';
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
  const skinDark = colorToNumber(c.skinDark || c.skin, 0xd8a271);
  const hairColor = colorToNumber(c.hair, 0x020617);
  const shirt = colorToNumber(c.shirt, 0x2563eb);
  const shirtDark = Math.max(0, shirt - 0x222222);
  const pants = colorToNumber(c.pants, 0x1e3a8a);
  const shoesColor = colorToNumber(c.shoes, 0x111827);
  const accessoryColor = colorToNumber(c.accessoryColor, 0x111827);
  const wingsColor = colorToNumber(c.wingsColor, 0xf8fafc);
  const extra = colorToNumber(c.extra, 0xfbbf24);

  const hairStyle = c.hairStyle || 'curto';
  const eyeStyle = c.eyeStyle || 'normal';
  const mouthStyle = c.mouthStyle || 'sorriso';

  // Proporção Habbo-like: avatar mais compacto, cabeça maior e corpo menor.
  const neck = block(0.24, 0.14, 0.22, skinDark, 0, 1.38, 0, group);

  // Cabeça principal mais larga, sem queixo separado.
  const head = block(0.88, 0.74, 0.64, skin, 0, 1.82, 0, group);
  // Bochechas/volume frontal suave, sem quebrar o rosto quando a câmera gira.
  const facePanel = block(0.74, 0.52, 0.045, skin, 0, 1.78, 0.345, group);

  let hair = null;
  if (hairStyle !== 'careca') {
    hair = block(0.94, 0.22, 0.68, hairColor, 0, 2.24, -0.02, group);
    block(0.88, 0.22, 0.18, hairColor, 0, 2.08, -0.36, group);
    block(0.16, 0.32, 0.58, hairColor, -0.47, 1.95, -0.04, group);
    block(0.16, 0.32, 0.58, hairColor, 0.47, 1.95, -0.04, group);
    if (hairStyle === 'topete') {
      block(0.52, 0.26, 0.26, hairColor, 0.06, 2.43, -0.12, group);
      block(0.34, 0.18, 0.18, hairColor, 0.18, 2.57, -0.04, group);
    }
  }

  // Rosto frontal mais limpo e maior, estilo bonequinho social.
  const eyeY = eyeStyle === 'feliz' ? 1.86 : 1.89;
  const eyeL = block(0.12, 0.11, 0.05, 0x111111, -0.22, eyeY, 0.382, group);
  const eyeR = block(0.12, 0.11, 0.05, 0x111111, 0.22, eyeY, 0.382, group);
  if (eyeStyle === 'feliz') {
    eyeL.rotation.z = -0.35;
    eyeR.rotation.z = 0.35;
  }
  if (eyeStyle === 'bravo') {
    eyeL.rotation.z = 0.25;
    eyeR.rotation.z = -0.25;
    block(0.18, 0.045, 0.05, hairColor, -0.22, 2.01, 0.386, group).rotation.z = 0.22;
    block(0.18, 0.045, 0.05, hairColor, 0.22, 2.01, 0.386, group).rotation.z = -0.22;
  }

  let mouth;
  if (mouthStyle === 'surpreso') {
    mouth = block(0.14, 0.14, 0.05, 0x4b1d12, 0, 1.66, 0.386, group);
  } else if (mouthStyle === 'neutra') {
    mouth = block(0.26, 0.045, 0.05, 0x4b1d12, 0, 1.63, 0.386, group);
  } else {
    mouth = block(0.30, 0.055, 0.05, 0x7f1d1d, 0, 1.63, 0.386, group);
    block(0.12, 0.03, 0.052, 0xffffff, 0, 1.65, 0.392, group);
  }

  // Corpo compacto com ombros arredondados por blocos extras.
  const chest = block(0.92, 0.52, 0.52, shirt, 0, 1.10, 0, group);
  const shirtFront = block(0.72, 0.44, 0.05, shirt, 0, 1.10, 0.285, group);
  const waist = block(0.74, 0.24, 0.48, shirt, 0, 0.76, 0, group);
  const belt = block(0.78, 0.08, 0.52, extra, 0, 0.88, 0.02, group);

  if (c.shirtStyle === 'jaqueta') {
    block(0.14, 0.54, 0.56, 0x111827, -0.33, 1.09, 0.02, group);
    block(0.14, 0.54, 0.56, 0x111827, 0.33, 1.09, 0.02, group);
    block(0.08, 0.42, 0.06, 0xf8fafc, 0, 1.08, 0.32, group);
  }
  if (c.shirtStyle === 'moletom') {
    block(0.36, 0.16, 0.16, shirtDark, 0, 1.43, -0.28, group);
  }

  // Braços curtos e laterais, parecendo menos robô.
  const armL = block(0.24, 0.62, 0.30, shirt, -0.66, 1.03, 0, group);
  const armR = block(0.24, 0.62, 0.30, shirt, 0.66, 1.03, 0, group);
  armL.rotation.z = -0.08;
  armR.rotation.z = 0.08;
  const handL = block(0.24, 0.18, 0.30, skin, -0.68, 0.62, 0.02, group);
  const handR = block(0.24, 0.18, 0.30, skin, 0.68, 0.62, 0.02, group);

  // Pernas menores e sapatos mais visíveis.
  const legL = block(0.32, 0.58, 0.34, pants, -0.21, 0.38, 0, group);
  const legR = block(0.32, 0.58, 0.34, pants, 0.21, 0.38, 0, group);
  if (c.pantsStyle === 'short') {
    block(0.32, 0.24, 0.36, skin, -0.21, 0.20, 0, group);
    block(0.32, 0.24, 0.36, skin, 0.21, 0.20, 0, group);
  }
  const footL = block(0.44, 0.18, 0.56, shoesColor, -0.22, 0.06, 0.12, group);
  const footR = block(0.44, 0.18, 0.56, shoesColor, 0.22, 0.06, 0.12, group);

  let glasses = null;
  let crown = null;
  if (c.accessoryType === 'glasses') {
    glasses = block(0.66, 0.07, 0.055, accessoryColor, 0, 1.90, 0.41, group);
    block(0.12, 0.12, 0.055, accessoryColor, -0.22, 1.90, 0.418, group);
    block(0.12, 0.12, 0.055, accessoryColor, 0.22, 1.90, 0.418, group);
  }
  if (c.accessoryType === 'crown') {
    crown = block(0.62, 0.15, 0.48, accessoryColor, 0, 2.58, -0.02, group);
    block(0.12, 0.18, 0.12, 0xfef08a, -0.24, 2.73, -0.05, group);
    block(0.12, 0.22, 0.12, 0xfef08a, 0, 2.76, -0.05, group);
    block(0.12, 0.18, 0.12, 0xfef08a, 0.24, 2.73, -0.05, group);
  }

  let wingL = null;
  let wingR = null;
  if (c.wingsType === 'wings') {
    wingL = block(0.18, 0.74, 0.58, wingsColor, -0.64, 1.15, -0.40, group);
    wingR = block(0.18, 0.74, 0.58, wingsColor, 0.64, 1.15, -0.40, group);
    wingL.rotation.z = 0.35;
    wingR.rotation.z = -0.35;
  }

  group.userData = {
    type,
    profile: { ...profile, character: c },
    parts: {
      neck, head, facePanel, hair, eyeL, eyeR, mouth,
      chest, shirtFront, waist, body: chest, belt,
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
