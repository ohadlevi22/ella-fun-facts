# Multiplayer Game Mode - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Kahoot-style multiplayer quiz where 2-4 family members join a room via code, answer the same questions simultaneously, and compete on speed-based scoring.

**Architecture:** Firebase Realtime Database for game state sync, Firebase Auth for Google sign-in. Host's client drives question advancement. All client-side - no server code. Static export stays.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Firebase (Auth + Realtime Database)

---

## Task 1: Install Firebase & Create Config

**Files:**
- Modify: `package.json` (add firebase dependency)
- Create: `src/lib/firebase.ts`
- Create: `.env.local` (Firebase config - DO NOT commit)
- Modify: `.gitignore` (ensure .env.local is ignored)

**Step 1: Install firebase**

```bash
npm install firebase
```

**Step 2: Create Firebase config file**

Create `src/lib/firebase.ts`:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
```

**Step 3: Create .env.local template**

Create `.env.local` with placeholder values (user fills in from Firebase console):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Step 4: Verify .gitignore has .env.local**

Check `.gitignore` includes `.env.local`. If not, add it.

**Step 5: Verify build passes**

```bash
npx next build
```

Expected: Build succeeds (Firebase won't initialize without real keys but won't break the build).

**Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/firebase.ts .gitignore
git commit -m "feat: add Firebase SDK and config setup"
```

> **PAUSE: User must create Firebase project and fill in .env.local before continuing.**
> 1. Go to https://console.firebase.google.com
> 2. Create new project (e.g., "ella-fun-facts")
> 3. Enable Authentication > Google provider
> 4. Enable Realtime Database (start in test mode, we'll add rules later)
> 5. Copy config values to .env.local

---

## Task 2: Auth Hook (Google Sign-In)

**Files:**
- Create: `src/lib/auth.ts`

**Step 1: Create auth hook**

Create `src/lib/auth.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export interface AuthUser {
  uid: string;
  name: string;
  photo: string | null;
}

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    name: user.displayName || 'שחקן',
    photo: user.photoURL,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toAuthUser(firebaseUser) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }, []);

  const logOut = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }, []);

  return { user, loading, signIn, logOut };
}
```

**Step 2: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: add Google sign-in auth hook"
```

---

## Task 3: Room CRUD Operations

**Files:**
- Create: `src/lib/gameRoom.ts`

**Step 1: Create room operations**

Create `src/lib/gameRoom.ts`:

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/gameRoom.ts
git commit -m "feat: add room CRUD operations for Firebase"
```

---

## Task 4: Game Engine (Real-Time Game Logic)

**Files:**
- Create: `src/lib/gameEngine.ts`

**Step 1: Create game engine**

Create `src/lib/gameEngine.ts`:

```typescript
import { ref, set, update, get, onValue, off, serverTimestamp } from 'firebase/database';
import { db } from './firebase';
import { getQuizByCategory, shuffleArray, QuizQuestion, getShuffledAnswers } from '@/data/quiz';
import { CategoryId } from '@/data/facts';

export interface GameQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  emoji: string;
}

export interface PlayerAnswer {
  answer: string;
  correct: boolean;
  answeredAt: number;
  points: number;
}

const TIME_PER_QUESTION = 20000; // 20 seconds

export function calculatePoints(timeToAnswerMs: number, correct: boolean, streak: number): number {
  if (!correct) return 0;
  const base = Math.max(100, Math.round(1000 - (timeToAnswerMs / 20)));
  const multiplier = streak >= 3 ? 1.5 : streak >= 2 ? 1.2 : 1;
  return Math.round(base * multiplier);
}

export async function startGame(roomCode: string, category: string, roundLength: number): Promise<void> {
  // Generate questions
  let allQuestions: QuizQuestion[];
  if (category === 'all') {
    const categories: CategoryId[] = ['space', 'nature', 'animals', 'vehicles', 'airplanes', 'ships', 'food', 'cultures', 'countries'];
    const perCategory = Math.ceil(roundLength / categories.length);
    allQuestions = [];
    for (const cat of categories) {
      const catQuestions = shuffleArray(getQuizByCategory(cat)).slice(0, perCategory);
      allQuestions.push(...catQuestions);
    }
    allQuestions = shuffleArray(allQuestions).slice(0, roundLength);
  } else {
    allQuestions = shuffleArray(getQuizByCategory(category as CategoryId)).slice(0, roundLength);
  }

  // Write questions to Firebase (without correctAnswer exposed in options position)
  const gameQuestions: Record<string, GameQuestion> = {};
  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];
    gameQuestions[String(i)] = {
      question: q.question,
      correctAnswer: q.correctAnswer,
      options: getShuffledAnswers(q),
      emoji: q.emoji,
    };
  }

  await set(ref(db, `rooms/${roomCode}/questions`), gameQuestions);
  await update(ref(db, `rooms/${roomCode}`), {
    status: 'playing',
    currentQuestion: 0,
    questionStartedAt: serverTimestamp(),
  });
}

export async function submitAnswer(
  roomCode: string,
  uid: string,
  questionIndex: number,
  answer: string,
  questionStartedAt: number,
): Promise<number> {
  const now = Date.now();
  const timeToAnswer = now - questionStartedAt;

  // Get the correct answer
  const qSnap = await get(ref(db, `rooms/${roomCode}/questions/${questionIndex}/correctAnswer`));
  const correctAnswer = qSnap.val();
  const correct = answer === correctAnswer;

  // Get current streak
  const streakSnap = await get(ref(db, `rooms/${roomCode}/players/${uid}/streak`));
  const currentStreak = streakSnap.val() || 0;
  const newStreak = correct ? currentStreak + 1 : 0;

  const points = calculatePoints(timeToAnswer, correct, correct ? newStreak : 0);

  // Write answer
  await set(ref(db, `rooms/${roomCode}/players/${uid}/answers/${questionIndex}`), {
    answer,
    correct,
    answeredAt: now,
    points,
  });

  // Update player score and streak
  const scoreSnap = await get(ref(db, `rooms/${roomCode}/players/${uid}/score`));
  const currentScore = scoreSnap.val() || 0;

  await update(ref(db, `rooms/${roomCode}/players/${uid}`), {
    score: currentScore + points,
    streak: newStreak,
  });

  return points;
}

export async function advanceQuestion(roomCode: string, currentQuestion: number, roundLength: number): Promise<void> {
  const nextQuestion = currentQuestion + 1;
  if (nextQuestion >= roundLength) {
    await update(ref(db, `rooms/${roomCode}`), { status: 'finished' });
  } else {
    await update(ref(db, `rooms/${roomCode}`), {
      currentQuestion: nextQuestion,
      questionStartedAt: serverTimestamp(),
    });
  }
}

export function onAnswersChange(
  roomCode: string,
  questionIndex: number,
  callback: (answers: Record<string, PlayerAnswer>) => void
): () => void {
  const answersPath = `rooms/${roomCode}/players`;
  const playersRef = ref(db, answersPath);
  const handler = onValue(playersRef, (snapshot) => {
    const players = snapshot.val() || {};
    const answers: Record<string, PlayerAnswer> = {};
    for (const [uid, playerData] of Object.entries(players as Record<string, any>)) {
      if (playerData.answers && playerData.answers[questionIndex]) {
        answers[uid] = playerData.answers[questionIndex];
      }
    }
    callback(answers);
  });
  return () => off(playersRef, 'value', handler);
}
```

**Step 2: Commit**

```bash
git add src/lib/gameEngine.ts
git commit -m "feat: add real-time game engine with scoring and question management"
```

---

## Task 5: Multiplayer Lobby Page

**Files:**
- Create: `src/app/multiplayer/page.tsx`
- Create: `src/components/MultiplayerLobby.tsx`

**Step 1: Create the lobby component**

Create `src/components/MultiplayerLobby.tsx` - this handles sign-in, create room (with category + round length picker), and join room (with code input). The component manages its own state machine: `'lobby' | 'create' | 'join'`.

When `'lobby'`: show two big buttons - "Create Room" and "Join Room", plus user avatar/name and sign-out button.

When `'create'` (Room Setup): show 3x3 category grid (reuse categories from facts.ts) plus an "all categories" option, then 3 round length buttons (5/10/15). On submit, call `createRoom()` and navigate to room page.

When `'join'`: show 4 digit input fields for room code. On submit, verify room exists and is in `waiting` state, call `addPlayer()`, navigate to room page.

Use the existing category gradients for styling. Full RTL Hebrew text.

**Step 2: Create the page wrapper**

Create `src/app/multiplayer/page.tsx`:

```typescript
'use client';

import MultiplayerLobby from '@/components/MultiplayerLobby';

export default function MultiplayerPage() {
  return <MultiplayerLobby />;
}
```

**Step 3: Verify build**

```bash
npx next build
```

**Step 4: Commit**

```bash
git add src/app/multiplayer/page.tsx src/components/MultiplayerLobby.tsx
git commit -m "feat: add multiplayer lobby with create/join room"
```

---

## Task 6: Waiting Room Component

**Files:**
- Create: `src/components/WaitingRoom.tsx`

**Step 1: Create waiting room**

Create `src/components/WaitingRoom.tsx` - shows:
- Big room code display (styled prominently so kids can read it to friends)
- Category + round length info
- Real-time player list with avatars (subscribe to `onPlayersChange`)
- "Start" button (only visible to host, disabled until 2+ players)
- "Leave" button

Uses `onPlayersChange()` from gameRoom.ts to show players joining in real-time. Uses `onRoomChange()` to detect when host starts the game (status changes to 'playing').

When host clicks Start: calls `startGame()` from gameEngine.ts.
When status changes to 'playing': all clients transition to game screen.

**Step 2: Commit**

```bash
git add src/components/WaitingRoom.tsx
git commit -m "feat: add waiting room with real-time player list"
```

---

## Task 7: Game Room Page (Router)

**Files:**
- Create: `src/app/multiplayer/room/page.tsx`

**Step 1: Create room page**

Create `src/app/multiplayer/room/page.tsx`:

This is the main router component. It reads `?code=XXXX` from URL search params. It subscribes to room state via `onRoomChange()` and renders the appropriate screen:

- `status === 'waiting'` -> `<WaitingRoom />`
- `status === 'playing'` -> `<MultiplayerGame />`
- `status === 'finished'` -> `<FinalScoreboard />`

Handles edge cases: room not found, user not signed in (redirect to /multiplayer), user not in room's player list.

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
// ... imports for components and hooks

function RoomContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  // Subscribe to room state, render appropriate screen
  // ...
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <RoomContent />
    </Suspense>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/multiplayer/room/page.tsx
git commit -m "feat: add room page router with state-based rendering"
```

---

## Task 8: Countdown Timer Component

**Files:**
- Create: `src/components/CountdownTimer.tsx`

**Step 1: Create countdown timer**

Create `src/components/CountdownTimer.tsx` - a circular countdown timer that:
- Takes `duration` (ms) and `startedAt` (timestamp) props
- Shows remaining seconds as a big number in the center
- Has an animated SVG circle that depletes clockwise
- Changes color: green (>10s) -> yellow (5-10s) -> red (<5s)
- Calls `onTimeUp` callback when timer reaches 0

Uses `requestAnimationFrame` for smooth animation. Accounts for time drift by comparing `Date.now()` against `startedAt + duration`.

**Step 2: Commit**

```bash
git add src/components/CountdownTimer.tsx
git commit -m "feat: add animated countdown timer component"
```

---

## Task 9: Player Avatar Component

**Files:**
- Create: `src/components/PlayerAvatar.tsx`

**Step 1: Create player avatar**

Create `src/components/PlayerAvatar.tsx` - shows:
- Google profile photo in a circle (fallback to first letter of name)
- Name below
- Optional "answered" state: pulsing green ring when player has answered
- Optional score display below name

Used in waiting room player list and in-game player strip.

**Step 2: Commit**

```bash
git add src/components/PlayerAvatar.tsx
git commit -m "feat: add player avatar component"
```

---

## Task 10: Multiplayer Game Play Component

**Files:**
- Create: `src/components/MultiplayerGame.tsx`
- Create: `src/components/QuestionResults.tsx`

**Step 1: Create the main game component**

Create `src/components/MultiplayerGame.tsx` - the core game play screen. Internal state machine: `'question' | 'results' | 'get-ready'`.

**'get-ready' phase (3 seconds):**
- Shows "!התכוננו" with a 3-2-1 countdown
- Transitions to 'question'

**'question' phase (20 seconds):**
- Player avatar strip at top (shows who has answered via green pulse)
- CountdownTimer component
- Question card with emoji
- Answer buttons (4 for multiple choice, 2 side-by-side for true/false)
- On answer click: calls `submitAnswer()`, disables buttons, shows "waiting for others"
- Subscribe to answers via `onAnswersChange()` to track who answered

**'results' phase (4 seconds):**
- Shows `<QuestionResults />` component
- After 4 seconds, host advances question via `advanceQuestion()`
- If last question, room status becomes 'finished'

Host's client drives the timing. Non-host clients react to `currentQuestion` and `questionStartedAt` changes.

**Step 2: Create question results component**

Create `src/components/QuestionResults.tsx`:
- Shows correct answer highlighted
- Sorted player list: each row has avatar, name, points earned this round, total score
- Streak fire emoji if applicable
- Animated points "+920!" with CSS animation

**Step 3: Commit**

```bash
git add src/components/MultiplayerGame.tsx src/components/QuestionResults.tsx
git commit -m "feat: add multiplayer game play and question results"
```

---

## Task 11: Final Scoreboard Component

**Files:**
- Create: `src/components/FinalScoreboard.tsx`

**Step 1: Create final scoreboard**

Create `src/components/FinalScoreboard.tsx`:
- Podium layout: 2nd place (left), 1st place (center, taller), 3rd place (right)
- Big medal emojis
- Player avatars on podium blocks
- Final scores
- CSS confetti animation for the winner (simple falling colored squares)
- "Play again" button (host only - reshuffles and restarts, keeps same room)
- "New game" button (goes back to lobby)
- "Home" link

**Step 2: Commit**

```bash
git add src/components/FinalScoreboard.tsx
git commit -m "feat: add final scoreboard with podium and confetti"
```

---

## Task 12: Home Page - Add Multiplayer Button

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add multiplayer button**

In `src/app/page.tsx`, add a multiplayer button in the action buttons section, after the solo game button. Style it with a distinct gradient to stand out:

```tsx
<Link
  href="/multiplayer"
  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-center"
>
  👥 משחק מרובה משתתפים!
</Link>
```

Add it right after the existing solo game button.

**Step 2: Verify build**

```bash
npx next build
```

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add multiplayer button to home page"
```

---

## Task 13: Firebase Security Rules

**Files:**
- Create: `firebase-rules.json` (for reference - applied via Firebase console)

**Step 1: Write security rules**

Create `firebase-rules.json`:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": "auth != null && (!data.exists() || data.child('hostUid').val() === auth.uid)",
        "players": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid"
          }
        },
        "questions": {
          ".write": "auth != null && data.parent().child('hostUid').val() === auth.uid"
        }
      }
    }
  }
}
```

Key rules:
- Anyone authenticated can read rooms
- Only host can write room-level fields and questions
- Players can only write to their own player node
- Rooms can be created by anyone authenticated

**Step 2: Commit**

```bash
git add firebase-rules.json
git commit -m "docs: add Firebase security rules reference"
```

> **PAUSE: User must apply these rules in Firebase Console > Realtime Database > Rules**

---

## Task 14: Integration Testing & Polish

**Step 1: Test full flow locally**

Open two browser windows (or one regular + one incognito) to test:
1. Window A: Sign in, create room, pick category + round length
2. Window B: Sign in with different Google account, join room with code
3. Window A: Click start
4. Both windows: Answer questions, verify scoring, verify real-time sync
5. Verify final scoreboard shows correct winner

**Step 2: Test edge cases**
- Join non-existent room code -> error message
- Join room that's already playing -> error message
- Host leaves during game -> "waiting for host" message
- Only 1 player tries to start -> button disabled

**Step 3: Add Vercel environment variables**

In Vercel dashboard > Project Settings > Environment Variables, add all `NEXT_PUBLIC_FIREBASE_*` variables.

**Step 4: Deploy and test**

```bash
git push
```

Verify on production URL.

**Step 5: Final commit if any polish needed**

```bash
git add -A
git commit -m "polish: multiplayer game mode refinements"
```

---

## Task Order & Dependencies

```
Task 1 (Firebase setup) ──> Task 2 (Auth) ──> Task 3 (Room CRUD) ──> Task 4 (Game Engine)
                                                    |                       |
                                                    v                       v
                                              Task 5 (Lobby) ──> Task 6 (Waiting Room)
                                                                        |
                                              Task 8 (Timer) ──────────>|
                                              Task 9 (Avatar) ─────────>|
                                                                        v
                                                                  Task 7 (Room Page)
                                                                        |
                                                                        v
                                                                  Task 10 (Game Play)
                                                                        |
                                                                        v
                                                                  Task 11 (Scoreboard)
                                                                        |
                                              Task 12 (Home button) ────|
                                              Task 13 (Security rules) ─|
                                                                        v
                                                                  Task 14 (Integration)
```

Parallelizable: Tasks 8+9 can be done in parallel with Tasks 5+6.
