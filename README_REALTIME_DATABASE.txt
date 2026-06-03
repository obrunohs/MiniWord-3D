MiniWorld 3D - versão com Realtime Database

Nesta versão:
- Firestore continua para users, rooms, mobis, inventory e trades.
- Realtime Database agora cuida de presença, posição, rotação e fala dos jogadores em tempo real.
- Caminho usado no RTDB:
  roomPresence/{roomId}/{uid}

Regras temporárias de teste do Realtime Database:
{
  "rules": {
    ".read": true,
    ".write": true
  }
}

Depois podemos criar regras mais seguras.
