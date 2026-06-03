export const avatarItems = {
  skins: [
    { id: 'pele_clara', name: 'Pele Clara', color: '#f2b879' },
    { id: 'pele_media', name: 'Pele Média', color: '#d8a271' },
    { id: 'pele_escura', name: 'Pele Escura', color: '#8d5524' }
  ],
  hairs: [
    { id: 'curto_preto', name: 'Curto Preto', style: 'curto', color: '#020617' },
    { id: 'topete_castanho', name: 'Topete Castanho', style: 'topete', color: '#4b2e1f' },
    { id: 'loiro_curto', name: 'Curto Loiro', style: 'curto', color: '#ca8a04' },
    { id: 'careca', name: 'Careca', style: 'careca', color: '#020617' }
  ],
  faces: [
    { id: 'normal', name: 'Normal', eyes: 'normal', mouth: 'sorriso' },
    { id: 'feliz', name: 'Feliz', eyes: 'feliz', mouth: 'sorriso' },
    { id: 'bravo', name: 'Bravo', eyes: 'bravo', mouth: 'neutra' },
    { id: 'surpreso', name: 'Surpreso', eyes: 'normal', mouth: 'surpreso' }
  ],
  shirts: [
    { id: 'camisa_azul', name: 'Camisa Azul', color: '#2563eb', style: 'basica' },
    { id: 'camisa_preta', name: 'Camisa Preta', color: '#111827', style: 'basica' },
    { id: 'jaqueta_vermelha', name: 'Jaqueta Vermelha', color: '#dc2626', style: 'jaqueta' },
    { id: 'moletom_roxo', name: 'Moletom Roxo', color: '#7c3aed', style: 'moletom' }
  ],
  pants: [
    { id: 'calca_jeans', name: 'Calça Jeans', color: '#1e3a8a', style: 'jeans' },
    { id: 'calca_preta', name: 'Calça Preta', color: '#111827', style: 'basica' },
    { id: 'short_verde', name: 'Short Verde', color: '#14532d', style: 'short' }
  ],
  shoes: [
    { id: 'tenis_preto', name: 'Tênis Preto', color: '#111827' },
    { id: 'tenis_branco', name: 'Tênis Branco', color: '#f8fafc' },
    { id: 'bota_marrom', name: 'Bota Marrom', color: '#78350f' }
  ],
  accessories: [
    { id: 'none', name: 'Sem acessório', type: 'none' },
    { id: 'oculos_preto', name: 'Óculos Preto', type: 'glasses', color: '#111827' },
    { id: 'coroa', name: 'Coroa', type: 'crown', color: '#facc15' }
  ],
  wings: [
    { id: 'none', name: 'Sem asas', type: 'none' },
    { id: 'asa_branca', name: 'Asa Branca', type: 'wings', color: '#f8fafc' },
    { id: 'asa_preta', name: 'Asa Preta', type: 'wings', color: '#111827' }
  ]
};

export function getAvatarItem(group, id) {
  return (avatarItems[group] || []).find(item => item.id === id) || (avatarItems[group] || [])[0] || null;
}

export function applyAvatarItemIds(character = {}) {
  const skin = getAvatarItem('skins', character.skinId || 'pele_clara');
  const hair = getAvatarItem('hairs', character.hairId || 'curto_preto');
  const face = getAvatarItem('faces', character.faceId || 'normal');
  const shirt = getAvatarItem('shirts', character.shirtId || 'camisa_azul');
  const pants = getAvatarItem('pants', character.pantsId || 'calca_jeans');
  const shoes = getAvatarItem('shoes', character.shoesId || 'tenis_preto');
  const accessory = getAvatarItem('accessories', character.accessoryId || 'none');
  const wings = getAvatarItem('wings', character.wingsId || 'none');

  return {
    ...character,
    skin: skin?.color || character.skin || '#f2b879',
    hair: hair?.color || character.hair || '#020617',
    hairStyle: hair?.style || character.hairStyle || 'curto',
    eyeStyle: face?.eyes || character.eyeStyle || 'normal',
    mouthStyle: face?.mouth || character.mouthStyle || 'sorriso',
    shirt: shirt?.color || character.shirt || '#2563eb',
    shirtStyle: shirt?.style || character.shirtStyle || 'basica',
    pants: pants?.color || character.pants || '#1e3a8a',
    pantsStyle: pants?.style || character.pantsStyle || 'jeans',
    shoes: shoes?.color || character.shoes || '#111827',
    accessoryType: accessory?.type || 'none',
    accessoryColor: accessory?.color || '#111827',
    wingsType: wings?.type || 'none',
    wingsColor: wings?.color || '#f8fafc'
  };
}

export const avatarOptions = avatarItems;
