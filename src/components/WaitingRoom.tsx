'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onPlayersChange, removePlayer, PlayerData, RoomData } from '@/lib/gameRoom';
import { startGame } from '@/lib/gameEngine';
import { AuthUser } from '@/lib/auth';
import PlayerAvatar from './PlayerAvatar';
import { getCategoryById, CategoryId } from '@/data/facts';

interface WaitingRoomProps {
  roomCode: string;
  roomData: RoomData;
  currentUser: AuthUser;
  onGameStart?: () => void;
}

const MAX_PLAYERS = 4;

export default function WaitingRoom({ roomCode, roomData, currentUser, onGameStart }: WaitingRoomProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<Record<string, PlayerData> | null>(null);
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isHost = currentUser.uid === roomData.hostUid;
  const playerCount = players ? Object.keys(players).length : 0;
  const canStart = isHost && playerCount >= 2 && !starting;

  // Resolve category info
  const isAllCategories = roomData.category === 'all';
  const category = isAllCategories ? null : getCategoryById(roomData.category as CategoryId);
  const categoryEmoji = isAllCategories ? '🌈' : (category?.emoji ?? '🎮');
  const categoryName = isAllCategories ? 'הכל!' : (category?.name ?? roomData.category);

  // Subscribe to real-time player changes
  useEffect(() => {
    const unsubscribe = onPlayersChange(roomCode, (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });
    return unsubscribe;
  }, [roomCode]);

  const handleStart = useCallback(async () => {
    if (!canStart) return;
    setStarting(true);
    try {
      await startGame(roomCode, roomData.category, roomData.roundLength);
      onGameStart?.();
    } catch (error) {
      console.error('Failed to start game:', error);
      setStarting(false);
    }
  }, [canStart, roomCode, roomData.category, roomData.roundLength, onGameStart]);

  const handleLeave = useCallback(async () => {
    setLeaving(true);
    try {
      await removePlayer(roomCode, currentUser.uid);
      router.push('/multiplayer');
    } catch (error) {
      console.error('Failed to leave room:', error);
      setLeaving(false);
    }
  }, [roomCode, currentUser.uid, router]);

  // Loading state while waiting for first player data
  if (players === null) {
    return (
      <div className="w-full max-w-md flex flex-col items-center gap-6 py-8">
        <div className="text-6xl animate-float">🎮</div>
        <p className="text-xl font-bold text-gray-500">טוענת את החדר...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6" dir="rtl">
      {/* Room Code - Big and prominent for kids to read aloud */}
      <div className="w-full bg-white/80 backdrop-blur rounded-3xl p-6 shadow-lg text-center">
        <p className="text-sm font-bold text-gray-500 mb-1 tracking-wide">קוד החדר</p>
        <div className="flex justify-center gap-3" dir="ltr">
          {roomCode.split('').map((digit, i) => (
            <span
              key={i}
              className="inline-flex items-center justify-center w-16 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-4xl font-black shadow-lg"
            >
              {digit}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-400">
          שתפו את הקוד עם חברים כדי שיצטרפו!
        </p>
      </div>

      {/* Category and round info */}
      <div className="w-full bg-white/70 backdrop-blur rounded-2xl p-4 shadow-md flex items-center gap-4">
        <span className="text-4xl">{categoryEmoji}</span>
        <div className="flex-1">
          <p className="font-black text-gray-800 text-lg">{categoryName}</p>
          <p className="text-sm text-gray-500">{roomData.roundLength} שאלות</p>
        </div>
      </div>

      {/* Player count header */}
      <div className="w-full text-center">
        <h2 className="text-xl font-black text-gray-800">
          {playerCount}/{MAX_PLAYERS} שחקנים
        </h2>
        {playerCount < 2 && (
          <p className="text-sm text-gray-500 mt-1 animate-pulse">
            ממתינים לשחקנים נוספים...
          </p>
        )}
      </div>

      {/* Player list */}
      <div className="w-full bg-white/70 backdrop-blur rounded-2xl p-6 shadow-md">
        <div className="flex flex-wrap justify-center gap-6">
          {Object.entries(players).map(([uid, player]) => (
            <div key={uid} className="relative">
              <PlayerAvatar
                name={player.name}
                photo={player.photo}
                size="lg"
              />
              {uid === roomData.hostUid && (
                <span className="absolute -top-2 -right-2 text-xl" title="מארח">
                  👑
                </span>
              )}
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: MAX_PLAYERS - playerCount }).map((_, i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center gap-1">
              <div className="w-20 h-20 rounded-full border-3 border-dashed border-gray-300 flex items-center justify-center bg-gray-50/50">
                <span className="text-3xl text-gray-300">?</span>
              </div>
              <span className="text-sm font-medium text-gray-400">ריק</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full flex flex-col gap-3">
        {/* Start button - only for host */}
        {isHost && (
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`w-full py-5 rounded-2xl font-black text-2xl shadow-lg transition-all ${
              canStart
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-105 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {starting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> מתחילים...
              </span>
            ) : playerCount < 2 ? (
              'צריך לפחות 2 שחקנים'
            ) : (
              '!התחילו 🚀'
            )}
          </button>
        )}

        {/* Non-host waiting message */}
        {!isHost && (
          <div className="w-full py-5 rounded-2xl bg-white/70 backdrop-blur text-center shadow-md">
            <p className="text-lg font-bold text-gray-600">
              <span className="animate-pulse">⏳</span> ממתינים שהמארח יתחיל...
            </p>
          </div>
        )}

        {/* Leave button */}
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="w-full py-4 rounded-2xl bg-white/60 backdrop-blur text-gray-700 font-bold text-lg hover:bg-white/80 transition-all active:scale-95"
        >
          {leaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> עוזבים...
            </span>
          ) : (
            '🚪 עזוב את החדר'
          )}
        </button>
      </div>
    </div>
  );
}
