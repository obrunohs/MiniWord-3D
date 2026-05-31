MiniWorld 3D Habbo - Firebase Online em Tempo Real

Arquivos principais:
- index.html
- style.css
- script.js

O Firebase do projeto miniworld-3d já está integrado no script.js.

O que esta versão adiciona:
- Login com e-mail e senha usando Firebase Auth.
- Cadastro com nome do jogador, e-mail e senha.
- Envio de link de confirmação por e-mail.
- Bloqueio de login enquanto o e-mail não estiver confirmado.
- Perfil salvo no Firestore.
- Quartos salvos/listados pelo Firestore.
- Inventário salvo no perfil do usuário.
- Mobis do quarto sincronizados em tempo real.
- Jogadores no mesmo quarto aparecem em tempo real.
- Movimento, direção e balão de fala sincronizados em tempo real.
- Ajustes de interface para celular em tela deitada.

No Firebase Console, confira:
1. Authentication > Sign-in method > Email/Password ativado.
2. Firestore Database criado.
3. Em modo de teste enquanto estiver desenvolvendo.

Regras temporárias para teste no Firestore:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

Estrutura usada no Firestore:
- users/{uid}
- rooms/{roomId}
- rooms/{roomId}/players/{uid}

Hospedar no GitHub Pages:
1. Crie um repositório no GitHub.
2. Envie index.html, style.css e script.js.
3. Vá em Settings > Pages.
4. Em Source, selecione Deploy from a branch.
5. Escolha main / root.
6. Aguarde o link ficar disponível.

Observação:
O jogo precisa ser aberto via servidor ou GitHub Pages. Se abrir direto clicando no index.html, alguns navegadores podem bloquear módulos JavaScript.
