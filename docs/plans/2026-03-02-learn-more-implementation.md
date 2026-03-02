# Learn More Feature - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Learn More" button to every fact card that opens a slide-up panel with AI-generated explanations (Gemini), YouTube videos, and bonus facts.

**Architecture:** Vercel serverless API route calls Gemini for kid-friendly Hebrew explanations and YouTube Data API for relevant videos. Results cached in localStorage. Slide-up panel component with loading/error states.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Google Gemini API, YouTube Data API v3

---

## Task 1: Remove Static Export

**Files:**
- Modify: `next.config.ts`

**Step 1: Remove output: "export"**

In `next.config.ts`, change:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

To:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

**Step 2: Verify build passes**

```bash
npx next build
```

Expected: Build succeeds. Category pages and game pages still work. The `generateStaticParams` in category pages will still pre-render those routes.

**Step 3: Verify dev server works**

```bash
npx next dev
```

Visit `http://localhost:3000` and click through a few pages to verify nothing broke.

**Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat: remove static export to enable API routes"
```

---

## Task 2: Install Google Generative AI SDK

**Files:**
- Modify: `package.json`

**Step 1: Install the SDK**

```bash
npm install @google/generative-ai
```

**Step 2: Verify build passes**

```bash
npx next build
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add Google Generative AI SDK"
```

---

## Task 3: Create the Learn More API Route

**Files:**
- Create: `src/app/api/learn-more/route.ts`

**Step 1: Create the API route**

Create `src/app/api/learn-more/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

interface LearnMoreResponse {
  explanation: string;
  bonusFacts: string[];
  youtubeVideoId: string | null;
  youtubeTitle: string | null;
}

async function generateExplanation(factText: string, emoji: string): Promise<{
  explanation: string;
  bonusFacts: string[];
  youtubeSearchQuery: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `אתה מורה מדעים מהנה שמסביר לילדה בת 10 בשם אלה.
היא קראה את העובדה הזו: ${emoji} ${factText}

כתוב תשובה בפורמט JSON בלבד (בלי markdown, בלי backticks):
{
  "explanation": "הסבר מפורט בעברית ב-3-4 פסקאות. תשתמש בשפה פשוטה וכיפית עם אימוג'ים. תסביר למה זה מעניין ואיך זה עובד.",
  "bonusFacts": ["עובדה מעניינת נוספת 1", "עובדה מעניינת נוספת 2", "עובדה מעניינת נוספת 3"],
  "youtubeSearchQuery": "English search query to find a YouTube video explaining this topic for kids"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Parse JSON - handle potential markdown wrapping
  const jsonStr = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(jsonStr);
}

async function searchYouTube(query: string): Promise<{ videoId: string; title: string } | null> {
  if (!YOUTUBE_API_KEY) return null;

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query + ' for kids',
      type: 'video',
      maxResults: '1',
      safeSearch: 'strict',
      relevanceLanguage: 'en',
      videoEmbeddable: 'true',
      key: YOUTUBE_API_KEY,
    });

    const res = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
    if (!res.ok) return null;

    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    return {
      videoId: item.id.videoId,
      title: item.snippet.title,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const factText = searchParams.get('text');
  const emoji = searchParams.get('emoji') || '';

  if (!factText) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  try {
    const geminiResult = await generateExplanation(factText, emoji);
    const youtubeResult = await searchYouTube(geminiResult.youtubeSearchQuery);

    const response: LearnMoreResponse = {
      explanation: geminiResult.explanation,
      bonusFacts: geminiResult.bonusFacts,
      youtubeVideoId: youtubeResult?.videoId || null,
      youtubeTitle: youtubeResult?.title || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Learn more API error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
```

**Step 2: Add environment variables to .env.local**

Add to `.env.local`:

```
GEMINI_API_KEY=your-gemini-api-key
YOUTUBE_API_KEY=your-youtube-api-key
```

**Step 3: Verify build passes**

```bash
npx next build
```

**Step 4: Commit**

```bash
git add src/app/api/learn-more/route.ts
git commit -m "feat: add learn-more API route with Gemini and YouTube"
```

---

## Task 4: Create the LearnMorePanel Component

**Files:**
- Create: `src/components/LearnMorePanel.tsx`
- Modify: `src/app/globals.css` (add slide-up animation)

**Step 1: Create the component**

Create `src/components/LearnMorePanel.tsx`:

```typescript
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Fact } from '@/data/facts';

interface LearnMoreData {
  explanation: string;
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
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCache(factId: number, data: LearnMoreData): void {
  try {
    localStorage.setItem(getCacheKey(factId), JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
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

    // Check cache first
    const cached = getCached(fact.id);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        text: fact.text,
        emoji: fact.emoji,
      });
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

  // Close on backdrop click
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

          {/* Loading state */}
          {loading && (
            <div className="space-y-4 animate-pulse">
              <p className="text-center text-gray-400 text-lg font-bold">...🔍 מחפשת</p>
              <div className="h-4 bg-gray-200 rounded-full w-full" />
              <div className="h-4 bg-gray-200 rounded-full w-5/6" />
              <div className="h-4 bg-gray-200 rounded-full w-4/6" />
              <div className="h-32 bg-gray-200 rounded-2xl w-full mt-4" />
              <div className="h-4 bg-gray-200 rounded-full w-3/4" />
              <div className="h-4 bg-gray-200 rounded-full w-5/6" />
            </div>
          )}

          {/* Error state */}
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
            <>
              {/* Explanation */}
              <div className="mb-6">
                <h3 className="text-lg font-black text-purple-600 mb-3">📖 הסבר</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {data.explanation}
                </div>
              </div>

              {/* YouTube video */}
              {data.youtubeVideoId && (
                <div className="mb-6">
                  <h3 className="text-lg font-black text-red-500 mb-3">🎬 סרטון</h3>
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
                  <h3 className="text-lg font-black text-amber-500 mb-3">✨ עוד עובדות מעניינות</h3>
                  <ul className="space-y-2">
                    {data.bonusFacts.map((bonus, i) => (
                      <li
                        key={i}
                        className="flex gap-2 bg-amber-50 rounded-xl p-3 text-gray-700"
                      >
                        <span className="text-amber-500 flex-shrink-0">💡</span>
                        <span>{bonus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify build passes**

```bash
npx next build
```

**Step 3: Commit**

```bash
git add src/components/LearnMorePanel.tsx
git commit -m "feat: add learn-more slide-up panel component"
```

---

## Task 5: Add "Learn More" Button to FactCard

**Files:**
- Modify: `src/components/FactCard.tsx`
- Modify: `src/components/CategoryPageClient.tsx`

**Step 1: Add the button and callback to FactCard**

In `src/components/FactCard.tsx`, add `onLearnMore` to the props interface:

```typescript
interface FactCardProps {
  fact: Fact;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLearnMore?: () => void;
}
```

Update the function signature to include `onLearnMore`:

```typescript
export default function FactCard({ fact, isFavorite, onToggleFavorite, onSwipeLeft, onSwipeRight, onLearnMore }: FactCardProps) {
```

Add the button after the fact text (after line 84, before the swipe hints), inside the card div:

```tsx
        {/* Learn more button */}
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            🔍 ספרי לי עוד!
          </button>
        )}
```

**Step 2: Wire up in CategoryPageClient**

In `src/components/CategoryPageClient.tsx`, add state and import:

Add import at top:
```typescript
import LearnMorePanel from '@/components/LearnMorePanel';
```

Add state:
```typescript
const [learnMoreFact, setLearnMoreFact] = useState<typeof categoryFacts[0] | null>(null);
```

Add `onLearnMore` prop to the FactCard:
```tsx
<FactCard
  fact={currentFact}
  isFavorite={isFavorite(currentFact.id)}
  onToggleFavorite={toggleFavorite}
  onSwipeLeft={goToNext}
  onSwipeRight={goToPrev}
  onLearnMore={() => setLearnMoreFact(currentFact)}
/>
```

Add the panel at the end of the `<main>` element (before closing `</main>`):
```tsx
{learnMoreFact && (
  <LearnMorePanel
    fact={learnMoreFact}
    onClose={() => setLearnMoreFact(null)}
  />
)}
```

**Step 3: Verify build passes**

```bash
npx next build
```

**Step 4: Commit**

```bash
git add src/components/FactCard.tsx src/components/CategoryPageClient.tsx
git commit -m "feat: add learn-more button to fact cards with panel integration"
```

---

## Task 6: Add Environment Variables & Deploy

**Step 1: Add API keys to .env.local**

The user needs to:
1. Get a Gemini API key from https://aistudio.google.com/apikey
2. Get a YouTube Data API key from https://console.cloud.google.com (enable YouTube Data API v3)

Add to `.env.local`:
```
GEMINI_API_KEY=<actual-key>
YOUTUBE_API_KEY=<actual-key>
```

**Step 2: Add API keys to Vercel**

```bash
printf '<gemini-key>' | npx vercel env add GEMINI_API_KEY production --yes
printf '<youtube-key>' | npx vercel env add YOUTUBE_API_KEY production --yes
```

**Step 3: Test locally**

```bash
npx next dev
```

Visit a category page, click "ספרי לי עוד!" on a fact, verify:
- Loading skeleton appears
- Explanation loads in Hebrew
- YouTube video embeds and plays
- Bonus facts show
- Clicking the same fact again loads from cache (instant)
- Close button and backdrop click work

**Step 4: Deploy**

```bash
npx vercel --prod --yes
```

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "polish: learn-more feature refinements"
```

---

## Task Order & Dependencies

```
Task 1 (Remove static export) ──> Task 2 (Install SDK) ──> Task 3 (API route)
                                                                    |
                                                                    v
                                                          Task 4 (Panel component)
                                                                    |
                                                                    v
                                                          Task 5 (Wire up button)
                                                                    |
                                                                    v
                                                          Task 6 (Env vars & deploy)
```

All tasks are sequential - each depends on the previous one.
