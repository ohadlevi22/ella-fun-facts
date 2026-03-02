# Learn More Feature - Design Document

**Date**: 2026-03-02
**Status**: Approved

## Overview

Add a "Learn More" button to every fact card. When tapped, a slide-up panel shows an AI-generated kid-friendly explanation, a relevant YouTube video, and bonus facts.

## Decisions

| Aspect | Decision |
|--------|----------|
| Content source | AI-generated on demand (Gemini) |
| AI provider | Google Gemini (free tier, 60 req/min) |
| Video source | YouTube Data API (server-side search) |
| UI pattern | Slide-up panel (~80% of screen) |
| Backend | Vercel serverless API route (`/api/learn-more`) |
| Caching | localStorage by factId (permanent) |
| Static export | Remove `output: "export"` - switch to standard Next.js on Vercel |

## API Design

### `GET /api/learn-more?factId=123&text=...&emoji=...`

Response:
```json
{
  "explanation": "Hebrew explanation in 3-4 paragraphs with emojis",
  "bonusFacts": ["bonus 1", "bonus 2", "bonus 3"],
  "youtubeVideoId": "abc123",
  "youtubeTitle": "Video title"
}
```

### Flow

1. Frontend sends fact text + emoji to API route
2. API calls Gemini with structured prompt: "explain to a 10-year-old girl in Hebrew"
3. Gemini returns: explanation, 3 bonus facts, YouTube search query (English)
4. API calls YouTube Data API with the search query, gets top result
5. API returns combined JSON response

### Gemini Prompt Strategy

- System: fun science teacher for a 10-year-old girl, Hebrew
- Request structured JSON: explanation, bonusFacts array, youtubeSearchQuery
- Keep language simple, engaging, with emojis

### Caching

- localStorage key: `learn-more-{factId}`
- Cache forever (facts are static)
- Check cache before API call

## Slide-Up Panel UI

- Covers ~80% of screen, slides up from bottom
- Drag handle bar at top
- Close button (X) or swipe down to dismiss
- Scrollable content area

### Content sections:
1. Header: fact emoji + truncated fact text
2. Explanation: 3-4 paragraphs, kid-friendly Hebrew with emojis
3. YouTube video: 16:9 embedded player
4. Bonus facts: 3 related fun facts as bullet points

### States:
- **Loading**: Skeleton animation + "...מחפשת" text
- **Loaded**: Full content
- **Error**: "אופס, משהו השתבש" + retry button

## File Changes

| File | Change |
|------|--------|
| `next.config.ts` | Remove `output: "export"` |
| `src/components/FactCard.tsx` | Add "ספרי לי עוד!" button |
| `src/app/api/learn-more/route.ts` | **New** - API route (Gemini + YouTube) |
| `src/components/LearnMorePanel.tsx` | **New** - Slide-up panel component |

## Environment Variables

- `GEMINI_API_KEY` (server-side only, Vercel env var)
- `YOUTUBE_API_KEY` (server-side only, Vercel env var)

## Impact on Existing Features

- Multiplayer: unaffected (all client-side Firebase)
- Solo game: unaffected
- Category pages: switch from static to dynamic rendering (no visible difference)
- Favorites: unaffected
