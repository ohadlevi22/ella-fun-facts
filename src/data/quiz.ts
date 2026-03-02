import { facts, getFactsByCategory, getCategoryById, CategoryId, Fact } from './facts';

export interface QuizQuestion {
  id: number;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  emoji: string;
  factId: number;
}

// Seeded random for deterministic wrong answers per fact
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateNumberQuestion(fact: Fact): QuizQuestion | null {
  const numberMatch = fact.text.match(
    /(\d[\d,.]*)\s*(מיליון|מיליארד|אלף|מעלות|קמ"ש|קילומטר|מטר|סנטימטר|מילימטר|שנה|שנים|דקות|שניות|שעות|טון|קילו|קילוגרם|ליטר|אחוז|נוסעים|מכולות|איים|אגמים|שפות|ימים|חודשים|פגזים|אותיות|מילים|חרקים|דולר)/
  );

  if (!numberMatch) return null;

  const num = numberMatch[1];
  const unit = numberMatch[2];
  const numVal = parseFloat(num.replace(/,/g, ''));

  // Generate wrong number alternatives
  const alternatives = generateNumberAlternatives(numVal);
  if (alternatives.length < 3) return null;

  const wrongs = alternatives.slice(0, 3).map(a => `${formatNumber(a)} ${unit}`);
  const correct = `${num} ${unit}`;

  // Make sure no wrong answer equals the correct answer
  if (wrongs.some(w => w === correct)) return null;

  // Create question by removing the number from the text
  const escaped = num.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const q = fact.text
    .replace(/[.!]$/, '')
    .replace(new RegExp(`${escaped}\\s*${unit}`), '___');

  if (!q.includes('___')) return null;

  return {
    id: fact.id,
    question: `מה המספר החסר? ${q}`,
    correctAnswer: correct,
    wrongAnswers: wrongs,
    emoji: fact.emoji,
    factId: fact.id,
  };
}

function generateNumberAlternatives(num: number): number[] {
  const results: Set<number> = new Set();
  const multipliers = num >= 1000
    ? [0.2, 0.5, 0.7, 1.5, 2.5, 3, 5]
    : num >= 10
    ? [0.3, 0.5, 0.7, 1.5, 2, 3, 4]
    : [0.25, 0.5, 2, 3, 4, 5, 10];

  for (const m of multipliers) {
    const alt = Math.max(1, Math.round(num * m));
    if (alt !== num) results.add(alt);
    if (results.size >= 3) break;
  }

  return [...results];
}

function formatNumber(num: number): string {
  return num.toLocaleString('he-IL');
}

function generateCategoryQuestion(fact: Fact): QuizQuestion {
  const category = getCategoryById(fact.category);
  const categoryName = category?.name || '';
  const rng = seededRandom(fact.id * 7 + 31);

  // Get facts from OTHER categories for wrong answers
  const otherFacts = facts.filter(f => f.category !== fact.category);

  // Pick 3 random wrong facts deterministically
  const shuffled = [...otherFacts].sort(() => rng() - 0.5);
  const wrongFacts = shuffled.slice(0, 3);

  // Truncate long facts for readability
  const truncate = (text: string, max: number = 60) => {
    const clean = text.replace(/[.!]$/, '');
    if (clean.length <= max) return clean;
    return clean.slice(0, max).replace(/\s+\S*$/, '') + '...';
  };

  return {
    id: fact.id,
    question: `איזו עובדה נכונה על ${categoryName}?`,
    correctAnswer: truncate(fact.text),
    wrongAnswers: wrongFacts.map(f => truncate(f.text)),
    emoji: fact.emoji,
    factId: fact.id,
  };
}

function buildQuizQuestion(fact: Fact): QuizQuestion {
  // Try number-based question first
  const numberQ = generateNumberQuestion(fact);
  if (numberQ) return numberQ;

  // Fall back to "which fact is correct" style
  return generateCategoryQuestion(fact);
}

export function getQuizByCategory(categoryId: CategoryId): QuizQuestion[] {
  const categoryFacts = getFactsByCategory(categoryId);
  return categoryFacts.map(buildQuizQuestion);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getShuffledAnswers(question: QuizQuestion): string[] {
  const answers = shuffleArray([question.correctAnswer, ...question.wrongAnswers]);
  // Deduplicate - if any wrong answer equals the correct, replace it
  const seen = new Set<string>();
  return answers.map((a, i) => {
    if (seen.has(a)) {
      return `${a} (${i + 1})`;
    }
    seen.add(a);
    return a;
  });
}
