'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { createRoom, addPlayer, getRoom, getRoomPlayers } from '@/lib/gameRoom';
import { categories, CategoryId } from '@/data/facts';

type LobbyView = 'lobby' | 'create' | 'join';

const ROUND_OPTIONS = [5, 10, 15] as const;

export default function MultiplayerLobby() {
  const router = useRouter();
  const { user, loading, signIn, logOut } = useAuth();
  const [view, setView] = useState<LobbyView>('lobby');

  // Create room state
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all' | null>(null);
  const [roundLength, setRoundLength] = useState<number>(10);
  const [creating, setCreating] = useState(false);

  // Join room state
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCreateRoom = useCallback(async () => {
    if (!user || !selectedCategory) return;
    setCreating(true);
    try {
      const category = selectedCategory === 'all' ? 'all' : selectedCategory;
      const code = await createRoom(user, category, roundLength);
      router.push(`/multiplayer/room?code=${code}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      setCreating(false);
    }
  }, [user, selectedCategory, roundLength, router]);

  const handleDigitChange = useCallback((index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits(prev => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setJoinError(null);

    // Auto-focus next input
    if (digit && index < 3) {
      digitRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleDigitKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handleDigitPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      digitRefs.current[3]?.focus();
    }
  }, []);

  const handleJoinRoom = useCallback(async () => {
    if (!user) return;
    const code = digits.join('');
    if (code.length !== 4) {
      setJoinError('יש להזין קוד בן 4 ספרות');
      return;
    }

    setJoining(true);
    setJoinError(null);

    try {
      const room = await getRoom(code);

      if (!room) {
        setJoinError('החדר לא נמצא. בדקי את הקוד ונסי שוב');
        setJoining(false);
        return;
      }

      if (room.status !== 'waiting') {
        setJoinError('המשחק כבר התחיל! נסי חדר אחר');
        setJoining(false);
        return;
      }

      const players = await getRoomPlayers(code);
      if (Object.keys(players).length >= 4) {
        setJoinError('החדר מלא (4 שחקנים מקסימום)');
        setJoining(false);
        return;
      }

      await addPlayer(code, user);
      router.push(`/multiplayer/room?code=${code}`);
    } catch (error) {
      console.error('Failed to join room:', error);
      setJoinError('משהו השתבש. נסי שוב');
      setJoining(false);
    }
  }, [user, digits, router]);

  const resetToLobby = useCallback(() => {
    setView('lobby');
    setSelectedCategory(null);
    setRoundLength(10);
    setDigits(['', '', '', '']);
    setJoinError(null);
  }, []);

  // Loading spinner
  if (loading) {
    return (
      <main className="min-h-dvh px-6 py-10 flex flex-col items-center justify-center">
        <div className="text-4xl animate-float">🎮</div>
        <p className="mt-4 text-lg text-gray-500 font-medium">טוענת...</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-6 py-10 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 bg-clip-text text-transparent mb-2 leading-tight">
          🎮 משחק מרובה משתתפים
        </h1>
        <p className="text-lg text-gray-600">
          {view === 'lobby' && 'שחקי עם חברים!'}
          {view === 'create' && 'הגדרות החדר'}
          {view === 'join' && 'הצטרפי לחדר'}
        </p>
      </div>

      {/* ---- LOBBY VIEW ---- */}
      {view === 'lobby' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          {!user ? (
            /* Sign-in prompt */
            <div className="w-full bg-white/70 backdrop-blur rounded-3xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">🔑</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                צריך להתחבר קודם!
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                כדי לשחק עם חברים צריך להתחבר עם חשבון גוגל.
                <br />
                זה מהיר ובטוח!
              </p>
              <button
                onClick={signIn}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                התחברי עם Google
              </button>
            </div>
          ) : (
            /* Signed-in lobby */
            <>
              {/* User info bar */}
              <div className="w-full bg-white/70 backdrop-blur rounded-2xl p-4 shadow-md flex items-center gap-3">
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-12 h-12 rounded-full ring-2 ring-purple-300 ring-offset-2"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold ring-2 ring-purple-300 ring-offset-2">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500">מחוברת</p>
                </div>
                <button
                  onClick={logOut}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  התנתקי
                </button>
              </div>

              {/* Action buttons */}
              <button
                onClick={() => setView('create')}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                ✨ צרי חדר
              </button>
              <button
                onClick={() => setView('join')}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                🚪 הצטרפי לחדר
              </button>
            </>
          )}

          {/* Back to home */}
          <Link
            href="/"
            className="mt-4 px-8 py-4 rounded-2xl bg-white/60 backdrop-blur text-gray-700 font-bold text-lg hover:bg-white/80 transition-all"
          >
            🏠 חזרה הביתה
          </Link>
        </div>
      )}

      {/* ---- CREATE ROOM VIEW ---- */}
      {view === 'create' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          {/* Category selection */}
          <div className="w-full">
            <h2 className="text-xl font-black text-gray-800 mb-3 text-center">
              בחרי קטגוריה
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {/* All categories option */}
              <button
                onClick={() => setSelectedCategory('all')}
                className={`category-card rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-4 text-center text-white shadow-lg hover:shadow-xl ${
                  selectedCategory === 'all'
                    ? 'ring-4 ring-yellow-400 ring-offset-2 scale-105'
                    : ''
                }`}
              >
                <span className="text-4xl block mb-2">🌈</span>
                <span className="text-sm font-bold">הכל!</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`category-card rounded-2xl bg-gradient-to-br ${cat.gradient} p-4 text-center text-white shadow-lg hover:shadow-xl ${
                    selectedCategory === cat.id
                      ? 'ring-4 ring-yellow-400 ring-offset-2 scale-105'
                      : ''
                  }`}
                >
                  <span className="text-4xl block mb-2">{cat.emoji}</span>
                  <span className="text-sm font-bold">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Round length */}
          <div className="w-full">
            <h2 className="text-xl font-black text-gray-800 mb-3 text-center">
              כמה שאלות?
            </h2>
            <div className="flex gap-3 justify-center">
              {ROUND_OPTIONS.map((num) => (
                <button
                  key={num}
                  onClick={() => setRoundLength(num)}
                  className={`flex-1 py-4 rounded-2xl font-black text-xl transition-all ${
                    roundLength === num
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105'
                      : 'bg-white/70 text-gray-700 shadow-md hover:bg-white/90'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreateRoom}
            disabled={!selectedCategory || creating}
            className={`w-full py-5 rounded-2xl font-black text-2xl shadow-lg transition-all ${
              selectedCategory && !creating
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-105 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {creating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> יוצרת חדר...
              </span>
            ) : (
              '🚀 צרי חדר!'
            )}
          </button>

          {/* Back */}
          <button
            onClick={resetToLobby}
            className="px-8 py-4 rounded-2xl bg-white/60 backdrop-blur text-gray-700 font-bold text-lg hover:bg-white/80 transition-all"
          >
            ⬅️ חזרה
          </button>
        </div>
      )}

      {/* ---- JOIN ROOM VIEW ---- */}
      {view === 'join' && (
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="w-full bg-white/70 backdrop-blur rounded-3xl p-8 shadow-lg text-center">
            <div className="text-5xl mb-4">🔢</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              הזיני קוד חדר
            </h2>
            <p className="text-gray-500 mb-6">
              בקשי מהחברה שיצרה את החדר את הקוד
            </p>

            {/* 4-digit input */}
            <div className="flex gap-3 justify-center mb-6" dir="ltr">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { digitRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  onPaste={handleDigitPaste}
                  className="w-16 h-20 text-center text-3xl font-black rounded-2xl border-3 border-purple-200 bg-white text-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all shadow-sm"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Error message */}
            {joinError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                {joinError}
              </div>
            )}

            {/* Join button */}
            <button
              onClick={handleJoinRoom}
              disabled={digits.some(d => !d) || joining}
              className={`w-full py-4 rounded-2xl font-bold text-xl shadow-lg transition-all ${
                digits.every(d => d) && !joining
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> מצטרפת...
                </span>
              ) : (
                '🎉 הצטרפי!'
              )}
            </button>
          </div>

          {/* Back */}
          <button
            onClick={resetToLobby}
            className="px-8 py-4 rounded-2xl bg-white/60 backdrop-blur text-gray-700 font-bold text-lg hover:bg-white/80 transition-all"
          >
            ⬅️ חזרה
          </button>
        </div>
      )}
    </main>
  );
}
