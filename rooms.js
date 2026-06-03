export const roomThemes = [
  { id: 1, name: "Sala Moderna", desc: "Sofá, mesa, plantas e janela grande.", floor: 0x60758f, wall: 0x1e293b, sofa: 0x0f766e, poster: 0xf59e0b, cssFloor: "#60758f", cssWall: "#1e293b", cssSofa: "#0f766e", cssPoster: "#f59e0b" },
  { id: 2, name: "Quarto Gamer", desc: "PC gamer, neon e decoração roxa.", floor: 0x312e81, wall: 0x1e1b4b, sofa: 0x4f46e5, poster: 0x22d3ee, cssFloor: "#312e81", cssWall: "#1e1b4b", cssSofa: "#4f46e5", cssPoster: "#22d3ee" },
  { id: 3, name: "Praça Social", desc: "Área aberta com bancos e plantas.", floor: 0x15803d, wall: 0x14532d, sofa: 0x78350f, poster: 0x86efac, cssFloor: "#15803d", cssWall: "#14532d", cssSofa: "#78350f", cssPoster: "#86efac" },
  { id: 4, name: "Balada Neon", desc: "Pista escura, luzes e palco neon.", floor: 0x581c87, wall: 0x0f172a, sofa: 0xbe185d, poster: 0xa78bfa, cssFloor: "#581c87", cssWall: "#0f172a", cssSofa: "#be185d", cssPoster: "#a78bfa" },
  { id: 5, name: "Café Lounge", desc: "Mesas, balcão e clima aconchegante.", floor: 0x92400e, wall: 0x451a03, sofa: 0xb45309, poster: 0xfbbf24, cssFloor: "#92400e", cssWall: "#451a03", cssSofa: "#b45309", cssPoster: "#fbbf24" }
];

export const roomCategories = [
  { id: 'bate-papo', name: 'Bate-Papo' },
  { id: 'festa', name: 'Festa' },
  { id: 'gamer', name: 'Gamer' },
  { id: 'trocas', name: 'Trocas' },
  { id: 'decoracao', name: 'Decoração' },
  { id: 'evento', name: 'Evento' }
];

export const roomVisitorOptions = [5, 10, 15, 25, 50];

export const roomTradePreferences = [
  { id: 'nao_permitidas', name: 'Trocas não permitidas' },
  { id: 'permitidas', name: 'Trocas permitidas' },
  { id: 'somente_dono', name: 'Somente com o dono' }
];

export const roomShapes = [
  { id: 'compacto', name: 'Compacto', desc: 'Quarto pequeno social', squares: 121, w: 11, d: 11, css: 'shape-small', preview: 'small', sections: [{ x: 0, z: 0, w: 11, d: 11 }] },
  { id: 'quadrado', name: 'Quadrado', desc: 'Quarto clássico 14x14', squares: 196, w: 14, d: 14, css: 'shape-square', preview: 'square', sections: [{ x: 0, z: 0, w: 14, d: 14 }] },
  { id: 'grande', name: 'Quadrado Grande', desc: 'Quarto grande para decorar', squares: 256, w: 16, d: 16, css: 'shape-big', preview: 'big', sections: [{ x: 0, z: 0, w: 16, d: 16 }] },
  { id: 'largo', name: 'Largo', desc: 'Sala horizontal ampla', squares: 187, w: 17, d: 11, css: 'shape-wide', preview: 'wide', sections: [{ x: 0, z: 0, w: 17, d: 11 }] },
  { id: 'salao', name: 'Salão', desc: 'Espaço grande para evento', squares: 288, w: 18, d: 16, css: 'shape-hall', preview: 'hall', sections: [{ x: 0, z: 0, w: 18, d: 16 }] }
];
