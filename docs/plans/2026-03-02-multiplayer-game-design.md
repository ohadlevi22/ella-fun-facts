# Multiplayer Game Mode - Design Document

**Date**: 2026-03-02
**Status**: Approved

## Overview

Add a Kahoot-style multiplayer quiz mode to Ella's Fun Facts. 2-4 family members join a room, answer the same questions simultaneously, and compete for points based on speed and accuracy.

## Decisions

| Aspect | Decision |
|--------|----------|
| Players | Family only, 2-4 kids |
| Sync model | Kahoot-style: same question, same time |
| Auth | Google sign-in (lightweight - name + photo only) |
| Backend | Firebase Realtime Database (free Spark plan) |
| Scoring | Speed-based: 1000-100 points over 20s, streak bonus |
| Round length | Host chooses 5, 10, or 15 questions |
| Categories | Single category or "all categories" mix |
| Solo mode | Unchanged (stays offline/static) |
| Hosting | Stays on Vercel with static export |

## User Flow

```
Home Page
  -> "משחק מרובה משתתפים" button
    -> Sign in with Google (if not signed in)
      -> Lobby Screen
        |-> "צור חדר" (Create Room)
        |     -> Room Setup: pick category + round length (5/10/15)
        |       -> Waiting Room (room code, player list)
        |         -> Host clicks "התחילו!" when ready
        |           -> Game Loop (question -> timer -> results -> next)
        |             -> Final Scoreboard
        |               -> "שחקו שוב" / "חזרה הביתה"
        |
        |-> "הצטרפי לחדר" (Join Room)
              -> Enter 4-digit room code
                -> Waiting Room (sees other players joining)
                  -> Game starts when host clicks start
```

### Screens

1. **Lobby** - Create or join a room
2. **Room Setup** (host only) - Pick category + round length
3. **Waiting Room** - Player list, room code display, "Start" button for host
4. **Game Play** - Question + countdown timer + live answer indicators
5. **Question Results** - Who got it right, points awarded, leaderboard
6. **Final Scoreboard** - Winner celebration with podium and confetti

## Firebase Data Model

```
/rooms/{roomCode}
  hostUid: "google-uid-123"
  category: "animals" | "all"
  roundLength: 10
  status: "waiting" | "playing" | "finished"
  currentQuestion: 0
  questionStartedAt: <server timestamp>
  timePerQuestion: 20000
  createdAt: <server timestamp>

  /players/{uid}
    name: "אלה"
    photo: "https://..."
    score: 850
    streak: 3
    /answers/{questionIndex}
      answer: "נכון! ✅"
      correct: true
      answeredAt: <timestamp>
      points: 920

  /questions/{index}
    question: "מה המספר החסר?..."
    correctAnswer: "8 דקות"
    options: ["8 דקות", "3 דקות", "24 דקות", "16 דקות"]
    emoji: "💡"
```

### Room Codes

4-digit numeric codes (1000-9999), randomly generated, checked for uniqueness against Firebase.

### Scoring

```
points = max(100, 1000 - (timeToAnswer_ms / 20))
```

- Answer instantly: ~1000 points
- Answer at 20 seconds: 100 points
- Wrong answer: 0 points
- Streak bonus: 2 correct in a row = 1.2x, 3+ = 1.5x

## Game Play UX

### During Each Question (20 seconds)
- Question card with animated countdown timer (circle or bar)
- 4 answer buttons (or 2 for true/false)
- Player avatar strip at top - avatars light up as players answer (no answer reveal)
- Timer runs out OR all players answered -> reveal results

### Question Results (3-4 seconds)
- Correct answer highlighted green
- Each player row: avatar + name + points earned + total score
- Points animation: "+920!" flying up
- Streak indicator: fire emoji x3

### Between Questions
- "Get ready!" countdown (3 seconds) before next question

### Final Scoreboard
- Podium: 1st/2nd/3rd with medals (gold/silver/bronze)
- Confetti animation for winner
- "Play again" (reshuffles) or "New game" (back to setup)

### Host Controls
- Only host can start the game
- Host can skip a question
- If host disconnects: game pauses with "waiting for host" message

## Technical Architecture

### Next.js Changes
- Keep `output: "export"` (Firebase SDK is fully client-side)
- Room codes passed via URL search params: `/multiplayer/room?code=4521`
- No dynamic route segments needed

### New Dependencies
- `firebase` - Auth + Realtime Database SDK

### Firebase Setup
- New Firebase project on free Spark plan
- Enable Google Auth provider
- Enable Realtime Database
- Security rules: players write only to their own `/players/{uid}`, host writes room-level fields

### File Structure

```
src/
  lib/
    firebase.ts          // Firebase init + config
    auth.ts              // Google sign-in hooks
    gameRoom.ts          // Room CRUD (create, join, leave)
    gameEngine.ts        // Real-time game state management
  app/
    multiplayer/
      page.tsx           // Lobby (create/join)
      room/
        page.tsx         // Game room (reads code from URL param)
  components/
    MultiplayerLobby.tsx
    RoomSetup.tsx
    WaitingRoom.tsx
    MultiplayerGame.tsx  // Game play screen
    QuestionResults.tsx
    FinalScoreboard.tsx
    PlayerAvatar.tsx
    CountdownTimer.tsx
```

## Room Lifecycle

### Creation
1. Host clicks "Create Room" -> generate random 4-digit code
2. Check Firebase for uniqueness -> regenerate if taken
3. Write room document with `status: "waiting"`
4. Host auto-added to players list

### Joining
1. Player enters 4-digit code -> read room from Firebase
2. Room exists + `status: "waiting"` + not full -> add to `/players`
3. Room full (4) or playing -> show error

### Game Start
1. Host clicks "Start" -> write questions array to `/questions`
2. Set `status: "playing"`, `currentQuestion: 0`, `questionStartedAt: serverTimestamp`
3. All clients listen and render accordingly

### Question Advancement
1. Host client waits 20s OR all players answered
2. Host writes `currentQuestion + 1` and new `questionStartedAt`
3. When `currentQuestion >= roundLength` -> set `status: "finished"`

### Cleanup
- Rooms auto-expire after 1 hour via Firebase security rules
- No manual cleanup needed
