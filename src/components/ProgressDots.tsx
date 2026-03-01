'use client';

interface ProgressDotsProps {
  total: number;
  current: number;
  onDotClick: (index: number) => void;
}

export default function ProgressDots({ total, current, onDotClick }: ProgressDotsProps) {
  // Show a window of dots around current position
  const maxDots = 7;
  let start = Math.max(0, current - Math.floor(maxDots / 2));
  const end = Math.min(total, start + maxDots);
  if (end - start < maxDots) {
    start = Math.max(0, end - maxDots);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-4" dir="ltr">
      {start > 0 && <span className="text-gray-400 text-xs">...</span>}
      {Array.from({ length: end - start }, (_, i) => {
        const index = start + i;
        return (
          <button
            key={index}
            onClick={() => onDotClick(index)}
            className={`dot h-2.5 rounded-full transition-all ${
              index === current
                ? 'active bg-gradient-to-r from-purple-500 to-pink-500'
                : 'w-2.5 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`עבור לעובדה ${index + 1}`}
          />
        );
      })}
      {end < total && <span className="text-gray-400 text-xs">...</span>}
    </div>
  );
}
