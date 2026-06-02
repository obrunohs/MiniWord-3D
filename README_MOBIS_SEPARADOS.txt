MiniWorld 3D - mobis separados

Arquivos principais:
- mobis.js: catálogo da loja, nomes, preços, descrições, cores e variantes.
- mobiModels.js: desenhos/modelos 3D dos mobis.
- script.js: lógica do jogo, loja, inventário, quartos, Firebase e multiplayer.

Para adicionar mobis simples:
1. Edite mobis.js.
2. Use uma variant existente, por exemplo: sofa, chair, pc, tv, rug, bed, shelf, arcade, jukebox, throne, safe, trophy, lamp, wall_frame.

Para criar um desenho 3D totalmente novo:
1. Adicione uma nova variant no mobis.js.
2. Crie o bloco correspondente em mobiModels.js dentro de createMobiModel().
