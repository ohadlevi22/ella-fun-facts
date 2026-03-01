'use client';

import Link from 'next/link';
import { facts, getCategoryById } from '@/data/facts';
import { useFavorites } from '@/hooks/useFavorites';

export default function FavoritesPage() {
  const { favorites, toggleFavorite, loaded } = useFavorites();
  const favoriteFacts = facts.filter(f => favorites.has(f.id));

  if (!loaded) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="text-2xl animate-pulse">✨ טוען...</div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 py-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-xl shadow-md hover:bg-white transition-all"
        >
          →
        </Link>
        <h1 className="text-2xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          ❤️ המועדפים שלי
        </h1>
        <span className="text-sm text-gray-500 font-medium">
          {favoriteFacts.length} עובדות
        </span>
      </div>

      {/* Empty state */}
      {favoriteFacts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <span className="text-6xl mb-4">🤍</span>
          <p className="text-xl text-gray-600 mb-2">עדיין אין מועדפים!</p>
          <p className="text-gray-400 mb-6">לחצי על הלב בכרטיסיות כדי לשמור עובדות שאהבת</p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            🚀 בואי נגלה עובדות!
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          {favoriteFacts.map((fact) => {
            const category = getCategoryById(fact.category);
            return (
              <div
                key={fact.id}
                className="bg-white rounded-2xl shadow-md p-5 flex items-start gap-4 hover:shadow-lg transition-all"
              >
                <span className="text-4xl flex-shrink-0">{fact.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className={`inline-block px-2 py-0.5 rounded-full text-white text-xs font-bold bg-gradient-to-r ${category?.gradient} mb-2`}>
                    {category?.emoji} {category?.name}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{fact.text}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(fact.id)}
                  className="text-2xl flex-shrink-0 hover:scale-125 transition-transform"
                  aria-label="הסר ממועדפים"
                >
                  ❤️
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Back link */}
      <Link
        href="/"
        className="mt-8 px-6 py-3 rounded-xl bg-white/60 backdrop-blur text-gray-700 font-medium hover:bg-white/80 transition-all"
      >
        🏠 חזרה הביתה
      </Link>
    </main>
  );
}
