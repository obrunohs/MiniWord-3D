export const mobiCategories = [
  { id: 'todos', name: 'Todos', icon: '▦' },
  { id: 'casa', name: 'Casa', icon: '🏠' },
  { id: 'quarto', name: 'Quarto', icon: '🛏️' },
  { id: 'gamer', name: 'Gamer', icon: '🎮' },
  { id: 'luxo', name: 'Luxo', icon: '👑' },
  { id: 'decoracao', name: 'Decoração', icon: '🌿' },
  { id: 'parede', name: 'Parede', icon: '🖼️' },
  { id: 'cozinha', name: 'Cozinha', icon: '🍳' },
  { id: 'tintas_parede', name: 'Tintas Parede', icon: '🎨' },
  { id: 'tintas_piso', name: 'Tintas Piso', icon: '🧱' },
  { id: 'cambio', name: 'Câmbio', icon: '💰' }
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
  { id: 'quadro_neon', name: 'Quadro Neon', icon: '▧', desc: 'Quadro de parede neon.', price: 140, color: 0xa78bfa, wallOnly: true, variant: 'wall_frame', category: 'parede' },

  // Cozinha
  { id: 'geladeira', name: 'Geladeira', icon: '▥', desc: 'Geladeira pixelada com freezer.', price: 240, color: 0xe5e7eb, variant: 'fridge', category: 'cozinha' },
  { id: 'fogao', name: 'Fogão', icon: '▦', desc: 'Fogão com quatro bocas.', price: 210, color: 0x475569, variant: 'stove', category: 'cozinha' },
  { id: 'pia_cozinha', name: 'Pia de Cozinha', icon: '▤', desc: 'Pia com balcão e torneira.', price: 190, color: 0x94a3b8, variant: 'sink', category: 'cozinha' },
  { id: 'microondas', name: 'Micro-ondas', icon: '▭', desc: 'Micro-ondas compacto.', price: 130, color: 0x111827, variant: 'microwave', category: 'cozinha' },
  { id: 'armario_cozinha', name: 'Armário de Cozinha', icon: '▥', desc: 'Armário alto para cozinha.', price: 180, color: 0x92400e, variant: 'kitchen_cabinet', category: 'cozinha' },
  { id: 'mesa_jantar', name: 'Mesa de Jantar', icon: '▣', desc: 'Mesa grande para refeições.', price: 160, color: 0x9a5a20, variant: 'dining_table', category: 'cozinha' },
  { id: 'cadeira_cozinha', name: 'Cadeira de Cozinha', icon: '♙', desc: 'Cadeira simples de cozinha.', price: 75, color: 0xf59e0b, variant: 'kitchen_chair', category: 'cozinha' },
  { id: 'cafeteira', name: 'Cafeteira', icon: '☕', desc: 'Cafeteira para bancada.', price: 115, color: 0x1f2937, variant: 'coffee_maker', category: 'cozinha' },
  { id: 'liquidificador', name: 'Liquidificador', icon: '◫', desc: 'Liquidificador pixelado.', price: 105, color: 0x22d3ee, variant: 'blender', category: 'cozinha' },
  { id: 'forno', name: 'Forno', icon: '▣', desc: 'Forno moderno embutido.', price: 170, color: 0x334155, variant: 'oven', category: 'cozinha' },

  // Tintas de parede
  { id: 'paint_wall_preto', name: 'Parede Preta', icon: '🎨', desc: 'Pinta a parede do quarto.', price: 60, color: 0x111827, category: 'tintas_parede', paintType: 'wall', paintColor: 0x111827 },
  { id: 'paint_wall_azul', name: 'Parede Azul', icon: '🎨', desc: 'Pinta a parede do quarto.', price: 60, color: 0x1e3a8a, category: 'tintas_parede', paintType: 'wall', paintColor: 0x1e3a8a },
  { id: 'paint_wall_roxa', name: 'Parede Roxa', icon: '🎨', desc: 'Pinta a parede do quarto.', price: 70, color: 0x581c87, category: 'tintas_parede', paintType: 'wall', paintColor: 0x581c87 },
  { id: 'paint_wall_verde', name: 'Parede Verde', icon: '🎨', desc: 'Pinta a parede do quarto.', price: 60, color: 0x14532d, category: 'tintas_parede', paintType: 'wall', paintColor: 0x14532d },
  { id: 'paint_wall_marrom', name: 'Parede Marrom', icon: '🎨', desc: 'Pinta a parede do quarto.', price: 60, color: 0x451a03, category: 'tintas_parede', paintType: 'wall', paintColor: 0x451a03 },

  // Tintas de piso
  { id: 'paint_floor_cinza', name: 'Piso Cinza', icon: '🧱', desc: 'Pinta o chão do quarto.', price: 60, color: 0x60758f, category: 'tintas_piso', paintType: 'floor', paintColor: 0x60758f },
  { id: 'paint_floor_preto', name: 'Piso Preto', icon: '🧱', desc: 'Pinta o chão do quarto.', price: 70, color: 0x1f2937, category: 'tintas_piso', paintType: 'floor', paintColor: 0x1f2937 },
  { id: 'paint_floor_azul', name: 'Piso Azul', icon: '🧱', desc: 'Pinta o chão do quarto.', price: 70, color: 0x312e81, category: 'tintas_piso', paintType: 'floor', paintColor: 0x312e81 },
  { id: 'paint_floor_verde', name: 'Piso Verde', icon: '🧱', desc: 'Pinta o chão do quarto.', price: 60, color: 0x15803d, category: 'tintas_piso', paintType: 'floor', paintColor: 0x15803d },
  { id: 'paint_floor_madeira', name: 'Piso Madeira', icon: '🧱', desc: 'Pinta o chão do quarto.', price: 80, color: 0x92400e, category: 'tintas_piso', paintType: 'floor', paintColor: 0x92400e },

  // Câmbios
  { id: 'cambio_moeda_1', name: 'Moeda de 1', icon: '🪙', desc: 'Câmbio resgatável de 1 moeda.', price: 1, color: 0xfacc15, category: 'cambio', variant: 'coin', cambioValue: 1 },
  { id: 'cambio_moeda_5', name: 'Moeda de 5', icon: '🪙', desc: 'Câmbio resgatável de 5 moedas.', price: 5, color: 0xf59e0b, category: 'cambio', variant: 'coin_stack', cambioValue: 5 },
  { id: 'cambio_moeda_10', name: 'Moeda de 10', icon: '🪙', desc: 'Câmbio resgatável de 10 moedas.', price: 10, color: 0xfbbf24, category: 'cambio', variant: 'coin_pile', cambioValue: 10 },
  { id: 'cambio_saco_50', name: 'Saco de 50', icon: '💰', desc: 'Câmbio resgatável de 50 moedas.', price: 50, color: 0x92400e, category: 'cambio', variant: 'money_bag', cambioValue: 50 },
  { id: 'cambio_saco_100', name: 'Saco de 100', icon: '💰', desc: 'Câmbio resgatável de 100 moedas.', price: 100, color: 0xb45309, category: 'cambio', variant: 'money_bag_big', cambioValue: 100 },
  { id: 'cambio_saco_250', name: 'Saco de 250', icon: '💰', desc: 'Câmbio resgatável de 250 moedas.', price: 250, color: 0x78350f, category: 'cambio', variant: 'money_chest', cambioValue: 250 },
  { id: 'cambio_ouro_500', name: 'Barra de Ouro 500', icon: '▰', desc: 'Câmbio resgatável de 500 moedas.', price: 500, color: 0xfbbf24, category: 'cambio', variant: 'gold_bar', cambioValue: 500 },
  { id: 'cambio_ouro_1000', name: 'Barra de Ouro 1000', icon: '▰', desc: 'Câmbio resgatável de 1000 moedas.', price: 1000, color: 0xfacc15, category: 'cambio', variant: 'gold_stack', cambioValue: 1000 }
];
