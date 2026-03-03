'use client';

import { useState, useRef, useCallback } from 'react';
import { Fact, getCategoryById } from '@/data/facts';

interface FactCardProps {
  fact: Fact;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLearnMore?: () => void;
}

export default function FactCard({ fact, isFavorite, onToggleFavorite, onSwipeLeft, onSwipeRight, onLearnMore }: FactCardProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const startX = useRef(0);
  const category = getCategoryById(fact.category);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return;
    const diff = e.touches[0].clientX - startX.current;
    setSwipeX(diff);
  }, [swiping]);

  const handleTouchEnd = useCallback(() => {
    setSwiping(false);
    if (swipeX > 80 && onSwipeRight) {
      onSwipeRight();
    } else if (swipeX < -80 && onSwipeLeft) {
      onSwipeLeft();
    }
    setSwipeX(0);
  }, [swipeX, onSwipeLeft, onSwipeRight]);

  const handleFavorite = () => {
    setHeartAnim(true);
    onToggleFavorite(fact.id);
    setTimeout(() => setHeartAnim(false), 500);
  };

  const rotation = swipeX * 0.05;
  const opacity = Math.max(0.5, 1 - Math.abs(swipeX) / 300);

  return (
    <div
      className="swipe-card relative w-full max-w-sm mx-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${swipeX}px) rotate(${rotation}deg)`,
        opacity,
        transition: swiping ? 'none' : 'all 0.3s ease',
      }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl min-h-[300px] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <div className={`px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${category?.gradient}`}>
            {category?.emoji} {category?.name}
          </div>
          <button
            onClick={handleFavorite}
            className={`text-2xl fav-btn ${isFavorite ? 'active' : 'text-gray-300'} ${heartAnim ? 'animate-heart' : ''}`}
            aria-label={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-7 py-6">
          <span className="text-6xl animate-float">{fact.emoji}</span>
          <p className="text-lg md:text-xl text-center leading-relaxed text-gray-700 font-medium">
            {fact.text}
          </p>
        </div>

        {/* Learn more button */}
        {onLearnMore && (
          <div className="px-5 pb-5">
            <button
              onClick={onLearnMore}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              🔍 ספרו לי עוד!
            </button>
          </div>
        )}

        {/* Swipe hint arrows */}
        {swipeX < -20 && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl opacity-50">→</div>
        )}
        {swipeX > 20 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-50">←</div>
        )}
      </div>
    </div>
  );
}
