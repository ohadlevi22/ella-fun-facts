'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Fact, getCategoryById } from '@/data/facts';

interface LearnMoreData {
  whyItsCool: string;
  howItWorks: string;
  funComparison: string;
  bonusFacts: string[];
  youtubeVideoId: string | null;
  youtubeTitle: string | null;
}

interface LearnMorePanelProps {
  fact: Fact;
  onClose: () => void;
  names?: string | null;
}

function getCacheKey(factId: number): string {
  return `learn-more-${factId}`;
}

function getCached(factId: number): LearnMoreData | null {
  try {
    const raw = localStorage.getItem(getCacheKey(factId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Invalidate old format cache entries
    if (!parsed.whyItsCool) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCache(factId: number, data: LearnMoreData): void {
  try {
    localStorage.setItem(getCacheKey(factId), JSON.stringify(data));
  } catch {}
}

export default function LearnMorePanel({ fact, onClose, names }: LearnMorePanelProps) {
  const [data, setData] = useState<LearnMoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const category = getCategoryById(fact.category);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);

    const cached = getCached(fact.id);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({ text: fact.text, emoji: fact.emoji });
      if (names) params.set('names', names);
      const res = await fetch(`/api/learn-more?${params}`);
      if (!res.ok) throw new Error('API error');
      const result: LearnMoreData = await res.json();
      setData(result);
      setCache(fact.id, result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fact.id, fact.text, fact.emoji, names]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-300 ${
        visible ? 'bg-black/50' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className={`w-full max-w-lg bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out overflow-hidden ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '88vh' }}
      >
        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-br ${category?.gradient || 'from-purple-500 to-pink-500'} px-6 pt-4 pb-6`}>
          {/* Drag handle */}
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1.5 bg-white/40 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors text-lg"
          >
            ✕
          </button>

          <div className="text-center text-white">
            <span className="text-5xl block mb-2 drop-shadow-sm">{fact.emoji}</span>
            <p className="text-sm opacity-90 leading-relaxed line-clamp-2 max-w-xs mx-auto">{fact.text}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-8 pt-5 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 140px)' }}>
          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              <p className="text-center text-gray-400 text-base font-bold mb-4">🔍 מחפשת מידע...</p>
              <div className="shimmer h-24 rounded-2xl" />
              <div className="shimmer h-28 rounded-2xl" />
              <div className="shimmer h-20 rounded-2xl" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-8">
              <span className="text-5xl block mb-4">😅</span>
              <p className="text-lg font-bold text-gray-700 mb-2">אופס, משהו השתבש</p>
              <p className="text-gray-500 mb-4">לא הצלחתי למצוא מידע נוסף</p>
              <button
                onClick={fetchData}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:scale-105 active:scale-95 transition-all"
              >
                🔄 נסי שוב
              </button>
            </div>
          )}

          {/* Sections */}
          {data && !loading && (
            <div className="section-stagger space-y-3">
              {/* Why it's cool */}
              <div className="rounded-2xl p-4 bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-base">🤩</span>
                  <h3 className="text-sm font-black text-purple-700">למה זה מדהים?</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{data.whyItsCool}</p>
              </div>

              {/* How it works */}
              <div className="rounded-2xl p-4 bg-sky-50 border border-sky-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-base">🔬</span>
                  <h3 className="text-sm font-black text-sky-700">איך זה עובד?</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{data.howItWorks}</p>
              </div>

              {/* Fun comparison */}
              <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-base">🎯</span>
                  <h3 className="text-sm font-black text-emerald-700">תדמיינו ש...</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{data.funComparison}</p>
              </div>

              {/* YouTube video */}
              {data.youtubeVideoId && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-base">🎬</span>
                    <h3 className="text-sm font-black text-red-600">צפו בסרטון</h3>
                  </div>
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-md" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${data.youtubeVideoId}`}
                      title={data.youtubeTitle || 'Video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {data.youtubeTitle && (
                    <p className="text-xs text-gray-400 mt-1.5 text-center">{data.youtubeTitle}</p>
                  )}
                </div>
              )}

              {/* Bonus facts */}
              {data.bonusFacts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-base">✨</span>
                    <h3 className="text-sm font-black text-amber-600">עוד עובדות מעניינות</h3>
                  </div>
                  <ul className="space-y-2">
                    {data.bonusFacts.map((bonus, i) => (
                      <li key={i} className="flex gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3 text-gray-700 text-sm">
                        <span className="text-amber-500 flex-shrink-0">💡</span>
                        <span className="leading-relaxed">{bonus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
