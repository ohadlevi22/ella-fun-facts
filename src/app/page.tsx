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
    <main className="min-h-dvh px-5 py-8 flex flex-col items-center">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">✨</div>
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-2 leading-tight">
          היי אלה ושקד!
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
      <p className="mt-auto pt-10 text-xs text-gray-400">
        נבנה עם 💜 עבור אלה ושקד
      </p>
    </main>
  );
}
