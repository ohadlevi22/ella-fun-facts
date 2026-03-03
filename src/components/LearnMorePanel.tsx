'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Fact } from '@/data/facts';

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

export default function LearnMorePanel({ fact, onClose }: LearnMorePanelProps) {
  const [data, setData] = useState<LearnMoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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
  }, [fact.id, fact.text, fact.emoji]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-300 ${
        visible ? 'bg-black/40' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className={`w-full max-w-lg bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors text-xl"
        >
          ✕
        </button>

        {/* Content */}
        <div className="px-6 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">{fact.emoji}</span>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{fact.text}</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <p className="text-center text-gray-400 text-lg font-bold">🔍 מחפשת...</p>
              <div className="h-4 bg-gray-200 rounded-full w-full" />
              <div className="h-4 bg-gray-200 rounded-full w-5/6" />
              <div className="h-4 bg-gray-200 rounded-full w-4/6" />
              <div className="h-32 bg-gray-200 rounded-2xl w-full mt-4" />
              <div className="h-4 bg-gray-200 rounded-full w-3/4" />
              <div className="h-4 bg-gray-200 rounded-full w-5/6" />
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

          {/* Content */}
          {data && !loading && (
            <div className="space-y-4">
              {/* Why it's cool */}
              <div className="bg-purple-50 rounded-2xl p-4">
                <h3 className="text-base font-black text-purple-600 mb-2">🤩 למה זה מדהים?</h3>
                <p className="text-gray-700 leading-relaxed">{data.whyItsCool}</p>
              </div>

              {/* How it works */}
              <div className="bg-blue-50 rounded-2xl p-4">
                <h3 className="text-base font-black text-blue-600 mb-2">🔬 איך זה עובד?</h3>
                <p className="text-gray-700 leading-relaxed">{data.howItWorks}</p>
              </div>

              {/* Fun comparison */}
              <div className="bg-green-50 rounded-2xl p-4">
                <h3 className="text-base font-black text-green-600 mb-2">🎯 תדמיינו ש...</h3>
                <p className="text-gray-700 leading-relaxed">{data.funComparison}</p>
              </div>

              {/* YouTube video */}
              {data.youtubeVideoId && (
                <div>
                  <h3 className="text-base font-black text-red-500 mb-3">🎬 סרטון</h3>
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${data.youtubeVideoId}`}
                      title={data.youtubeTitle || 'Video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {data.youtubeTitle && (
                    <p className="text-xs text-gray-400 mt-2 text-center">{data.youtubeTitle}</p>
                  )}
                </div>
              )}

              {/* Bonus facts */}
              {data.bonusFacts.length > 0 && (
                <div>
                  <h3 className="text-base font-black text-amber-500 mb-3">✨ עוד עובדות מעניינות</h3>
                  <ul className="space-y-2">
                    {data.bonusFacts.map((bonus, i) => (
                      <li key={i} className="flex gap-2 bg-amber-50 rounded-xl p-3 text-gray-700">
                        <span className="text-amber-500 flex-shrink-0">💡</span>
                        <span>{bonus}</span>
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
