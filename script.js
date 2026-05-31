import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDagT_XfrUBOXQ3xkcbyR6ruusOVsvWBRw",
  authDomain: "miniworld-3d.firebaseapp.com",
  projectId: "miniworld-3d",
  storageBucket: "miniworld-3d.firebasestorage.app",
  messagingSenderId: "1006299767484",
  appId: "1:1006299767484:web:bf848197d183ae62e4e6b9"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
let onlineRooms = [];
let unsubscribeRooms = null;
let unsubscribeRoomPlayers = null;
let unsubscribeCurrentRoomDoc = null;
let remotePlayers = new Map();
let lastPresenceSync = 0;
let lastPresenceState = '';
let lastLocalMobisSignature = '';
let applyingRemoteMobis = false;
let selectedRemotePlayer = null;
let currentTrade = null;
let unsubscribeTrade = null;
let unsubscribeTradeRequests = null;
let unsubscribeTradeRequestDoc = null;
let pendingTradeRequest = null;
let presenceHeartbeatTimer = null;
let lastFrameTime = performance.now();
let touchCamera = { active: false, lastDistance: 0, lastAngle: 0, lastCenterX: 0, lastCenterY: 0 };

const ADMIN_LOGIN = "adm";
const ADMIN_PASSWORD = "adm134676";

const characters = [
  { id: 1, name: "Casual Azul", desc: "Visual clássico de praça social.", skin: "#f2b879", hair: "#4b2e1f", shirt: "#2563eb", pants: "#1e3a8a", extra: "#93c5fd", color: 0x2563eb },
  { id: 2, name: "Pop Rosa", desc: "Look chamativo com jaqueta rosa.", skin: "#f0b985", hair: "#7c2d12", shirt: "#db2777", pants: "#831843", extra: "#f9a8d4", color: 0xdb2777 },
  { id: 3, name: "Robô Prata", desc: "Personagem metálico futurista.", skin: "#cbd5e1", hair: "#475569", shirt: "#94a3b8", pants: "#334155", extra: "#22d3ee", color: 0x94a3b8, robot: true },
  { id: 4, name: "Ninja Preto", desc: "Visual misterioso para moderadores.", skin: "#d8a271", hair: "#020617", shirt: "#111827", pants: "#020617", extra: "#ef4444", color: 0x111827 },
  { id: 5, name: "Neon Roxo", desc: "Estilo balada com brilho neon.", skin: "#e7b98f", hair: "#581c87", shirt: "#7c3aed", pants: "#312e81", extra: "#67e8f9", color: 0x7c3aed },
];

const rooms = [
  { id: 1, name: "Sala Moderna", desc: "Sofá, mesa, plantas e janela grande.", floor: 0x60758f, wall: 0x1e293b, sofa: 0x0f766e, poster: 0xf59e0b, cssFloor: "#60758f", cssWall: "#1e293b", cssSofa: "#0f766e", cssPoster: "#f59e0b" },
  { id: 2, name: "Quarto Gamer", desc: "PC gamer, neon e decoração roxa.", floor: 0x312e81, wall: 0x1e1b4b, sofa: 0x4f46e5, poster: 0x22d3ee, cssFloor: "#312e81", cssWall: "#1e1b4b", cssSofa: "#4f46e5", cssPoster: "#22d3ee" },
  { id: 3, name: "Praça Social", desc: "Área aberta com bancos e plantas.", floor: 0x15803d, wall: 0x14532d, sofa: 0x78350f, poster: 0x86efac, cssFloor: "#15803d", cssWall: "#14532d", cssSofa: "#78350f", cssPoster: "#86efac" },
  { id: 4, name: "Balada Neon", desc: "Pista escura, luzes e palco neon.", floor: 0x581c87, wall: 0x0f172a, sofa: 0xbe185d, poster: 0xa78bfa, cssFloor: "#581c87", cssWall: "#0f172a", cssSofa: "#be185d", cssPoster: "#a78bfa" },
  { id: 5, name: "Café Lounge", desc: "Mesas, balcão e clima aconchegante.", floor: 0x92400e, wall: 0x451a03, sofa: 0xb45309, poster: 0xfbbf24, cssFloor: "#92400e", cssWall: "#451a03", cssSofa: "#b45309", cssPoster: "#fbbf24" },
];


const roomShapes = [
  { id: 'quadrado', name: 'Quadrado', desc: 'Quarto clássico 14x14', w: 14, d: 14, css: 'shape-square' },
  { id: 'largo', name: 'Largo', desc: 'Sala horizontal ampla', w: 17, d: 11, css: 'shape-wide' },
  { id: 'comprido', name: 'Comprido', desc: 'Sala profunda', w: 11, d: 17, css: 'shape-long' },
  { id: 'compacto', name: 'Compacto', desc: 'Quarto pequeno social', w: 11, d: 11, css: 'shape-small' },
  { id: 'salao', name: 'Salão', desc: 'Espaço grande para evento', w: 18, d: 16, css: 'shape-hall' },
];
let selectedRoomShape = roomShapes[0];
let currentRoomData = null;
let roomBounds = { minX: -7, maxX: 7, minZ: -7, maxZ: 7 };
let roomSpawnPoint = { x: -4.8, z: -5.1, rot: 0 };

let currentUser = null;
let selectedCharacter = characters[0];
let selectedRoom = rooms[0];
let player = null;
let scene, camera, renderer, raycaster, mouse;
let animationStarted = false;
let moveTarget = null;
let speechBubble = null;
let speechTimeout = null;
let walkClock = 0;
let isWalking = false;
let cameraYaw = Math.PI / 4;
let cameraPitch = 0.62;
let cameraDistance = 13;
let isRightDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
const keys = {};

const mobiCatalog = [
  { id: 'sofa', name: 'Sofá', icon: '🛋️', desc: 'Sofá pixel para sala.', color: 0x0f766e },
  { id: 'mesa', name: 'Mesa', icon: '▣', desc: 'Mesa de centro.', color: 0x9a5a20 },
  { id: 'balcao', name: 'Balcão', icon: '▤', desc: 'Balcão/estante.', color: 0x78350f },
  { id: 'planta', name: 'Planta', icon: '🌿', desc: 'Planta decorativa.', color: 0x22c55e },
  { id: 'janela', name: 'Janela', icon: '▦', desc: 'Janela de parede recolhível.', color: 0x7dd3fc, wallOnly: true },
];
let inventory = [];
let placedMobis = [];
let previewMobi = null;
let previewType = null;
let selectedPlacedMobi = null;
let floorMesh = null;
let roomObjects = [];
let mobiMoveMode = false;
let inventoryPage = 0;
const inventoryPageSize = 4;
let lastClickTime = 0;


function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function getLoginFields() {
  return {
    email: document.getElementById('loginEmail').value.trim().toLowerCase(),
    pass: document.getElementById('loginPass').value.trim()
  };
}

function clearAuthFields() {
  ['loginEmail', 'loginPass', 'registerName', 'registerEmail', 'registerPass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function openRegisterScreen() {
  clearAuthFields();
  showScreen('registerScreen');
}

function backToLogin() {
  clearAuthFields();
  showScreen('loginScreen');
}

async function registerAccount() {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim().toLowerCase();
  const pass = document.getElementById('registerPass').value.trim();
  if (!name || !email || !pass) return alert('Preencha nome do jogador, e-mail e senha.');
  if (pass.length < 6) return alert('A senha precisa ter pelo menos 6 caracteres.');

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email,
      name,
      createdAt: serverTimestamp(),
      profileComplete: false,
      inventory: null
    }, { merge: true });
    await sendEmailVerification(cred.user);
    await signOut(auth);
    clearAuthFields();
    showScreen('loginScreen');
    alert('Conta criada! Enviamos um link de confirmação para seu e-mail. Confirme antes de entrar.');
  } catch (err) {
    alert('Erro ao criar conta: ' + friendlyFirebaseError(err));
  }
}

async function login() {
  const { email, pass } = getLoginFields();
  if (!email || !pass) return alert('Digite e-mail e senha.');

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await cred.user.reload();
    if (!cred.user.emailVerified) {
      await sendEmailVerification(cred.user).catch(() => {});
      await signOut(auth);
      clearAuthFields();
      return alert('Seu e-mail ainda não foi confirmado. Enviamos outro link de confirmação.');
    }

    currentUser = {
      uid: cred.user.uid,
      login: cred.user.uid,
      email: cred.user.email,
      isAdmin: false
    };
    await loadOnlineUserData();
    startRoomsListener();
    clearAuthFields();
    showScreen('setupScreen');
  } catch (err) {
    alert('Erro ao entrar: ' + friendlyFirebaseError(err));
  }
}

function friendlyFirebaseError(err) {
  const code = err && err.code ? err.code : '';
  const map = {
    'auth/email-already-in-use': 'esse e-mail já está cadastrado.',
    'auth/invalid-email': 'e-mail inválido.',
    'auth/weak-password': 'senha fraca. Use pelo menos 6 caracteres.',
    'auth/invalid-credential': 'e-mail ou senha incorretos.',
    'auth/user-not-found': 'conta não encontrada.',
    'auth/wrong-password': 'senha incorreta.',
    'permission-denied': 'permissão negada no Firestore. Confira as regras do banco.'
  };
  return map[code] || (err && err.message ? err.message : 'erro desconhecido.');
}

async function loadOnlineUserData() {
  const snap = await getDoc(doc(db, 'users', currentUser.uid));
  const data = snap.exists() ? snap.data() : {};
  const savedName = data.name || auth.currentUser.displayName || '';
  const nameInput = document.getElementById('playerName');
  if (nameInput) nameInput.value = savedName;
  if (data.profile) {
    if (nameInput) nameInput.value = data.profile.name || savedName;
    const ageInput = document.getElementById('playerAge');
    const bioInput = document.getElementById('playerBio');
    if (ageInput) ageInput.value = data.profile.age || '';
    if (bioInput) bioInput.value = data.profile.bio || '';
    selectedCharacter = characters.find(c => c.id === data.profile.characterId) || selectedCharacter;
    buildSelectionGrids();
  }
  if (Array.isArray(data.inventory)) {
    localStorage.setItem(getUserInventoryKey(), JSON.stringify(data.inventory));
  }
}

function startRoomsListener() {
  if (unsubscribeRooms) unsubscribeRooms();
  unsubscribeRooms = onSnapshot(collection(db, 'rooms'), snap => {
    onlineRooms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    localStorage.setItem('mw_rooms_cache', JSON.stringify(onlineRooms));
    renderRoomsModal();
  }, err => console.warn('Erro ao ouvir quartos:', err));
}

function pixelPersonHTML(c) {
  return `
    <div class="pixel-person" style="--skin:${c.skin};--hair:${c.hair};--shirt:${c.shirt};--pants:${c.pants};--extra:${c.extra};">
      <div class="pixel-hair"></div><div class="pixel-head"></div>
      <div class="pixel-eye-l"></div><div class="pixel-eye-r"></div>
      <div class="pixel-extra"></div><div class="pixel-body"></div>
      <div class="pixel-arm-l"></div><div class="pixel-arm-r"></div>
      <div class="pixel-leg-l"></div><div class="pixel-leg-r"></div>
    </div>`;
}

function roomPreviewHTML(r) {
  return `
    <div class="room-preview clean-room" style="--wall:${r.cssWall};--floor:${r.cssFloor};--sofa:${r.cssSofa};--poster:${r.cssPoster};">
      <div class="door"></div><div class="window"></div><div class="floor"></div>
    </div>`;
}

function buildSelectionGrids() {
  const charGrid = document.getElementById('characterGrid');
  const roomGrid = document.getElementById('roomGrid');
  charGrid.innerHTML = '';
  roomGrid.innerHTML = '';

  characters.forEach(c => {
    const el = document.createElement('div');
    el.className = 'card' + (c.id === selectedCharacter.id ? ' selected' : '');
    el.innerHTML = `<div class="avatar-preview">${pixelPersonHTML(c)}</div><div class="card-title">${c.name}</div><div class="card-desc">${c.desc}</div>`;
    el.onclick = () => { selectedCharacter = c; buildSelectionGrids(); };
    charGrid.appendChild(el);
  });

  rooms.forEach(r => {
    const el = document.createElement('div');
    el.className = 'card' + (r.id === selectedRoom.id ? ' selected' : '');
    el.innerHTML = `${roomPreviewHTML(r)}<div class="card-title">${r.name}</div><div class="card-desc">${r.desc}</div>`;
    el.onclick = () => { selectedRoom = r; buildSelectionGrids(); };
    roomGrid.appendChild(el);
  });
}


function getStoredRooms() {
  return onlineRooms.length ? onlineRooms : JSON.parse(localStorage.getItem('mw_rooms_cache') || '[]');
}

function saveStoredRooms(list) {
  onlineRooms = list;
  localStorage.setItem('mw_rooms_cache', JSON.stringify(list));
  if (!currentUser || !currentUser.uid) return;
  list.forEach(room => {
    if (room.owner === (currentUser.uid || currentUser.login)) {
      setDoc(doc(db, 'rooms', room.id), room, { merge: true }).catch(err => console.warn('Erro ao salvar quarto:', err));
    }
  });
}

function getUserInventoryKey() {
  return `mw_inventory_${currentUser.login}`;
}

function saveInventory() {
  if (!currentUser || !inventory.length) return;
  const packed = inventory.map(i => ({ id: i.id, qty: i.qty }));
  localStorage.setItem(getUserInventoryKey(), JSON.stringify(packed));
  if (currentUser.uid) {
    setDoc(doc(db, 'users', currentUser.uid), { inventory: packed, updatedAt: serverTimestamp() }, { merge: true })
      .catch(err => console.warn('Erro ao salvar inventário:', err));
  }
}

function loadInventoryForUser(isFirstRoom) {
  const saved = JSON.parse(localStorage.getItem(getUserInventoryKey()) || 'null');
  if (saved) {
    inventory = mobiCatalog.map(m => ({ ...m, qty: (saved.find(x => x.id === m.id) || {}).qty || 0 }));
  } else {
    inventory = mobiCatalog.map(m => ({ ...m, qty: (m.id === 'janela' ? 0 : (isFirstRoom ? 1 : 0)) }));
    saveInventory();
  }
}

function createRoomRecord({ name, pass = '', baseRoom = selectedRoom, shape = selectedRoomShape, isFirst = false }) {
  const all = getStoredRooms();
  const record = {
    id: `room_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    owner: currentUser.uid || currentUser.login,
    ownerEmail: currentUser.email || '',
    ownerName: currentUser.profile ? currentUser.profile.name : (auth.currentUser?.displayName || currentUser.email || currentUser.login),
    name,
    pass,
    baseRoomId: baseRoom.id,
    shapeId: shape.id,
    createdAt: Date.now(),
    mobis: [ { type: 'janela', x: Math.min((shape.w / 2) - 2.2, 3.8), y: 0, z: -(shape.d / 2) + 0.18, rot: 0, wallMobi: true } ],
    isFirst
  };
  all.push(record);
  saveStoredRooms(all);
  return record;
}

function getRoomTheme(record) {
  return rooms.find(r => r.id === record.baseRoomId) || selectedRoom || rooms[0];
}

function getRoomShape(record) {
  return roomShapes.find(r => r.id === record.shapeId) || roomShapes[0];
}

function ensureInitialRoom(roomName, roomPass) {
  const all = getStoredRooms();
  const mine = all.filter(r => r.owner === (currentUser.uid || currentUser.login));
  if (mine.length) return mine[0];
  return createRoomRecord({ name: roomName, pass: roomPass, baseRoom: selectedRoom, shape: selectedRoomShape, isFirst: true });
}

function isCurrentRoomOwner() {
  return !!(currentUser && currentRoomData && currentRoomData.owner === (currentUser.uid || currentUser.login));
}

function warnNotRoomOwner() {
  alert('Você só pode colocar, mover ou recolher mobis nos seus próprios quartos.');
}

function saveCurrentRoomMobis() {
  if (!currentRoomData || !isCurrentRoomOwner()) return;
  const all = getStoredRooms();
  const idx = all.findIndex(r => r.id === currentRoomData.id);
  if (idx < 0) return;
  if (applyingRemoteMobis) return;
  all[idx].mobis = packLocalMobis();
  currentRoomData.mobis = all[idx].mobis;
  lastLocalMobisSignature = mobisSignature(all[idx].mobis);
  saveStoredRooms(all);
}

function clearSceneForRoom() {
  if (!scene) return;
  while (scene.children.length) scene.remove(scene.children[0]);
  placedMobis = [];
  previewMobi = null;
  previewType = null;
  selectedPlacedMobi = null;
  mobiMoveMode = false;
  speechBubble = null;
}

function getCurrentRoomPlayersCollection() {
  if (!currentRoomData || !currentRoomData.id) return null;
  return collection(db, 'rooms', currentRoomData.id, 'players');
}

async function removeMyPresence() {
  if (!currentUser || !currentUser.uid || !currentRoomData || !currentRoomData.id) return;
  try {
    await setDoc(doc(db, 'rooms', currentRoomData.id, 'players', currentUser.uid), {
      online: false,
      lastSeenMs: Date.now(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    await deleteDoc(doc(db, 'rooms', currentRoomData.id, 'players', currentUser.uid));
  } catch (err) {
    console.warn('Não foi possível remover presença:', err);
  }
}

function stopRoomRealtime(removePresence = true) {
  if (unsubscribeRoomPlayers) {
    unsubscribeRoomPlayers();
    unsubscribeRoomPlayers = null;
  }
  if (unsubscribeCurrentRoomDoc) {
    unsubscribeCurrentRoomDoc();
    unsubscribeCurrentRoomDoc = null;
  }
  if (unsubscribeTradeRequests) {
    unsubscribeTradeRequests();
    unsubscribeTradeRequests = null;
  }
  if (presenceHeartbeatTimer) {
    clearInterval(presenceHeartbeatTimer);
    presenceHeartbeatTimer = null;
  }
  remotePlayers.forEach(r => {
    if (r.group && scene) scene.remove(r.group);
    if (r.bubble) r.bubble.remove();
  });
  remotePlayers.clear();
  if (removePresence) removeMyPresence();
}

function packLocalMobis() {
  return placedMobis.map(m => ({
    type: m.userData.mobiType,
    x: Number(m.position.x.toFixed(3)),
    y: Number((m.position.y || 0).toFixed(3)),
    z: Number(m.position.z.toFixed(3)),
    rot: Number((m.rotation.y || 0).toFixed(3)),
    wallMobi: !!m.userData.wallMobi
  }));
}

function mobisSignature(list) {
  return JSON.stringify((list || []).map(m => ({
    type: m.type,
    x: Number((m.x || 0).toFixed ? m.x.toFixed(3) : Number(m.x || 0).toFixed(3)),
    y: Number((m.y || 0).toFixed ? m.y.toFixed(3) : Number(m.y || 0).toFixed(3)),
    z: Number((m.z || 0).toFixed ? m.z.toFixed(3) : Number(m.z || 0).toFixed(3)),
    rot: Number((m.rot || 0).toFixed ? m.rot.toFixed(3) : Number(m.rot || 0).toFixed(3)),
    wallMobi: !!m.wallMobi
  })));
}

function rebuildPlacedMobisFromData(mobis) {
  if (!scene || previewMobi || mobiMoveMode) return;
  applyingRemoteMobis = true;
  placedMobis.forEach(m => scene.remove(m));
  placedMobis = [];
  (mobis || []).forEach(m => {
    const mobi = makeMobi(m.type, { ghost: false });
    mobi.position.set(m.x || 0, m.y || 0, m.z || 0);
    mobi.rotation.y = m.rot || 0;
    mobi.userData.wallMobi = !!m.wallMobi || m.type === 'janela';
    scene.add(mobi);
    placedMobis.push(mobi);
    clampMobiInsideRoom(mobi);
  });
  lastLocalMobisSignature = mobisSignature(packLocalMobis());
  applyingRemoteMobis = false;
}

function startRoomRealtime() {
  if (!currentUser || !currentUser.uid || !currentRoomData || !currentRoomData.id) return;
  stopRoomRealtime(false);

  unsubscribeCurrentRoomDoc = onSnapshot(doc(db, 'rooms', currentRoomData.id), snap => {
    if (!snap.exists()) return;
    const data = { id: snap.id, ...snap.data() };
    currentRoomData = { ...currentRoomData, ...data };
    const remoteSig = mobisSignature(data.mobis || []);
    const localSig = mobisSignature(packLocalMobis());
    if (remoteSig && remoteSig !== localSig && !previewMobi && !mobiMoveMode) {
      rebuildPlacedMobisFromData(data.mobis || []);
    }
  }, err => console.warn('Erro ao ouvir mobis do quarto:', err));

  unsubscribeRoomPlayers = onSnapshot(getCurrentRoomPlayersCollection(), snap => {
    const seen = new Set();
    snap.forEach(docSnap => {
      const uid = docSnap.id;
      if (uid === currentUser.uid) return;
      seen.add(uid);
      const data = docSnap.data();
      if (isPresenceStale(data)) {
        removeRemotePlayer(uid);
        return;
      }
      updateRemotePlayer(uid, data);
    });
    remotePlayers.forEach((_, uid) => {
      if (!seen.has(uid)) removeRemotePlayer(uid);
    });
  }, err => console.warn('Erro ao ouvir jogadores do quarto:', err));

  syncMyPresence(true);
  startTradeRequestListener();
  startPresenceHeartbeat();
}

function makeRemotePlayerGroup(profile) {
  const c = characters.find(ch => ch.id === Number(profile.characterId)) || characters[0];
  const group = new THREE.Group();
  const skin = Number(c.skin.replace('#', '0x'));
  const hairColor = Number(c.hair.replace('#', '0x'));
  const shirt = Number(c.shirt.replace('#', '0x'));
  const pants = Number(c.pants.replace('#', '0x'));
  const extra = Number(c.extra.replace('#', '0x'));
  const hair = block(0.78, 0.35, 0.55, hairColor, 0, 2.28, 0, group);
  const head = block(0.62, 0.58, 0.52, skin, 0, 1.95, 0, group);
  const eyeL = block(0.1, 0.1, 0.04, 0x111111, -0.16, 2.02, 0.29, group);
  const eyeR = block(0.1, 0.1, 0.04, 0x111111, 0.16, 2.02, 0.29, group);
  const body = block(0.72, 0.86, 0.5, shirt, 0, 1.25, 0, group);
  const armL = block(0.24, 0.74, 0.34, skin, -0.58, 1.25, 0, group);
  const armR = block(0.24, 0.74, 0.34, skin, 0.58, 1.25, 0, group);
  const legL = block(0.28, 0.72, 0.38, pants, -0.2, 0.42, 0, group);
  const legR = block(0.28, 0.72, 0.38, pants, 0.2, 0.42, 0, group);
  const belt = block(0.78, 0.12, 0.56, extra, 0, 1.58, 0.02, group);
  group.userData = {
    type: 'remotePlayer',
    profile: { ...profile, character: c },
    parts: { hair, head, eyeL, eyeR, body, armL, armR, legL, legR, belt },
    walkClock: 0,
    lastX: null,
    lastZ: null
  };
  return group;
}

function createRemoteBubble() {
  const el = document.createElement('div');
  el.className = 'speech-bubble remote-speech-bubble hidden';
  document.body.appendChild(el);
  return el;
}

function updateRemotePlayer(uid, data) {
  if (!scene || !data || !data.profile) return;
  let rp = remotePlayers.get(uid);
  if (!rp) {
    const group = makeRemotePlayerGroup({ ...data.profile, uid });
    const bubble = createRemoteBubble();
    scene.add(group);
    rp = { group, bubble, lastSpeechId: null };
    remotePlayers.set(uid, rp);
  }
  const g = rp.group;
  const pos = data.position || {};
  const oldX = g.position.x;
  const oldZ = g.position.z;
  g.position.set(Number(pos.x || 0), Number(pos.y || 0), Number(pos.z || 0));
  g.rotation.y = Number(pos.rot || 0);
  g.userData.profile = { ...data.profile, uid, character: characters.find(c => c.id === Number(data.profile.characterId)) || characters[0] };
  animateRemoteWalk(g, oldX !== g.position.x || oldZ !== g.position.z);

  if (data.speech && data.speech.text && data.speech.id !== rp.lastSpeechId) {
    rp.lastSpeechId = data.speech.id;
    rp.bubble.textContent = data.speech.text;
    rp.bubble.classList.remove('hidden');
    clearTimeout(rp.speechTimeout);
    rp.speechTimeout = setTimeout(() => rp.bubble.classList.add('hidden'), 4200);
  }
}

function animateRemoteWalk(group, moving) {
  const p = group.userData.parts;
  if (!p) return;
  if (moving) {
    group.userData.walkClock += 0.7;
    const step = Math.sin(group.userData.walkClock);
    p.armL.rotation.x = step * 0.45;
    p.armR.rotation.x = -step * 0.45;
    p.legL.rotation.x = -step * 0.42;
    p.legR.rotation.x = step * 0.42;
    group.position.y = Math.abs(step) * 0.045;
  } else {
    group.position.y *= 0.72;
    ['armL', 'armR', 'legL', 'legR'].forEach(name => p[name].rotation.x *= 0.72);
  }
}

function removeRemotePlayer(uid) {
  const rp = remotePlayers.get(uid);
  if (!rp) return;
  if (rp.group && scene) scene.remove(rp.group);
  if (rp.bubble) rp.bubble.remove();
  remotePlayers.delete(uid);
}

function updateAllRemoteBubbles() {
  remotePlayers.forEach(rp => {
    if (!rp.bubble || rp.bubble.classList.contains('hidden') || !rp.group || !camera) return;
    const pos = new THREE.Vector3(rp.group.position.x, rp.group.position.y + 2.95, rp.group.position.z);
    pos.project(camera);
    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
    rp.bubble.style.left = `${x}px`;
    rp.bubble.style.top = `${y}px`;
  });
}


function isPresenceStale(data) {
  if (!data) return true;
  if (data.online === false) return true;
  const lastSeen = Number(data.lastSeenMs || 0);
  return !lastSeen || Date.now() - lastSeen > 30000;
}

function startPresenceHeartbeat() {
  if (presenceHeartbeatTimer) clearInterval(presenceHeartbeatTimer);
  presenceHeartbeatTimer = setInterval(() => syncMyPresence(true), 5000);
}

function syncMyPresence(forceOrSpeech = false) {
  if (!currentUser || !currentUser.uid || !currentRoomData || !currentRoomData.id || !player) return;
  const now = Date.now();
  const speechText = typeof forceOrSpeech === 'string' ? forceOrSpeech : '';
  const state = JSON.stringify({
    x: Number(player.position.x.toFixed(2)),
    y: Number(player.position.y.toFixed(2)),
    z: Number(player.position.z.toFixed(2)),
    rot: Number(player.rotation.y.toFixed(2)),
    room: currentRoomData.id,
    speech: speechText
  });
  if (!speechText && forceOrSpeech !== true && state === lastPresenceState && now - lastPresenceSync < 350) return;
  if (!speechText && forceOrSpeech !== true && now - lastPresenceSync < 180) return;
  lastPresenceState = state;
  lastPresenceSync = now;
  const profile = currentUser.profile || {};
  setDoc(doc(db, 'rooms', currentRoomData.id, 'players', currentUser.uid), {
    uid: currentUser.uid,
    email: currentUser.email || '',
    profile: {
      name: profile.name || currentUser.email || 'Jogador',
      age: profile.age || '',
      bio: profile.bio || '',
      characterId: profile.character ? profile.character.id : (profile.characterId || 1)
    },
    position: {
      x: Number(player.position.x.toFixed(3)),
      y: Number(player.position.y.toFixed(3)),
      z: Number(player.position.z.toFixed(3)),
      rot: Number(player.rotation.y.toFixed(3))
    },
    speech: speechText ? { text: speechText, id: `${currentUser.uid}_${Date.now()}` } : null,
    online: true,
    lastSeenMs: Date.now(),
    updatedAt: serverTimestamp()
  }, { merge: true }).catch(err => console.warn('Erro ao sincronizar jogador:', err));
}


function showRoomTransition(text = 'Entrando no quarto...') {
  const el = document.getElementById('roomTransition');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden', 'leaving');
}

function hideRoomTransition() {
  const el = document.getElementById('roomTransition');
  if (!el) return;
  el.classList.add('leaving');
  setTimeout(() => el.classList.add('hidden'), 340);
}

function enterRoom(record) {
  const oldRoom = currentRoomData;
  saveCurrentRoomMobis();
  if (oldRoom && oldRoom.id !== record.id) stopRoomRealtime(true);
  showRoomTransition('Entrando no quarto...');
  currentRoomData = record;
  const theme = getRoomTheme(record);
  selectedRoom = theme;
  hideMobiControls();
  moveTarget = null;
  Object.keys(keys).forEach(k => delete keys[k]);

  setTimeout(() => {
    if (scene) {
      clearSceneForRoom();
      const light = new THREE.DirectionalLight(0xffffff, 1.1);
      light.position.set(5, 10, 5);
      light.castShadow = true;
      scene.add(light);
      scene.add(new THREE.AmbientLight(0xffffff, 0.72));
      createRoom(theme);
      createPlayer();
      updateCameraPosition();
      startRoomRealtime();
    }
    renderRoomsModal();
    addMessage('Sistema', `${currentUser.profile.name} entrou no quarto ${record.name}.`);
    setTimeout(hideRoomTransition, 180);
  }, 260);
}

function openRoomsModal(tab = 'myRooms') {
  document.getElementById('roomsModal').classList.remove('hidden');
  switchRoomsTab(tab);
  renderRoomsModal();
}

function closeRoomsModal() {
  document.getElementById('roomsModal').classList.add('hidden');
}

function switchRoomsTab(tab) {
  document.querySelectorAll('.rooms-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.rooms-tab-content').forEach(c => c.classList.remove('active'));
  const map = { myRooms: 'myRoomsTab', allRooms: 'allRoomsTab', createRoom: 'createRoomTab' };
  document.getElementById(map[tab]).classList.add('active');
}

function roomListItem(record, mine = false) {
  const shape = getRoomShape(record);
  const theme = getRoomTheme(record);
  const lock = record.pass ? ' 🔒' : '';
  return `<div class="room-list-item"><div><b>${escapeHtml(record.name)}${lock}</b><small>Dono: ${escapeHtml(record.ownerName || record.owner)} • ${shape.name} • ${theme.name}</small></div><button data-room-id="${record.id}" type="button">Ir ao quarto</button></div>`;
}

function renderRoomsModal() {
  const all = getStoredRooms();
  const mine = all.filter(r => r.owner === (currentUser.uid || currentUser.login));
  const myWrap = document.getElementById('myRoomsTab');
  const allWrap = document.getElementById('allRoomsTab');
  if (myWrap) myWrap.innerHTML = mine.length ? mine.map(r => roomListItem(r, true)).join('') : '<p class="small">Você ainda não criou quartos.</p>';
  if (allWrap) allWrap.innerHTML = all.length ? all.map(r => roomListItem(r)).join('') : '<p class="small">Nenhum quarto criado ainda.</p>';
  document.querySelectorAll('[data-room-id]').forEach(btn => {
    btn.onclick = () => {
      const roomsList = getStoredRooms();
      const room = roomsList.find(r => r.id === btn.dataset.roomId);
      if (!room) return;
      if (room.pass && room.owner !== (currentUser.uid || currentUser.login)) {
        const typed = prompt('Esse quarto tem senha. Digite a senha:');
        if (typed !== room.pass) return alert('Senha incorreta.');
      }
      closeRoomsModal();
      enterRoom(room);
    };
  });
  renderShapeGrid();
}

function renderShapeGrid() {
  const grid = document.getElementById('roomShapeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  roomShapes.forEach(shape => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'shape-card ' + (selectedRoomShape.id === shape.id ? 'selected' : '');
    btn.innerHTML = `<span class="shape-preview ${shape.css}"></span><b>${shape.name}</b><small>${shape.desc}</small>`;
    btn.onclick = () => { selectedRoomShape = shape; renderShapeGrid(); };
    grid.appendChild(btn);
  });
}

function createNewRoomFromModal() {
  const name = document.getElementById('newRoomName').value.trim();
  const pass = document.getElementById('newRoomPassword').value.trim();
  if (!name) return alert('Digite o nome do quarto.');
  const allMine = getStoredRooms().filter(r => r.owner === (currentUser.uid || currentUser.login));
  const record = createRoomRecord({ name, pass, baseRoom: selectedRoom, shape: selectedRoomShape, isFirst: allMine.length === 0 });
  document.getElementById('newRoomName').value = '';
  document.getElementById('newRoomPassword').value = '';
  renderRoomsModal();
  switchRoomsTab('myRooms');
  enterRoom(record);
  closeRoomsModal();
}

async function startGame() {
  const name = document.getElementById('playerName').value.trim();
  const age = document.getElementById('playerAge').value.trim();
  const bio = document.getElementById('playerBio').value.trim();
  const roomName = document.getElementById('roomName').value.trim() || selectedRoom.name;
  const roomPass = document.getElementById('roomPassword').value.trim();

  if (!name || !age || !bio) return alert('Preencha nome, idade e bio.');

  currentUser.profile = { name, age, bio, character: selectedCharacter, room: selectedRoom, roomName, roomPass };
  if (currentUser.uid) {
    await setDoc(doc(db, 'users', currentUser.uid), {
      profile: { name, age, bio, characterId: selectedCharacter.id },
      name,
      profileComplete: true,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(err => console.warn('Erro ao salvar perfil:', err));
  }
  currentRoomData = ensureInitialRoom(roomName, roomPass);
  loadInventoryForUser(currentRoomData.isFirst);

  document.getElementById('setupScreen').classList.remove('active');
  document.getElementById('chatBox').classList.remove('hidden');
  document.getElementById('inventoryToggle').classList.remove('hidden');
  document.getElementById('roomsToggle').classList.remove('hidden');
  document.getElementById('inventoryPanel').classList.add('hidden');
  Object.keys(keys).forEach(k => delete keys[k]);
  moveTarget = null;

  init3D();
  startRoomRealtime();
  addMessage('Sistema', `${name} entrou no quarto ${currentRoomData.name}.`);
}

function init3D() {
  const canvas = document.getElementById('game');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8bd3ff);

  camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(7, 7.5, 9);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;

  const light = new THREE.DirectionalLight(0xffffff, 1.1);
  light.position.set(5, 10, 5);
  light.castShadow = true;
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.72));

  createRoom(getRoomTheme(currentRoomData));
  createPlayer();
  renderInventory();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  window.addEventListener('resize', onResize);
  setTimeout(() => {
    window.addEventListener('click', onClick);
    window.addEventListener('dblclick', onDoubleClick);
  }, 0);
  setupCameraControls(canvas);

  if (!animationStarted) {
    animationStarted = true;
    animate();
  }
}

function mat(color, roughness = 0.8) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function block(w, h, d, color, x, y, z, parent = scene) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createRoom(room) {
  const shape = getRoomShape(currentRoomData || { shapeId: 'quadrado' });
  const w = shape.w;
  const d = shape.d;
  const halfW = w / 2;
  const halfD = d / 2;
  roomBounds = { minX: -halfW, maxX: halfW, minZ: -halfD, maxZ: halfD };

  const floor = block(w, 0.25, d, room.floor, 0, -0.13, 0);
  floor.userData = { type: 'floor' };
  floorMesh = floor;
  block(w, 4.2, 0.28, room.wall, 0, 2, -halfD);
  block(0.28, 4.2, d, room.wall, -halfW, 2, 0);

  // Piso limpo, sem linhas/grade para os quartos criados.

  // Porta fixa: não é mobi e não pode ser recolhida ou ajustada.
  const doorX = Math.max(roomBounds.minX + 1.6, -5.2);
  const doorZ = roomBounds.minZ + 0.22;
  roomSpawnPoint = {
    x: Math.max(roomBounds.minX + 0.8, Math.min(roomBounds.maxX - 0.8, doorX)),
    z: Math.max(roomBounds.minZ + 1.35, Math.min(roomBounds.maxZ - 0.8, doorZ + 1.25)),
    rot: Math.PI
  };
  const door = block(1.35, 2.35, 0.12, 0x7c3f16, doorX, 1.05, doorZ);
  door.userData = { type: 'door' };
  block(0.18, 2.55, 0.14, 0x3a220d, doorX - 0.75, 1.18, doorZ + 0.08);
  block(0.18, 2.55, 0.14, 0x3a220d, doorX + 0.75, 1.18, doorZ + 0.08);
  block(1.55, 0.18, 0.14, 0x3a220d, doorX, 2.43, doorZ + 0.08);
  block(0.12, 0.12, 0.14, 0xfbbf24, doorX + 0.48, 1.22, doorZ + 0.15);

  // Carrega mobis salvos do quarto. Todo quarto nasce com uma janela como mobi.
  const savedMobis = (currentRoomData && currentRoomData.mobis && currentRoomData.mobis.length)
    ? currentRoomData.mobis
    : [{ type: 'janela', x: Math.min(roomBounds.maxX - 2.2, 3.8), y: 0, z: roomBounds.minZ + 0.18, rot: 0, wallMobi: true }];

  savedMobis.forEach(m => {
    const mobi = makeMobi(m.type, { ghost: false });
    mobi.position.set(m.x, m.y || 0, m.z);
    mobi.rotation.y = m.rot || 0;
    mobi.userData.wallMobi = !!m.wallMobi || m.type === 'janela';
    scene.add(mobi);
    placedMobis.push(mobi);
    clampMobiInsideRoom(mobi);
  });
}


function createDecorations(room) {
  // Sofá pixelado
  block(3.2, 0.75, 0.9, room.sofa, -3.2, 0.42, -3.2);
  block(3.2, 1.25, 0.35, room.sofa, -3.2, 0.85, -3.65);
  block(0.38, 0.95, 0.95, room.sofa, -5.0, 0.62, -3.2);
  block(0.38, 0.95, 0.95, room.sofa, -1.4, 0.62, -3.2);

  // Mesa central
  block(2.0, 0.28, 1.1, 0x9a5a20, 1.7, 0.52, -1.7);
  block(0.25, 0.65, 0.25, 0x5c320e, 0.95, 0.2, -2.05);
  block(0.25, 0.65, 0.25, 0x5c320e, 2.45, 0.2, -2.05);
  block(0.25, 0.65, 0.25, 0x5c320e, 0.95, 0.2, -1.35);
  block(0.25, 0.65, 0.25, 0x5c320e, 2.45, 0.2, -1.35);

  // Planta em vaso
  block(0.55, 0.45, 0.55, 0x7c2d12, 4.8, 0.25, -4.8);
  block(0.25, 0.85, 0.25, 0x166534, 4.8, 0.85, -4.8);
  block(0.85, 0.28, 0.35, 0x22c55e, 4.8, 1.22, -4.8);
  block(0.35, 0.28, 0.85, 0x22c55e, 4.8, 1.37, -4.8);

  // Balcão/estante
  block(2.6, 1.2, 0.55, 0x78350f, 4.3, 0.62, 2.6);
  block(2.6, 0.15, 0.65, 0xfbbf24, 4.3, 1.32, 2.6);

  // Detalhes por tema.
  if (room.id === 2 || room.id === 4) {
    block(2.5, 0.12, 0.12, 0x22d3ee, 0, 3.35, -6.65);
    block(0.12, 1.5, 0.12, 0xec4899, -6.65, 2.2, 2.4);
    block(1.2, 0.8, 0.08, 0x111827, 4.3, 1.95, -6.7);
    block(0.9, 0.55, 0.1, 0x38bdf8, 4.3, 1.95, -6.6);
  }
  if (room.id === 3) {
    block(2.4, 0.25, 0.8, 0x78350f, 0, 0.45, 3.8);
    block(0.25, 0.9, 0.25, 0x78350f, -0.95, 0.35, 3.8);
    block(0.25, 0.9, 0.25, 0x78350f, 0.95, 0.35, 3.8);
  }
  if (room.id === 5) {
    block(1.2, 0.18, 1.2, 0x451a03, -1.2, 0.62, 3.2);
    block(0.35, 0.85, 0.35, 0x451a03, -1.2, 0.25, 3.2);
    block(0.55, 0.18, 0.55, 0xf59e0b, -1.2, 0.83, 3.2);
  }
}

function makeMobi(type, opts = {}) {
  const group = new THREE.Group();
  const ghost = opts.ghost === true;
  const alpha = ghost ? 0.55 : 1;

  function add(w, h, d, color, x, y, z) {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.8, transparent: ghost, opacity: alpha });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = !ghost;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  if (type === 'sofa') {
    add(3.2, 0.75, 0.9, 0x0f766e, 0, 0.42, 0);
    add(3.2, 1.25, 0.35, 0x0b5f59, 0, 0.85, -0.45);
    add(0.38, 0.95, 0.95, 0x0b5f59, -1.8, 0.62, 0);
    add(0.38, 0.95, 0.95, 0x0b5f59, 1.8, 0.62, 0);
  }
  if (type === 'mesa') {
    add(2.0, 0.28, 1.1, 0x9a5a20, 0, 0.52, 0);
    add(0.25, 0.65, 0.25, 0x5c320e, -0.75, 0.2, -0.35);
    add(0.25, 0.65, 0.25, 0x5c320e, 0.75, 0.2, -0.35);
    add(0.25, 0.65, 0.25, 0x5c320e, -0.75, 0.2, 0.35);
    add(0.25, 0.65, 0.25, 0x5c320e, 0.75, 0.2, 0.35);
  }
  if (type === 'balcao') {
    add(2.6, 1.2, 0.55, 0x78350f, 0, 0.62, 0);
    add(2.6, 0.15, 0.65, 0xfbbf24, 0, 1.32, 0);
    add(2.2, 0.08, 0.06, 0x451a03, 0, 0.95, 0.31);
  }
  if (type === 'planta') {
    add(0.55, 0.45, 0.55, 0x7c2d12, 0, 0.25, 0);
    add(0.25, 0.85, 0.25, 0x166534, 0, 0.85, 0);
    add(0.85, 0.28, 0.35, 0x22c55e, 0, 1.22, 0);
    add(0.35, 0.28, 0.85, 0x22c55e, 0, 1.37, 0);
    add(0.65, 0.22, 0.45, 0x4ade80, 0.25, 1.1, 0.15);
  }

  if (type === 'janela') {
    add(2.45, 1.58, 0.1, 0xfef3c7, 0, 2.55, 0);
    add(2.12, 1.25, 0.12, 0x7dd3fc, 0, 2.55, 0.06);
    add(0.1, 1.25, 0.14, 0xffffff, 0, 2.55, 0.13);
    add(2.0, 0.08, 0.14, 0xffffff, 0, 2.55, 0.14);
    add(0.22, 1.68, 0.13, 0xd97706, -1.24, 2.55, 0.09);
    add(0.22, 1.68, 0.13, 0xd97706, 1.24, 2.55, 0.09);
  }

  group.userData = { type: ghost ? 'mobiPreview' : 'mobi', mobiType: type, wallMobi: type === 'janela' };
  group.position.set(0, 0, 2);
  return group;
}

function mobiPreviewHTML(type) {
  if (type === 'sofa') return '<div class="mini-mobi sofa"><i></i><b></b><em></em></div>';
  if (type === 'mesa') return '<div class="mini-mobi mesa"><i></i><b></b><em></em><span></span></div>';
  if (type === 'balcao') return '<div class="mini-mobi balcao"><i></i><b></b></div>';
  if (type === 'planta') return '<div class="mini-mobi planta"><i></i><b></b><em></em></div>';
  if (type === 'janela') return '<div class="mini-mobi janela"><i></i><b></b><em></em></div>';
  return '<div class="mini-mobi"></div>';
}

function renderInventory() {
  const wrap = document.getElementById('inventoryItems');
  if (!wrap) return;
  const visibleItems = inventory.filter(item => item.qty > 0);
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / inventoryPageSize));
  inventoryPage = Math.max(0, Math.min(inventoryPage, totalPages - 1));
  const pageItems = visibleItems.slice(inventoryPage * inventoryPageSize, inventoryPage * inventoryPageSize + inventoryPageSize);

  wrap.innerHTML = '';
  pageItems.forEach(item => {
    const div = document.createElement('button');
    div.type = 'button';
    div.className = 'inventory-item';
    div.innerHTML = `<span class="mobi-icon">${mobiPreviewHTML(item.id)}</span><b>${item.name}</b><small>${item.desc}</small><em>x${item.qty}</em>`;
    div.onclick = () => startMobiPreview(item.id);
    wrap.appendChild(div);
  });

  while (wrap.children.length < inventoryPageSize) {
    const empty = document.createElement('div');
    empty.className = 'inventory-empty';
    empty.textContent = 'Vazio';
    wrap.appendChild(empty);
  }

  const label = document.getElementById('inventoryPageLabel');
  if (label) label.textContent = `${inventoryPage + 1}/${totalPages}`;
  const prev = document.getElementById('invPrevBtn');
  const next = document.getElementById('invNextBtn');
  if (prev) prev.disabled = inventoryPage <= 0;
  if (next) next.disabled = inventoryPage >= totalPages - 1;
}

function startMobiPreview(type) {
  if (!isCurrentRoomOwner()) return warnNotRoomOwner();
  clearMobiSelection(false);
  if (previewMobi) scene.remove(previewMobi);
  previewType = type;
  previewMobi = makeMobi(type, { ghost: true });
  if (type === 'janela') previewMobi.position.set(3.8, 0, -6.82);
  else previewMobi.position.set(player ? player.position.x + 1.6 : 0, 0, player ? player.position.z : 2);
  scene.add(previewMobi);
  showMobiControls('preview');
}

function showMobiControls(mode) {
  const controls = document.getElementById('mobiControls');
  controls.classList.remove('hidden');
  document.getElementById('placeMobiBtn').classList.toggle('hidden', mode !== 'preview');
  document.getElementById('collectMobiBtn').classList.toggle('hidden', mode !== 'placed');
  document.getElementById('cancelMobiBtn').textContent = mode === 'placed' ? 'Fechar' : 'Cancelar';
}

function hideMobiControls() {
  document.getElementById('mobiControls').classList.add('hidden');
}

function placePreviewMobi() {
  if (!isCurrentRoomOwner()) return warnNotRoomOwner();
  if (!previewMobi || !previewType) return;
  const item = inventory.find(i => i.id === previewType);
  if (!item || item.qty <= 0) return;

  const placed = makeMobi(previewType, { ghost: false });
  placed.position.copy(previewMobi.position);
  placed.rotation.copy(previewMobi.rotation);
  placed.userData.type = 'mobi';
  placed.userData.mobiType = previewType;
  placed.userData.wallMobi = previewType === 'janela';
  scene.add(placed);
  placedMobis.push(placed);

  item.qty -= 1;
  saveInventory();
  saveCurrentRoomMobis();
  scene.remove(previewMobi);
  previewMobi = null;
  previewType = null;
  hideMobiControls();
  renderInventory();
}

function rotateActiveMobi() {
  if (!isCurrentRoomOwner()) return warnNotRoomOwner();
  const obj = previewMobi || selectedPlacedMobi;
  if (!obj) return;
  obj.rotation.y += Math.PI / 2;
  clampMobiInsideRoom(obj);
  if (selectedPlacedMobi && !previewMobi) saveCurrentRoomMobis();
}

function collectSelectedMobi() {
  if (!isCurrentRoomOwner()) return warnNotRoomOwner();
  if (!selectedPlacedMobi) return;
  const type = selectedPlacedMobi.userData.mobiType;
  scene.remove(selectedPlacedMobi);
  placedMobis = placedMobis.filter(m => m !== selectedPlacedMobi);
  const item = inventory.find(i => i.id === type);
  if (item) item.qty += 1;
  saveInventory();
  saveCurrentRoomMobis();
  selectedPlacedMobi = null;
  mobiMoveMode = false;
  hideMobiControls();
  renderInventory();
}

function cancelMobiAction() {
  if (previewMobi) {
    scene.remove(previewMobi);
    previewMobi = null;
    previewType = null;
  }
  clearMobiSelection(true);
}

function clearMobiSelection(hide = true) {
  selectedPlacedMobi = null;
  mobiMoveMode = false;
  if (hide) hideMobiControls();
}

function selectPlacedMobi(obj) {
  if (!isCurrentRoomOwner()) return warnNotRoomOwner();
  if (previewMobi) cancelMobiAction();
  selectedPlacedMobi = obj;
  mobiMoveMode = true;
  showMobiControls('placed');
}

function findRootByType(object, type) {
  let obj = object;
  while (obj) {
    if (obj.userData && obj.userData.type === type) return obj;
    obj = obj.parent;
  }
  return null;
}


function getMobiFootprint(obj) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);
  // Dimensão do objeto já considera rotação atual. Usa uma margem mínima para encostar bem na parede sem atravessar.
  return { halfX: Math.max(0.12, size.x / 2), halfZ: Math.max(0.12, size.z / 2) };
}

function clampMobiInsideRoom(obj) {
  if (!obj) return;
  if (obj.userData && obj.userData.wallMobi) {
    const margin = 0.08;
    const wallBackDist = Math.abs(obj.position.z - (roomBounds.minZ + 0.18));
    const wallLeftDist = Math.abs(obj.position.x - (roomBounds.minX + 0.18));
    if (wallLeftDist < wallBackDist) {
      obj.position.x = roomBounds.minX + 0.18;
      obj.position.z = Math.max(roomBounds.minZ + 1.0, Math.min(roomBounds.maxZ - 1.0, obj.position.z));
      obj.rotation.y = Math.PI / 2;
    } else {
      obj.position.z = roomBounds.minZ + 0.18;
      obj.position.x = Math.max(roomBounds.minX + 1.0, Math.min(roomBounds.maxX - 1.0, obj.position.x));
      obj.rotation.y = 0;
    }
    obj.position.y = 0;
    return;
  }

  const fp = getMobiFootprint(obj);
  const margin = 0.02;
  obj.position.x = Math.max(roomBounds.minX + fp.halfX + margin, Math.min(roomBounds.maxX - fp.halfX - margin, obj.position.x));
  obj.position.z = Math.max(roomBounds.minZ + fp.halfZ + margin, Math.min(roomBounds.maxZ - fp.halfZ - margin, obj.position.z));
  obj.position.y = 0;
}

function moveActiveMobiTo(point) {
  const obj = previewMobi || (mobiMoveMode ? selectedPlacedMobi : null);
  if (obj && !isCurrentRoomOwner()) return false;
  if (!obj) return false;

  if (obj.userData && obj.userData.wallMobi) {
    // Janela é mobi de parede: pode ser movida na parede de trás ou lateral.
    const backZ = roomBounds.minZ + 0.18;
    const leftX = roomBounds.minX + 0.18;
    if (Math.abs(point.z - roomBounds.minZ) < Math.abs(point.x - roomBounds.minX)) {
      obj.position.x = point.x;
      obj.position.z = backZ;
      obj.rotation.y = 0;
    } else {
      obj.position.x = leftX;
      obj.position.z = point.z;
      obj.rotation.y = Math.PI / 2;
    }
    clampMobiInsideRoom(obj);
    if (selectedPlacedMobi && !previewMobi) saveCurrentRoomMobis();
    return true;
  }

  obj.position.x = point.x;
  obj.position.z = point.z;
  clampMobiInsideRoom(obj);
  if (selectedPlacedMobi && !previewMobi) saveCurrentRoomMobis();
  return true;
}

function getRoomPointFromMouse() {
  const planes = [
    new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),                    // chão
    new THREE.Plane(new THREE.Vector3(0, 0, 1), -roomBounds.minZ),     // parede de trás
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -roomBounds.minX),     // parede esquerda
  ];
  const points = [];
  for (const plane of planes) {
    const p = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, p)) points.push(p);
  }
  if (!points.length) return null;

  const active = previewMobi || selectedPlacedMobi;
  if (active && active.userData && active.userData.wallMobi) {
    return points.find(p => Math.abs(p.z - roomBounds.minZ) < 0.3 || Math.abs(p.x - roomBounds.minX) < 0.3) || points[0];
  }
  return points.find(p => Math.abs(p.y) < 0.01) || points[0];
}

function setupMobiButtons() {
  document.getElementById('rotateMobiBtn').onclick = rotateActiveMobi;
  document.getElementById('placeMobiBtn').onclick = placePreviewMobi;
  document.getElementById('collectMobiBtn').onclick = collectSelectedMobi;
  document.getElementById('cancelMobiBtn').onclick = cancelMobiAction;
}

function createPlayer() {
  const c = currentUser.profile.character;
  const group = new THREE.Group();

  // Personagem em voxel/pixel art 3D, com peças separadas para animar a caminhada.
  const hair = block(0.78, 0.35, 0.55, Number(c.hair.replace('#', '0x')), 0, 2.28, 0, group);
  const head = block(0.62, 0.58, 0.52, Number(c.skin.replace('#', '0x')), 0, 1.95, 0, group);
  const eyeL = block(0.1, 0.1, 0.04, 0x111111, -0.16, 2.02, 0.29, group);
  const eyeR = block(0.1, 0.1, 0.04, 0x111111, 0.16, 2.02, 0.29, group);
  const body = block(0.72, 0.86, 0.5, Number(c.shirt.replace('#', '0x')), 0, 1.25, 0, group);
  const armL = block(0.24, 0.74, 0.34, Number(c.skin.replace('#', '0x')), -0.58, 1.25, 0, group);
  const armR = block(0.24, 0.74, 0.34, Number(c.skin.replace('#', '0x')), 0.58, 1.25, 0, group);
  const legL = block(0.28, 0.72, 0.38, Number(c.pants.replace('#', '0x')), -0.2, 0.42, 0, group);
  const legR = block(0.28, 0.72, 0.38, Number(c.pants.replace('#', '0x')), 0.2, 0.42, 0, group);
  const belt = block(0.78, 0.12, 0.56, Number(c.extra.replace('#', '0x')), 0, 1.58, 0.02, group);

  group.userData = {
    type: 'player',
    profile: currentUser.profile,
    parts: { hair, head, eyeL, eyeR, body, armL, armR, legL, legR, belt },
    baseY: 0
  };
  const spawn = roomSpawnPoint || { x: 0, z: 0, rot: 0 };
  group.position.set(spawn.x, 0, spawn.z);
  group.rotation.y = spawn.rot || 0;
  scene.add(group);
  player = group;
  createSpeechBubble();
}

function animate(now = performance.now()) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
  lastFrameTime = now;
  if (!player || !renderer || !scene || !camera) return;
  movePlayer(dt);
  animatePlayerWalk(dt);

  updateCameraPosition();

  updateSpeechBubblePosition();
  updateAllRemoteBubbles();
  syncMyPresence(false);
  renderer.render(scene, camera);
}

function movePlayer(dt = 1/60) {
  if (!player) return;
  const speed = 5.4 * dt;
  isWalking = false;

  let dx = 0;
  let dz = 0;
  if (keys['w'] || keys['arrowup']) dz -= speed;
  if (keys['s'] || keys['arrowdown']) dz += speed;
  if (keys['a'] || keys['arrowleft']) dx -= speed;
  if (keys['d'] || keys['arrowright']) dx += speed;

  if (dx || dz) {
    moveTarget = null;
    player.position.x += dx;
    player.position.z += dz;
    faceDirection(dx, dz);
    isWalking = true;
  } else if (moveTarget) {
    const diffX = moveTarget.x - player.position.x;
    const diffZ = moveTarget.z - player.position.z;
    const dist = Math.hypot(diffX, diffZ);

    if (dist < 0.08) {
      player.position.x = moveTarget.x;
      player.position.z = moveTarget.z;
      moveTarget = null;
      isWalking = false;
    } else {
      player.position.x += (diffX / dist) * speed;
      player.position.z += (diffZ / dist) * speed;
      faceDirection(diffX, diffZ);
      isWalking = true;
    }
  }

  player.position.x = Math.max(roomBounds.minX + 0.45, Math.min(roomBounds.maxX - 0.45, player.position.x));
  player.position.z = Math.max(roomBounds.minZ + 0.45, Math.min(roomBounds.maxZ - 0.45, player.position.z));
}

function animatePlayerWalk(dt = 1/60) {
  if (!player || !player.userData.parts) return;
  const p = player.userData.parts;

  if (isWalking) {
    walkClock += 14.4 * dt;
    const step = Math.sin(walkClock);
    const opposite = Math.sin(walkClock + Math.PI);

    // Pequeno sobe/desce no corpo para parecer passo, não deslizamento.
    player.position.y = Math.abs(step) * 0.045;

    p.armL.rotation.x = step * 0.45;
    p.armR.rotation.x = opposite * 0.45;
    p.legL.rotation.x = opposite * 0.42;
    p.legR.rotation.x = step * 0.42;
    p.armL.position.y = 1.25 + Math.abs(opposite) * 0.03;
    p.armR.position.y = 1.25 + Math.abs(step) * 0.03;
    p.legL.position.y = 0.42 + Math.max(0, step) * 0.06;
    p.legR.position.y = 0.42 + Math.max(0, opposite) * 0.06;
  } else {
    // Volta suavemente para pose parada.
    player.position.y *= 0.72;
    ['armL', 'armR', 'legL', 'legR'].forEach(name => {
      p[name].rotation.x *= 0.72;
    });
    p.armL.position.y += (1.25 - p.armL.position.y) * 0.25;
    p.armR.position.y += (1.25 - p.armR.position.y) * 0.25;
    p.legL.position.y += (0.42 - p.legL.position.y) * 0.25;
    p.legR.position.y += (0.42 - p.legR.position.y) * 0.25;
  }
}

function faceDirection(dx, dz) {
  // Snap de 4 direções estilo Habbo: frente, costas, esquerda e direita.
  if (Math.abs(dx) > Math.abs(dz)) {
    player.rotation.y = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
  } else {
    player.rotation.y = dz > 0 ? 0 : Math.PI;
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateCameraPosition() {
  if (!camera) return;

  // Câmera em órbita fixa no centro do quarto: não segue o jogador.
  // Scroll aproxima/afasta; botão direito gira a visão do quarto.
  const target = new THREE.Vector3(0, 0.9, 0);
  const horizontal = Math.cos(cameraPitch) * cameraDistance;
  const y = Math.sin(cameraPitch) * cameraDistance;
  const x = Math.sin(cameraYaw) * horizontal;
  const z = Math.cos(cameraYaw) * horizontal;

  camera.position.set(x, y, z);
  camera.lookAt(target);
}

function setupCameraControls(canvas) {
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    cameraDistance += e.deltaY * 0.01;
    cameraDistance = Math.max(7, Math.min(20, cameraDistance));
    updateCameraPosition();
  }, { passive: false });

  canvas.addEventListener('mousedown', e => {
    if (e.button !== 2) return;
    isRightDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener('mousemove', e => {
    if (!isRightDragging) return;
    const dx = e.clientX - lastMouseX;
    const dy = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    cameraYaw -= dx * 0.008;
    cameraPitch += dy * 0.006;
    cameraPitch = Math.max(0.35, Math.min(1.05, cameraPitch));
    updateCameraPosition();
  });

  window.addEventListener('mouseup', e => {
    if (e.button === 2) isRightDragging = false;
  });

  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      touchCamera.active = true;
      const a = e.touches[0];
      const b = e.touches[1];
      touchCamera.lastDistance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      touchCamera.lastAngle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
      touchCamera.lastCenterX = (a.clientX + b.clientX) / 2;
      touchCamera.lastCenterY = (a.clientY + b.clientY) / 2;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    if (!touchCamera.active || e.touches.length !== 2) return;
    e.preventDefault();
    const a = e.touches[0];
    const b = e.touches[1];
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
    const centerX = (a.clientX + b.clientX) / 2;
    const centerY = (a.clientY + b.clientY) / 2;

    cameraDistance -= (distance - touchCamera.lastDistance) * 0.025;
    cameraDistance = Math.max(7, Math.min(20, cameraDistance));
    cameraYaw -= (centerX - touchCamera.lastCenterX) * 0.01;
    cameraYaw -= (angle - touchCamera.lastAngle) * 0.45;
    cameraPitch += (centerY - touchCamera.lastCenterY) * 0.006;
    cameraPitch = Math.max(0.35, Math.min(1.05, cameraPitch));

    touchCamera.lastDistance = distance;
    touchCamera.lastAngle = angle;
    touchCamera.lastCenterX = centerX;
    touchCamera.lastCenterY = centerY;
    updateCameraPosition();
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    if (e.touches.length < 2) touchCamera.active = false;
  });
}


function onClick(event) {
  if (!raycaster || event.target.closest('#chatForm') || event.target.closest('#profilePopup') || event.target.closest('#inventoryPanel') || event.target.closest('#mobiControls') || event.target.closest('#inventoryToggle') || event.target.closest('#roomsToggle') || event.target.closest('#roomsModal')) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(scene.children, true);

  const hitPlayer = hits.find(h => findRootByType(h.object, 'player') || findRootByType(h.object, 'remotePlayer'));
  if (hitPlayer && !previewMobi && !mobiMoveMode) {
    const own = findRootByType(hitPlayer.object, 'player');
    if (own) openProfile(currentUser.profile);
    return;
  }

  // Mobi só abre menu no duplo clique. Clique simples em mobi não move personagem.
  const hitMobi = hits.find(h => findRootByType(h.object, 'mobi'));
  if (hitMobi && !previewMobi) return;

  const point = getRoomPointFromMouse();
  if (point) {
    if (moveActiveMobiTo(point)) return;

    moveTarget = {
      x: Math.max(roomBounds.minX + 0.45, Math.min(roomBounds.maxX - 0.45, point.x)),
      z: Math.max(roomBounds.minZ + 0.45, Math.min(roomBounds.maxZ - 0.45, point.z))
    };
  }
}

function onDoubleClick(event) {
  if (!raycaster || event.target.closest('#chatForm') || event.target.closest('#profilePopup') || event.target.closest('#inventoryPanel') || event.target.closest('#mobiControls') || event.target.closest('#inventoryToggle') || event.target.closest('#roomsToggle') || event.target.closest('#roomsModal')) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(scene.children, true);
  const hitRemote = hits.find(h => findRootByType(h.object, 'remotePlayer'));
  if (hitRemote) {
    const remoteRoot = findRootByType(hitRemote.object, 'remotePlayer');
    if (remoteRoot) openPlayerActionMenu(remoteRoot.userData.profile);
    return;
  }
  const hitMobi = hits.find(h => findRootByType(h.object, 'mobi'));
  if (hitMobi && !previewMobi) {
    selectPlacedMobi(findRootByType(hitMobi.object, 'mobi'));
  }
}


function openPlayerActionMenu(profile) {
  selectedRemotePlayer = profile;
  const menu = document.getElementById('playerActionMenu');
  if (!menu) return;
  document.getElementById('playerMenuName').textContent = profile.name || 'Jogador';
  menu.classList.remove('hidden');
}

function closePlayerActionMenu() {
  const menu = document.getElementById('playerActionMenu');
  if (menu) menu.classList.add('hidden');
}

function openRemoteProfile() {
  if (!selectedRemotePlayer) return;
  closePlayerActionMenu();
  openProfile(selectedRemotePlayer);
}

function getInventoryQty(type) {
  const item = inventory.find(i => i.id === type);
  return item ? item.qty : 0;
}

function setInventoryQty(type, qty) {
  const item = inventory.find(i => i.id === type);
  if (item) item.qty = Math.max(0, qty);
}

function tradeIdFor(a, b) {
  return [a, b].sort().join('_');
}

function tradeRequestIdFor(requesterUid, targetUid) {
  return `${requesterUid}_${targetUid}`;
}

function emptyOffer() {
  return { items: {} };
}

function normalizeOffer(raw) {
  if (!raw) return emptyOffer();
  if (typeof raw === 'string') return raw ? { items: { [raw]: 1 } } : emptyOffer();
  if (raw.items && typeof raw.items === 'object') {
    const out = {};
    Object.entries(raw.items).forEach(([type, qty]) => {
      const n = Math.max(0, Number(qty) || 0);
      if (n > 0) out[type] = n;
    });
    return { items: out };
  }
  return emptyOffer();
}

function offerCount(offer, type) {
  return Number(normalizeOffer(offer).items[type] || 0);
}

function offerTotal(offer) {
  return Object.values(normalizeOffer(offer).items).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
}

function offerHasItems(offer) {
  return offerTotal(offer) > 0;
}

function offerToHTML(offer, removable = false) {
  const data = normalizeOffer(offer);
  const entries = Object.entries(data.items).filter(([, qty]) => qty > 0);
  if (!entries.length) return '<span>Nenhum mobi escolhido</span>';
  return `<div class="trade-offer-list">${entries.map(([type, qty]) => `
    <div class="trade-offer-item">
      ${mobiPreviewHTML(type)}
      <b>${escapeHtml(mobiName(type))}</b>
      <em>x${qty}</em>
      ${removable ? `<button type="button" class="trade-remove-item" data-remove-trade-mobi="${escapeHtml(type)}">×</button>` : ''}
    </div>
  `).join('')}</div>`;
}

function attachRemoveOfferButtons() {
  document.querySelectorAll('[data-remove-trade-mobi]').forEach(btn => {
    btn.onclick = () => removeTradeOfferItem(btn.dataset.removeTradeMobi);
  });
}

function startTradeRequestListener() {
  if (!currentUser || !currentRoomData || unsubscribeTradeRequests) return;
  unsubscribeTradeRequests = onSnapshot(collection(db, 'tradeRequests'), snap => {
    snap.docChanges().forEach(change => {
      const data = change.doc.data();
      if (change.type === 'removed') return;
      if (!data || data.status !== 'pending') return;
      if (data.targetUid !== currentUser.uid) return;
      if (data.roomId !== currentRoomData.id) return;
      showTradeRequest(data, change.doc.id);
    });
  }, err => console.warn('Erro ao ouvir pedidos de trade:', err));
}

function showTradeRequest(data, requestId) {
  pendingTradeRequest = { ...data, requestId };
  const box = document.getElementById('tradeRequestBox');
  if (!box) return;
  document.getElementById('tradeRequestText').textContent = `${data.requesterName || 'Um jogador'} pediu trade com você.`;
  box.classList.remove('hidden');
}

async function requestTrade() {
  if (!selectedRemotePlayer || !selectedRemotePlayer.uid) return alert('Jogador inválido para troca.');
  closePlayerActionMenu();
  const other = selectedRemotePlayer;
  const requestId = tradeRequestIdFor(currentUser.uid, other.uid);
  const ref = doc(db, 'tradeRequests', requestId);
  await setDoc(ref, {
    id: requestId,
    requesterUid: currentUser.uid,
    requesterName: currentUser.profile?.name || currentUser.email || 'Jogador',
    targetUid: other.uid,
    targetName: other.name || 'Jogador',
    roomId: currentRoomData.id,
    status: 'pending',
    createdAtMs: Date.now(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  alert(`Pedido de trade enviado para ${other.name || 'jogador'}.`);
  if (unsubscribeTradeRequestDoc) unsubscribeTradeRequestDoc();
  unsubscribeTradeRequestDoc = onSnapshot(ref, snap => {
    if (!snap.exists()) return;
    const data = snap.data();
    if (data.status === 'accepted') {
      if (unsubscribeTradeRequestDoc) { unsubscribeTradeRequestDoc(); unsubscribeTradeRequestDoc = null; }
      openTradeSession(other, requestId);
    } else if (data.status === 'declined') {
      if (unsubscribeTradeRequestDoc) { unsubscribeTradeRequestDoc(); unsubscribeTradeRequestDoc = null; }
      alert(`${other.name || 'O jogador'} recusou o trade.`);
    } else if (data.status === 'canceled') {
      if (unsubscribeTradeRequestDoc) { unsubscribeTradeRequestDoc(); unsubscribeTradeRequestDoc = null; }
      alert(`${other.name || 'O jogador'} cancelou o pedido de trade.`);
    }
  });
}

async function acceptTradeRequest() {
  if (!pendingTradeRequest) return;
  const req = pendingTradeRequest;
  document.getElementById('tradeRequestBox')?.classList.add('hidden');
  pendingTradeRequest = null;
  await setDoc(doc(db, 'tradeRequests', req.requestId), { status: 'accepted', updatedAt: serverTimestamp() }, { merge: true });
  openTradeSession({ uid: req.requesterUid, name: req.requesterName }, req.requestId);
}

async function declineTradeRequest() {
  if (!pendingTradeRequest) return;
  const req = pendingTradeRequest;
  document.getElementById('tradeRequestBox')?.classList.add('hidden');
  pendingTradeRequest = null;
  await setDoc(doc(db, 'tradeRequests', req.requestId), { status: 'declined', updatedAt: serverTimestamp() }, { merge: true });
}

async function openTradeWindow() {
  return requestTrade();
}

async function openTradeSession(other, id) {
  currentTrade = { id, other, suppressCancel: false };
  const modal = document.getElementById('tradeModal');
  document.getElementById('tradeTargetName').textContent = other.name || 'Jogador';
  renderTradeInventory();
  modal.classList.remove('hidden');
  const ref = doc(db, 'trades', id);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : null;
  if (!existing || existing.completed || existing.status === 'canceled' || existing.roomId !== currentRoomData.id) {
    await setDoc(ref, {
      id,
      roomId: currentRoomData.id,
      players: [currentUser.uid, other.uid],
      names: { [currentUser.uid]: currentUser.profile.name, [other.uid]: other.name || 'Jogador' },
      offers: {},
      confirms: {},
      completed: false,
      status: 'open',
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
  if (unsubscribeTrade) unsubscribeTrade();
  unsubscribeTrade = onSnapshot(ref, snap2 => {
    if (!snap2.exists()) return;
    const data = snap2.data();
    if (!data.players || !data.players.includes(currentUser.uid)) return;
    renderTradeState(data);
  });
}

function renderTradeInventory() {
  const wrap = document.getElementById('tradeInventory');
  if (!wrap) return;
  wrap.innerHTML = inventory.map(item => `<button class="trade-item" data-trade-mobi="${escapeHtml(item.id)}" ${item.qty <= 0 ? 'disabled' : ''}>${mobiPreviewHTML(item.id)}<b>${escapeHtml(item.name)}</b><em>x${item.qty}</em></button>`).join('');
  wrap.querySelectorAll('[data-trade-mobi]').forEach(btn => {
    btn.onclick = () => addTradeOfferItem(btn.dataset.tradeMobi);
  });
}

async function addTradeOfferItem(type) {
  if (!currentTrade) return;
  const snap = await getDoc(doc(db, 'trades', currentTrade.id));
  const data = snap.data() || {};
  const myOffer = normalizeOffer(data.offers?.[currentUser.uid]);
  const currentQty = offerCount(myOffer, type);
  if (currentQty >= getInventoryQty(type)) return alert('Você não tem mais unidades desse mobi para adicionar.');
  myOffer.items[type] = currentQty + 1;
  await setDoc(doc(db, 'trades', currentTrade.id), {
    offers: { [currentUser.uid]: myOffer },
    confirms: { [currentUser.uid]: false, [currentTrade.other.uid]: false },
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function removeTradeOfferItem(type) {
  if (!currentTrade) return;
  const snap = await getDoc(doc(db, 'trades', currentTrade.id));
  const data = snap.data() || {};
  const myOffer = normalizeOffer(data.offers?.[currentUser.uid]);
  const qty = offerCount(myOffer, type);
  if (qty <= 0) return;
  if (qty === 1) delete myOffer.items[type];
  else myOffer.items[type] = qty - 1;
  await setDoc(doc(db, 'trades', currentTrade.id), {
    offers: { [currentUser.uid]: myOffer },
    confirms: { [currentUser.uid]: false, [currentTrade.other.uid]: false },
    updatedAt: serverTimestamp()
  }, { merge: true });
}

function renderTradeState(data) {
  if (!currentTrade) return;
  const otherUid = currentTrade.other.uid;
  const myOffer = normalizeOffer(data.offers?.[currentUser.uid]);
  const otherOffer = normalizeOffer(data.offers?.[otherUid]);
  const myConfirm = !!data.confirms?.[currentUser.uid];
  const otherConfirm = !!data.confirms?.[otherUid];

  if (data.status === 'canceled') {
    const cancelName = data.canceledByName || 'O outro jogador';
    closeTradeWindowLocalOnly();
    alert(`${cancelName} cancelou o trade.`);
    return;
  }

  document.getElementById('myTradeOffer').innerHTML = offerToHTML(myOffer, true);
  document.getElementById('otherTradeOffer').innerHTML = offerToHTML(otherOffer, false).replace('Nenhum mobi escolhido', 'Aguardando outro jogador');
  attachRemoveOfferButtons();
  document.getElementById('tradeStatus').textContent = `Você: ${myConfirm ? 'confirmou' : 'não confirmou'} • Outro: ${otherConfirm ? 'confirmou' : 'não confirmou'}`;

  if (data.completed || data.status === 'completed') {
    document.getElementById('tradeStatus').textContent = 'Troca concluída.';
    if (currentTrade) currentTrade.suppressCancel = true;

    // Fecha a interface automaticamente para os dois jogadores assim que a troca termina.
    // Antes de fechar, cada lado aplica a troca no próprio inventário uma única vez.
    applyCompletedTrade(data)
      .catch(err => console.warn('Erro ao aplicar troca:', err))
      .finally(() => {
        if (currentTrade) {
          setTimeout(() => closeTradeWindowLocalOnly(), 700);
        }
      });
    return;
  }
  if (!data.completed && offerHasItems(myOffer) && offerHasItems(otherOffer) && myConfirm && otherConfirm) {
    completeTrade(data).catch(err => alert('Erro ao concluir troca: ' + err.message));
  }
}

function mobiName(type) {
  return (mobiCatalog.find(m => m.id === type) || {}).name || type;
}

async function confirmTrade() {
  if (!currentTrade) return;
  const snap = await getDoc(doc(db, 'trades', currentTrade.id));
  const data = snap.data() || {};
  const myOffer = normalizeOffer(data.offers?.[currentUser.uid]);
  if (!offerHasItems(myOffer)) return alert('Escolha pelo menos um mobi para oferecer primeiro.');
  for (const [type, qty] of Object.entries(myOffer.items)) {
    if (getInventoryQty(type) < qty) return alert(`Você não tem ${qty} unidade(s) de ${mobiName(type)}.`);
  }
  await setDoc(doc(db, 'trades', currentTrade.id), { confirms: { [currentUser.uid]: true }, updatedAt: serverTimestamp() }, { merge: true });
}

async function completeTrade(data) {
  if (!currentTrade || data.completed || data.status === 'canceled') return;
  const myUid = currentUser.uid;
  const otherUid = currentTrade.other.uid;
  const myOffer = normalizeOffer(data.offers?.[myUid]);
  const otherOffer = normalizeOffer(data.offers?.[otherUid]);
  if (!offerHasItems(myOffer) || !offerHasItems(otherOffer)) return;
  await setDoc(doc(db, 'trades', currentTrade.id), { completed: true, status: 'completed', completedAt: serverTimestamp() }, { merge: true });
}

async function applyCompletedTrade(data) {
  if (!currentTrade || data.applied?.[currentUser.uid]) return;
  const myUid = currentUser.uid;
  const otherUid = currentTrade.other.uid;
  const myOffer = normalizeOffer(data.offers?.[myUid]);
  const otherOffer = normalizeOffer(data.offers?.[otherUid]);

  for (const [type, qty] of Object.entries(myOffer.items)) {
    if (getInventoryQty(type) < qty) return alert(`Troca não aplicada: faltam unidades de ${mobiName(type)}.`);
  }
  Object.entries(myOffer.items).forEach(([type, qty]) => setInventoryQty(type, getInventoryQty(type) - qty));
  Object.entries(otherOffer.items).forEach(([type, qty]) => setInventoryQty(type, getInventoryQty(type) + qty));
  saveInventory();
  renderInventory();
  renderTradeInventory();
  await setDoc(doc(db, 'trades', currentTrade.id), { applied: { [currentUser.uid]: true }, updatedAt: serverTimestamp() }, { merge: true });
  document.getElementById('tradeStatus').textContent = 'Troca concluída.';
  setTimeout(() => closeTradeWindowLocalOnly(), 900);
}

async function closeTradeWindow() {
  if (currentTrade && !currentTrade.suppressCancel) {
    const myName = currentUser.profile?.name || currentUser.email || 'Jogador';
    await setDoc(doc(db, 'trades', currentTrade.id), {
      status: 'canceled',
      canceledBy: currentUser.uid,
      canceledByName: myName,
      updatedAt: serverTimestamp()
    }, { merge: true });
    await setDoc(doc(db, 'tradeRequests', currentTrade.id), { status: 'canceled', updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
    return;
  }
  closeTradeWindowLocalOnly();
}

function closeTradeWindowLocalOnly() {
  if (unsubscribeTrade) { unsubscribeTrade(); unsubscribeTrade = null; }
  if (currentTrade) currentTrade.suppressCancel = true;
  currentTrade = null;
  const modal = document.getElementById('tradeModal');
  if (modal) modal.classList.add('hidden');
}

function openProfile(profile) {
  document.getElementById('popupName').textContent = profile.name;
  document.getElementById('popupAge').textContent = profile.age;
  document.getElementById('popupBio').textContent = profile.bio;
  document.getElementById('profilePopup').style.display = 'block';
}

function closePopup() {
  document.getElementById('profilePopup').style.display = 'none';
}

function addMessage(author, text) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.innerHTML = `<b>${escapeHtml(author)}:</b> ${escapeHtml(text)}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function createSpeechBubble() {
  if (speechBubble) speechBubble.remove();
  speechBubble = document.createElement('div');
  speechBubble.id = 'speechBubble';
  speechBubble.className = 'speech-bubble hidden';
  document.body.appendChild(speechBubble);
}

function showSpeechBubble(text) {
  if (!speechBubble) createSpeechBubble();
  speechBubble.textContent = text;
  speechBubble.classList.remove('hidden');
  updateSpeechBubblePosition();

  clearTimeout(speechTimeout);
  speechTimeout = setTimeout(() => {
    if (speechBubble) speechBubble.classList.add('hidden');
  }, 4200);
}

function updateSpeechBubblePosition() {
  if (!speechBubble || speechBubble.classList.contains('hidden') || !player || !camera) return;
  const pos = new THREE.Vector3(player.position.x, player.position.y + 2.95, player.position.z);
  pos.project(camera);
  const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
  speechBubble.style.left = `${x}px`;
  speechBubble.style.top = `${y}px`;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

document.getElementById('chatForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  addMessage(currentUser.profile.name, text);
  showSpeechBubble(text);
  syncMyPresence(text);
  input.value = '';
});

window.addEventListener('beforeunload', () => { removeMyPresence(); });
// Não remove presença ao trocar de aba. Apenas atualiza quando volta para o jogo.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) syncMyPresence(true);
});

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

buildSelectionGrids();
setupMobiButtons();
const invPrevBtn = document.getElementById('invPrevBtn');
const invNextBtn = document.getElementById('invNextBtn');
if (invPrevBtn) invPrevBtn.addEventListener('click', () => { inventoryPage = Math.max(0, inventoryPage - 1); renderInventory(); });
if (invNextBtn) invNextBtn.addEventListener('click', () => { inventoryPage += 1; renderInventory(); });
const inventoryToggle = document.getElementById('inventoryToggle');
const inventoryPanel = document.getElementById('inventoryPanel');
if (inventoryToggle && inventoryPanel) {
  inventoryToggle.addEventListener('click', () => {
    inventoryPanel.classList.toggle('hidden');
  });
}


const roomsToggle = document.getElementById('roomsToggle');
if (roomsToggle) roomsToggle.addEventListener('click', () => openRoomsModal('myRooms'));
const closeRoomsBtn = document.getElementById('closeRoomsBtn');
if (closeRoomsBtn) closeRoomsBtn.addEventListener('click', closeRoomsModal);
document.querySelectorAll('.rooms-tab').forEach(btn => {
  btn.addEventListener('click', () => switchRoomsTab(btn.dataset.tab));
});
const createRoomBtn = document.getElementById('createRoomBtn');
if (createRoomBtn) createRoomBtn.addEventListener('click', createNewRoomFromModal);
renderShapeGrid();


window.login = login;
window.openRegisterScreen = openRegisterScreen;
window.registerAccount = registerAccount;
window.backToLogin = backToLogin;
window.startGame = startGame;
window.closePopup = closePopup;
window.closePlayerActionMenu = closePlayerActionMenu;
window.openRemoteProfile = openRemoteProfile;
window.openTradeWindow = openTradeWindow;
window.requestTrade = requestTrade;
window.acceptTradeRequest = acceptTradeRequest;
window.declineTradeRequest = declineTradeRequest;
window.closeTradeWindow = closeTradeWindow;
window.confirmTrade = confirmTrade;
