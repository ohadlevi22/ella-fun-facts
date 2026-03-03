import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

interface LearnMoreResponse {
  whyItsCool: string;
  howItWorks: string;
  funComparison: string;
  bonusFacts: string[];
  youtubeVideoId: string | null;
  youtubeTitle: string | null;
}

async function generateExplanation(factText: string, emoji: string): Promise<{
  whyItsCool: string;
  howItWorks: string;
  funComparison: string;
  bonusFacts: string[];
  youtubeSearchQuery: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const prompt = `אתה מורה מדעים מהנה שמסביר לילדות בנות 10-13 בשם אלה ושקד.
הן קראו את העובדה הזו: ${emoji} ${factText}

כתוב תשובה בפורמט JSON בלבד (בלי markdown, בלי backticks):
{
  "whyItsCool": "2-3 משפטים בעברית - למה העובדה הזו מדהימה ומעניינת? תשתמש בשפה נלהבת עם אימוג'ים",
  "howItWorks": "3-4 משפטים בעברית - איך זה עובד? ההסבר המדעי בשפה פשוטה וברורה עם אימוג'ים",
  "funComparison": "1-2 משפטים בעברית - השוואה מצחיקה או מפתיעה שעוזרת להבין את הגודל/המשמעות. למשל: 'זה כאילו...' או 'תדמיינו ש...'",
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
      whyItsCool: geminiResult.whyItsCool,
      howItWorks: geminiResult.howItWorks,
      funComparison: geminiResult.funComparison,
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
