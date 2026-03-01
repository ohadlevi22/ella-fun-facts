'use client';

import Link from 'next/link';
import { categories, getFactsByCategory } from '@/data/facts';

export default function GamePage() {
  return (
    <main className="min-h-dvh px-6 py-10 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 bg-clip-text text-transparent mb-3 leading-tight">
          🎮 מצב משחק!
        </h1>
        <p className="text-xl text-gray-600">
          בחרי קטגוריה ובואי נראה כמה את יודעת!
        </p>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto">
        {categories.map((cat) => {
          const factCount = getFactsByCategory(cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`/game/category/${cat.id}`}
              className={`category-card block rounded-2xl bg-gradient-to-br ${cat.gradient} p-4 text-center text-white shadow-lg hover:shadow-xl`}
            >
              <span className="text-4xl block mb-1">{cat.emoji}</span>
              <span className="text-sm font-bold block">{cat.name}</span>
              <span className="text-xs opacity-80 block mt-1">{factCount} שאלות</span>
            </Link>
          );
        })}
      </div>

      {/* Back */}
      <Link
        href="/"
        className="mt-10 px-8 py-4 rounded-2xl bg-white/60 backdrop-blur text-gray-700 font-bold text-lg hover:bg-white/80 transition-all"
      >
        🏠 חזרה הביתה
      </Link>
    </main>
  );
}
