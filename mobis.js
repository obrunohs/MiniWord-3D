export const mobiCategories = [
  { id: 'todos', name: 'Todos', icon: '▦' },
  { id: 'casa', name: 'Casa', icon: '🏠' },
  { id: 'quarto', name: 'Quarto', icon: '🛏️' },
  { id: 'gamer', name: 'Gamer', icon: '🎮' },
  { id: 'luxo', name: 'Luxo', icon: '👑' },
  { id: 'decoracao', name: 'Decoração', icon: '🌿' },
  { id: 'parede', name: 'Parede', icon: '🖼️' }
];

export const mobiCatalog = [
  { id: 'sofa', name: 'Sofá Verde', icon: '🛋️', desc: 'Sofá pixel para sala.', price: 80, color: 0x0f766e, category: 'casa' },
  { id: 'mesa', name: 'Mesa de Madeira', icon: '▣', desc: 'Mesa de centro.', price: 60, color: 0x9a5a20, category: 'casa' },
  { id: 'balcao', name: 'Balcão', icon: '▤', desc: 'Balcão/estante.', price: 120, color: 0x78350f, category: 'casa' },
  { id: 'planta', name: 'Planta', icon: '🌿', desc: 'Planta decorativa.', price: 45, color: 0x22c55e, category: 'decoracao' },
  { id: 'janela', name: 'Janela', icon: '▦', desc: 'Janela de parede recolhível.', price: 90, color: 0x7dd3fc, wallOnly: true, category: 'parede' },

  { id: 'sofa_azul', name: 'Sofá Azul', icon: '🛋️', desc: 'Sofá azul moderno.', price: 110, color: 0x2563eb, variant: 'sofa', palette: [0x2563eb, 0x1d4ed8], category: 'casa' },
  { id: 'sofa_vermelho', name: 'Sofá Vermelho', icon: '🛋️', desc: 'Sofá vermelho raro.', price: 130, color: 0xdc2626, variant: 'sofa', palette: [0xdc2626, 0x991b1b], category: 'casa' },
  { id: 'cadeira_gamer', name: 'Cadeira Gamer', icon: '♙', desc: 'Cadeira gamer pixel.', price: 160, color: 0x7c3aed, variant: 'chair', category: 'gamer' },
  { id: 'pc_gamer', name: 'PC Gamer', icon: '▣', desc: 'Mesa com computador neon.', price: 220, color: 0x22d3ee, variant: 'pc', category: 'gamer' },
  { id: 'tv_pixel', name: 'TV Pixel', icon: '▭', desc: 'Televisão para sala.', price: 180, color: 0x111827, variant: 'tv', category: 'casa' },
  { id: 'tapete_vermelho', name: 'Tapete Vermelho', icon: '▰', desc: 'Tapete baixo decorativo.', price: 70, color: 0xb91c1c, variant: 'rug', category: 'decoracao' },
  { id: 'cama_pixel', name: 'Cama Pixel', icon: '▤', desc: 'Cama simples confortável.', price: 210, color: 0x38bdf8, variant: 'bed', category: 'quarto' },
  { id: 'estante', name: 'Estante', icon: '▥', desc: 'Estante com livros.', price: 150, color: 0x92400e, variant: 'shelf', category: 'casa' },
  { id: 'fliperama', name: 'Fliperama', icon: '▣', desc: 'Arcade colorido.', price: 300, color: 0xec4899, variant: 'arcade', category: 'gamer' },
  { id: 'jukebox', name: 'Jukebox', icon: '♫', desc: 'Jukebox retrô.', price: 280, color: 0xf59e0b, variant: 'jukebox', category: 'luxo' },
  { id: 'trono_dourado', name: 'Trono Dourado', icon: '♛', desc: 'Mobi raro de luxo.', price: 500, color: 0xfbbf24, variant: 'throne', category: 'luxo' },
  { id: 'cofre', name: 'Cofre', icon: '▣', desc: 'Cofre pesado.', price: 260, color: 0x475569, variant: 'safe', category: 'luxo' },
  { id: 'trofeu', name: 'Troféu', icon: '★', desc: 'Troféu dourado.', price: 350, color: 0xfacc15, variant: 'trophy', category: 'luxo' },
  { id: 'luminaria', name: 'Luminária', icon: '◉', desc: 'Luminária de chão.', price: 95, color: 0xfef08a, variant: 'lamp', category: 'decoracao' },
  { id: 'quadro_neon', name: 'Quadro Neon', icon: '▧', desc: 'Quadro de parede neon.', price: 140, color: 0xa78bfa, wallOnly: true, variant: 'wall_frame', category: 'parede' }
];
