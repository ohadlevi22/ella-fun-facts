'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import FactCard from '@/components/FactCard';
import ProgressDots from '@/components/ProgressDots';
import LearnMorePanel from '@/components/LearnMorePanel';
import { getFactsByCategory, getCategoryById, CategoryId } from '@/data/facts';
import { useFavorites } from '@/hooks/useFavorites';

export default function CategoryPageClient({ categoryId }: { categoryId: CategoryId }) {
  const category = getCategoryById(categoryId);
  const categoryFacts = getFactsByCategory(categoryId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animClass, setAnimClass] = useState('');
  const [learnMoreFact, setLearnMoreFact] = useState<typeof categoryFacts[0] | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const goToNext = useCallback(() => {
    if (currentIndex < categoryFacts.length - 1) {
      setAnimClass('card-swipe-left');
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setAnimClass('card-enter');
        setTimeout(() => setAnimClass('card-enter-active'), 20);
      }, 250);
    }
  }, [currentIndex, categoryFacts.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setAnimClass('card-swipe-right');
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setAnimClass('card-enter');
        setTimeout(() => setAnimClass('card-enter-active'), 20);
      }, 250);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToNext();
      if (e.key === 'ArrowRight') goToPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goToNext, goToPrev]);

  if (!category) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">🤔 קטגוריה לא נמצאה</p>
          <Link href="/" className="text-purple-600 underline">חזרה הביתה</Link>
        </div>
      </main>
    );
  }

  const currentFact = categoryFacts[currentIndex];

  return (
    <main className="min-h-dvh px-6 py-8 flex flex-col items-center">
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <Link
          href="/"
          className="w-12 h-12 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-2xl shadow-md hover:bg-white hover:scale-110 transition-all"
        >
          →
        </Link>
        <h1 className={`text-3xl font-black bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`}>
          {category.emoji} {category.name}
        </h1>
        <span className="text-sm text-gray-500 font-bold bg-white/60 px-3 py-1 rounded-full">
          {currentIndex + 1}/{categoryFacts.length}
        </span>
      </div>

      <div className={`w-full ${animClass}`}>
        <FactCard
          fact={currentFact}
          isFavorite={isFavorite(currentFact.id)}
          onToggleFavorite={toggleFavorite}
          onSwipeLeft={goToNext}
          onSwipeRight={goToPrev}
          onLearnMore={() => setLearnMoreFact(currentFact)}
        />
      </div>

      <ProgressDots
        total={categoryFacts.length}
        current={currentIndex}
        onDotClick={setCurrentIndex}
      />

      <div className="flex gap-4 mt-4 w-full max-w-sm">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex-1 py-3 rounded-xl bg-white/70 backdrop-blur text-gray-700 font-bold shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all active:scale-95"
        >
          → הקודם
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === categoryFacts.length - 1}
          className="flex-1 py-3 rounded-xl bg-white/70 backdrop-blur text-gray-700 font-bold shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all active:scale-95"
        >
          הבא ←
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md">
        <Link
          href="/"
          className="px-4 py-2 rounded-full bg-white/50 text-sm text-gray-600 hover:bg-white/80 transition-all"
        >
          🏠 הביתה
        </Link>
        <Link
          href="/favorites"
          className="px-4 py-2 rounded-full bg-white/50 text-sm text-gray-600 hover:bg-white/80 transition-all"
        >
          ❤️ מועדפים
        </Link>
      </div>

      {learnMoreFact && (
        <LearnMorePanel
          fact={learnMoreFact}
          onClose={() => setLearnMoreFact(null)}
        />
      )}
    </main>
  );
}
