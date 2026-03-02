import { facts, getFactsByCategory, CategoryId, Fact } from './facts';

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

function truncate(text: string, max: number = 60): string {
  const clean = text.replace(/[.!]$/, '');
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '...';
}

// Modify a fact's number to create a plausible but false version
function modifyFactNumber(text: string, rng: () => number): string | null {
  const numberMatch = text.match(/(\d[\d,.]*)/);
  if (!numberMatch) return null;

  const original = numberMatch[1];
  const num = parseFloat(original.replace(/,/g, ''));
  if (isNaN(num) || num === 0) return null;

  const multipliers = [0.25, 0.33, 0.5, 2, 3, 4, 5];
  const idx = Math.floor(rng() * multipliers.length);
  const wrongNum = Math.max(1, Math.round(num * multipliers[idx]));

  if (wrongNum === num) return null;

  return text.replace(original, formatNumber(wrongNum));
}

function generateCategoryQuestion(fact: Fact): QuizQuestion {
  const rng = seededRandom(fact.id * 7 + 31);
  const correctText = truncate(fact.text);
  const wrongAnswers: string[] = [];

  // Get facts from SAME category - modify their numbers to make them false
  const sameCategoryFacts = facts.filter(f => f.category === fact.category && f.id !== fact.id);
  const shuffledSame = [...sameCategoryFacts].sort(() => rng() - 0.5);

  for (const f of shuffledSame) {
    if (wrongAnswers.length >= 3) break;
    const modified = modifyFactNumber(f.text, rng);
    if (modified) {
      const truncated = truncate(modified);
      if (truncated !== correctText) {
        wrongAnswers.push(truncated);
      }
    }
  }

  // Fallback: modify facts from other categories if needed
  if (wrongAnswers.length < 3) {
    const otherFacts = facts.filter(f => f.category !== fact.category);
    const shuffledOther = [...otherFacts].sort(() => rng() - 0.5);
    for (const f of shuffledOther) {
      if (wrongAnswers.length >= 3) break;
      const modified = modifyFactNumber(f.text, rng);
      if (modified) {
        wrongAnswers.push(truncate(modified));
      }
    }
  }

  return {
    id: fact.id,
    question: 'איזו עובדה נכונה?',
    correctAnswer: correctText,
    wrongAnswers: wrongAnswers.slice(0, 3),
    emoji: fact.emoji,
    factId: fact.id,
  };
}

function generateTrueFalseQuestion(fact: Fact): QuizQuestion | null {
  const rng = seededRandom(fact.id * 13 + 47);

  // 50% chance: show the real fact (answer: נכון), 50%: show modified (answer: לא נכון)
  const showReal = rng() > 0.5;

  if (showReal) {
    return {
      id: fact.id,
      question: `נכון או לא? ${truncate(fact.text, 80)}`,
      correctAnswer: 'נכון! ✅',
      wrongAnswers: ['לא נכון ❌'],
      emoji: fact.emoji,
      factId: fact.id,
    };
  }

  // Modify the fact to make it false
  const modified = modifyFactNumber(fact.text, rng);
  if (!modified) return null;

  return {
    id: fact.id,
    question: `נכון או לא? ${truncate(modified, 80)}`,
    correctAnswer: 'לא נכון ❌',
    wrongAnswers: ['נכון! ✅'],
    emoji: fact.emoji,
    factId: fact.id,
  };
}

function buildQuizQuestion(fact: Fact, questionIndex: number): QuizQuestion {
  // Rotate between question types based on index for variety
  const typeSelector = questionIndex % 3;

  if (typeSelector === 0) {
    // Try number-based question first
    const numberQ = generateNumberQuestion(fact);
    if (numberQ) return numberQ;
  }

  if (typeSelector === 1) {
    // Try true/false
    const tfQ = generateTrueFalseQuestion(fact);
    if (tfQ) return tfQ;
  }

  // Try number question as second attempt
  const numberQ = generateNumberQuestion(fact);
  if (numberQ) return numberQ;

  // Fall back to "which fact is correct" style
  return generateCategoryQuestion(fact);
}

export function getQuizByCategory(categoryId: CategoryId, limit?: number): QuizQuestion[] {
  const categoryFacts = getFactsByCategory(categoryId);
  const questions = categoryFacts.map((fact, i) => buildQuizQuestion(fact, i));
  if (limit && limit < questions.length) {
    return shuffleArray(questions).slice(0, limit);
  }
  return questions;
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
