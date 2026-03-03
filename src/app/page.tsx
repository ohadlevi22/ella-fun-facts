'use client';

import { useState } from 'react';
import Link from 'next/link';
import CategoryGrid from '@/components/CategoryGrid';
import FactCard from '@/components/FactCard';
import { getRandomFact, Fact } from '@/data/facts';
import { useFavorites } from '@/hooks/useFavorites';
import { useNames } from '@/hooks/useNames';

export default function Home() {
  const [surpriseFact, setSurpriseFact] = useState<Fact | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { names, setNames, clearNames, loaded } = useNames();
  const [nameInput, setNameInput] = useState('');

  const handleSurprise = () => {
    setSurpriseFact(getRandomFact());
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed) {
      setNames(trimmed);
    }
  };

  if (!loaded) return null;

  // Onboarding screen
  if (!names) {
    return (
      <main className="min-h-dvh px-5 py-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-2 leading-tight">
            העובדות המגניבות
          </h1>
          <p className="text-base text-gray-500 font-medium mb-8">
            גלו עובדות מדהימות על העולם!
          </p>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <label htmlFor="name-input" className="block text-lg font-bold text-gray-700">
              מה השם שלך? 😊
            </label>
            <input
              id="name-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="למשל: דני, או אלה ושקד"
              className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-center text-lg font-medium bg-white/70 backdrop-blur-sm"
              autoFocus
              dir="rtl"
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              יאללה! 🚀
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-5 py-8 flex flex-col items-center">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">✨</div>
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-2 leading-tight">
          היי {names}!
        </h1>
        <p className="text-base text-gray-500 font-medium">
          מה בא לכן לגלות היום?
        </p>
      </div>

      {/* Categories */}
      <div className="w-full max-w-md mb-6">
        <CategoryGrid />
      </div>

      {/* Primary actions */}
      <div className="flex gap-3 w-full max-w-md mb-3">
        <Link
          href="/game"
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-center"
        >
          🎮 משחק!
        </Link>
      </div>

      {/* Secondary actions */}
      <div className="flex gap-3 w-full max-w-md">
        <button
          onClick={handleSurprise}
          className="flex-1 py-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 text-gray-700 font-bold text-base shadow-md hover:shadow-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
        >
          🎲 הפתעה!
        </button>
        <Link
          href="/favorites"
          className="flex-1 py-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 text-gray-700 font-bold text-base shadow-md hover:shadow-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95 text-center"
        >
          ❤️ מועדפים
        </Link>
      </div>

      {/* Surprise Fact */}
      {surpriseFact && (
        <div className="mt-6 w-full max-w-md">
          <FactCard
            fact={surpriseFact}
            isFavorite={isFavorite(surpriseFact.id)}
            onToggleFavorite={toggleFavorite}
          />
          <button
            onClick={handleSurprise}
            className="mt-3 w-full py-3 rounded-xl bg-white/60 backdrop-blur text-gray-600 font-medium hover:bg-white/80 transition-all text-sm"
          >
            🎲 עוד הפתעה!
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-10 text-center">
        <p className="text-xs text-gray-400">
          נבנה עם 💜 עבור {names}
        </p>
        <button
          onClick={clearNames}
          className="text-xs text-gray-300 hover:text-gray-500 transition-colors mt-1"
        >
          שינוי שם
        </button>
      </div>
    </main>
  );
}
