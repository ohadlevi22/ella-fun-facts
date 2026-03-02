'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onPlayersChange, PlayerData, RoomData } from '@/lib/gameRoom';
import { AuthUser } from '@/lib/auth';
import { ref, update, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import PlayerAvatar from './PlayerAvatar';
import Link from 'next/link';

interface FinalScoreboardProps {
  roomCode: string;
  roomData: RoomData;
  currentUser: AuthUser;
  players: Record<string, PlayerData>;
}

// Confetti colors
const CONFETTI_COLORS = [
  '#f472b6', // pink
  '#a78bfa', // purple
  '#60a5fa', // blue
  '#34d399', // green
  '#fbbf24', // yellow
  '#fb923c', // orange
  '#f87171', // red
  '#2dd4bf', // teal
];

function ConfettiPiece({ index }: { index: number }) {
  // Deterministic "random" values based on index
  const left = ((index * 37 + 13) % 100);
  const delay = ((index * 7 + 3) % 30) / 10; // 0-3s delay
  const duration = 2 + ((index * 11 + 5) % 20) / 10; // 2-4s duration
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = 6 + (index % 3) * 4; // 6-14px
  const isCircle = index % 3 === 0;
  const rotation = (index * 47) % 360;

  return (
    <div
      className="confetti-piece"
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: '-20px',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: isCircle ? '50%' : '2px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
}

function Confetti() {
  return (
    <div className="confetti-container" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </div>
  );
}

interface PodiumEntry {
  uid: string;
  player: PlayerData;
  rank: number;
}

export default function FinalScoreboard({
  roomCode,
  roomData,
  currentUser,
  players: initialPlayers,
}: FinalScoreboardProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<Record<string, PlayerData>>(initialPlayers);
  const [resetting, setResetting] = useState(false);

  const isHost = currentUser.uid === roomData.hostUid;

  // Subscribe to players for real-time updates
  useEffect(() => {
    const unsubscribe = onPlayersChange(roomCode, (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });
    return unsubscribe;
  }, [roomCode]);

  // Sort players by score (descending) and build ranked entries
  const rankedPlayers: PodiumEntry[] = useMemo(() => {
    return Object.entries(players)
      .map(([uid, player]) => ({ uid, player }))
      .sort((a, b) => b.player.score - a.player.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [players]);

  const winner = rankedPlayers[0];
  const second = rankedPlayers[1];
  const third = rankedPlayers[2];

  // Play Again: reset room to waiting state
  const handlePlayAgain = async () => {
    if (!isHost || resetting) return;
    setResetting(true);
    try {
      const roomRef = ref(db, `rooms/${roomCode}`);
      // Clear questions and answers
      const questionsRef = ref(db, `rooms/${roomCode}/questions`);
      await remove(questionsRef);

      // Reset room status and question counter
      await update(roomRef, {
        status: 'waiting',
        currentQuestion: -1,
        questionStartedAt: null,
      });

      // Reset all player scores/streaks and clear old answers
      const playerUpdates: Record<string, number | null> = {};
      for (const uid of Object.keys(players)) {
        playerUpdates[`players/${uid}/score`] = 0;
        playerUpdates[`players/${uid}/streak`] = 0;
        playerUpdates[`players/${uid}/answers`] = null;
      }
      await update(roomRef, playerUpdates);
    } catch (error) {
      console.error('Failed to reset room:', error);
      setResetting(false);
    }
  };

  const medalForRank = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const podiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-32';
      case 2: return 'h-24';
      case 3: return 'h-18';
      default: return 'h-14';
    }
  };

  const podiumGradient = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-amber-500';
      case 2: return 'from-gray-300 to-gray-400';
      case 3: return 'from-amber-600 to-amber-700';
      default: return 'from-gray-200 to-gray-300';
    }
  };

  // Single podium block component
  const PodiumBlock = ({ entry }: { entry: PodiumEntry }) => (
    <div className="flex flex-col items-center gap-2 podium-entry" style={{ animationDelay: `${entry.rank * 0.2}s` }}>
      {/* Medal */}
      <div className={`text-4xl ${entry.rank === 1 ? 'animate-bounce' : ''}`}>
        {medalForRank(entry.rank)}
      </div>

      {/* Avatar */}
      <div className={entry.rank === 1 ? 'scale-110' : ''}>
        <PlayerAvatar
          name={entry.player.name}
          photo={entry.player.photo}
          score={entry.player.score}
          size={entry.rank === 1 ? 'lg' : 'md'}
        />
      </div>

      {/* Winner crown for 1st place */}
      {entry.rank === 1 && (
        <span className="text-2xl animate-float">👑</span>
      )}

      {/* Podium block */}
      <div
        className={`w-24 ${podiumHeight(entry.rank)} rounded-t-2xl bg-gradient-to-t ${podiumGradient(entry.rank)} shadow-lg flex items-end justify-center pb-2`}
      >
        <span className="text-2xl font-black text-white/90 drop-shadow">
          #{entry.rank}
        </span>
      </div>
    </div>
  );

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-8 relative overflow-hidden" dir="rtl">
      {/* Confetti */}
      <Confetti />

      {/* Title */}
      <div className="text-center mb-2 z-10">
        <div className="text-6xl mb-2">🏆</div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
          !המשחק נגמר
        </h1>
        <p className="text-lg text-gray-500 mt-1">
          חדר <span className="font-black" dir="ltr">{roomCode}</span>
        </p>
      </div>

      {/* Winner announcement */}
      {winner && (
        <div className="text-center mb-6 z-10 winner-announce">
          <p className="text-2xl font-black text-gray-800">
            🎉 {winner.player.name} ניצח/ה! 🎉
          </p>
        </div>
      )}

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-8 z-10">
        {/* 2nd place (left) */}
        {second && <PodiumBlock entry={second} />}

        {/* 1st place (center) */}
        {winner && <PodiumBlock entry={winner} />}

        {/* 3rd place (right) */}
        {third && <PodiumBlock entry={third} />}
      </div>

      {/* Remaining players (4th+) */}
      {rankedPlayers.length > 3 && (
        <div className="w-full max-w-md bg-white/70 backdrop-blur rounded-2xl p-4 shadow-md mb-6 z-10">
          <div className="flex flex-wrap justify-center gap-4">
            {rankedPlayers.slice(3).map((entry) => (
              <div key={entry.uid} className="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-2">
                <span className="text-lg font-black text-gray-400">#{entry.rank}</span>
                <PlayerAvatar
                  name={entry.player.name}
                  photo={entry.player.photo}
                  score={entry.player.score}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="w-full max-w-md flex flex-col gap-3 z-10">
        {/* Play Again - host only */}
        {isHost && (
          <button
            onClick={handlePlayAgain}
            disabled={resetting}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resetting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> מאפסים...
              </span>
            ) : (
              '🔄 שחקו שוב!'
            )}
          </button>
        )}

        {/* Back to lobby */}
        <Link
          href="/multiplayer"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 text-center"
        >
          חזרה ללובי
        </Link>

        {/* Back home */}
        <Link
          href="/"
          className="w-full py-3 rounded-2xl bg-white/60 backdrop-blur text-gray-700 font-bold text-lg hover:bg-white/80 transition-all active:scale-95 text-center"
        >
          🏠 חזרה הביתה
        </Link>
      </div>
    </main>
  );
}
