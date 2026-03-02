import { ref, set, get, update, remove, serverTimestamp, onValue, off, DatabaseReference } from 'firebase/database';
import { db } from './firebase';
import { AuthUser } from './auth';

export interface RoomData {
  hostUid: string;
  category: string;
  roundLength: number;
  status: 'waiting' | 'playing' | 'finished';
  currentQuestion: number;
  questionStartedAt: number | null;
  timePerQuestion: number;
  createdAt: number;
}

export interface PlayerData {
  name: string;
  photo: string | null;
  score: number;
  streak: number;
}

function generateRoomCode(): string {
  return String(1000 + Math.floor(Math.random() * 9000));
}

export async function createRoom(user: AuthUser, category: string, roundLength: number): Promise<string> {
  let code = generateRoomCode();
  let attempts = 0;

  // Ensure unique code
  while (attempts < 10) {
    const snapshot = await get(ref(db, `rooms/${code}/status`));
    if (!snapshot.exists()) break;
    code = generateRoomCode();
    attempts++;
  }

  const roomRef = ref(db, `rooms/${code}`);
  await set(roomRef, {
    hostUid: user.uid,
    category,
    roundLength,
    status: 'waiting',
    currentQuestion: -1,
    questionStartedAt: null,
    timePerQuestion: 20000,
    createdAt: serverTimestamp(),
  });

  // Add host as first player
  await addPlayer(code, user);

  return code;
}

export async function addPlayer(roomCode: string, user: AuthUser): Promise<void> {
  const playerRef = ref(db, `rooms/${roomCode}/players/${user.uid}`);
  await set(playerRef, {
    name: user.name,
    photo: user.photo,
    score: 0,
    streak: 0,
  });
}

export async function removePlayer(roomCode: string, uid: string): Promise<void> {
  const playerRef = ref(db, `rooms/${roomCode}/players/${uid}`);
  await remove(playerRef);
}

export async function getRoom(roomCode: string): Promise<RoomData | null> {
  const snapshot = await get(ref(db, `rooms/${roomCode}`));
  if (!snapshot.exists()) return null;
  return snapshot.val() as RoomData;
}

export async function getRoomPlayers(roomCode: string): Promise<Record<string, PlayerData>> {
  const snapshot = await get(ref(db, `rooms/${roomCode}/players`));
  if (!snapshot.exists()) return {};
  return snapshot.val();
}

export function onRoomChange(roomCode: string, callback: (data: RoomData | null) => void): () => void {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const handler = onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  return () => off(roomRef, 'value', handler);
}

export function onPlayersChange(roomCode: string, callback: (players: Record<string, PlayerData>) => void): () => void {
  const playersRef = ref(db, `rooms/${roomCode}/players`);
  const handler = onValue(playersRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  });
  return () => off(playersRef, 'value', handler);
}
