'use client';

import { useState } from 'react';
import Link from 'next/link';
import CategoryGrid from '@/components/CategoryGrid';
import FactCard from '@/components/FactCard';
import { getRandomFact, Fact } from '@/data/facts';
import { useFavorites } from '@/hooks/useFavorites';

export default function Home() {
  const [surpriseFact, setSurpriseFact] = useState<Fact | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleSurprise = () => {
    setSurpriseFact(getRandomFact());
  };

  return (
    <main className="min-h-dvh px-6 py-10 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-3 leading-tight">
          היי אלה! ✨
        </h1>
        <p className="text-xl text-gray-600">
          ברוכה הבאה לעולם העובדות המגניבות!
        </p>
      </div>

      {/* Category Grid */}
      <CategoryGrid />

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-8 w-full max-w-sm">
        <Link
          href="/game"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-center"
        >
          🎮 מצב משחק!
        </Link>
        <Link
          href="/multiplayer"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-center"
        >
          👥 משחק מרובה משתתפים!
        </Link>
        <div className="flex gap-3">
          <button
            onClick={handleSurprise}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            🎲 הפתעה!
          </button>
          <Link
            href="/favorites"
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-center"
          >
            ❤️ מועדפים
          </Link>
        </div>
      </div>

      {/* Surprise Fact */}
      {surpriseFact && (
        <div className="mt-8 w-full max-w-sm">
          <FactCard
            fact={surpriseFact}
            isFavorite={isFavorite(surpriseFact.id)}
            onToggleFavorite={toggleFavorite}
          />
          <button
            onClick={handleSurprise}
            className="mt-4 w-full py-3 rounded-xl bg-white/60 backdrop-blur text-gray-700 font-medium hover:bg-white/80 transition-all"
          >
            🎲 עוד הפתעה!
          </button>
        </div>
      )}

      {/* Footer */}
      <p className="mt-12 text-sm text-gray-400">
        נבנה עם 💜 עבור אלה
      </p>
    </main>
  );
}
