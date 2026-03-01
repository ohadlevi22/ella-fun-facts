import { facts, getFactsByCategory, CategoryId } from './facts';

export interface QuizQuestion {
  id: number;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  emoji: string;
  factId: number;
}

interface QuestionTemplate {
  question: string;
  correct: string;
  wrongs: string[];
}

function generateFromFact(factId: number, text: string, emoji: string): QuestionTemplate | null {
  // Match patterns: number + unit
  const numberMatch = text.match(/(\d[\d,.]*)\s*(מיליון|מיליארד|אלף|מעלות|קמ"ש|קילומטר|מטר|סנטימטר|שנה|שנים|דקות|שניות|שעות|טון|קילו|ליטר|אחוז|נוסעים|מכולות|איים|אגמים|שפות|ימים)/);

  if (numberMatch) {
    const num = numberMatch[1];
    const unit = numberMatch[2];
    const numVal = parseFloat(num.replace(/,/g, ''));

    const alternatives = generateNumberAlternatives(numVal);
    const wrongs = alternatives.map(a => `${formatNumber(a)} ${unit}`);

    // Create question by removing the number
    const q = text.replace(/[.!]$/, '').replace(new RegExp(`${num.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*${unit}`), '___');

    if (q.includes('___')) {
      return {
        question: `מה המספר החסר? ${q}`,
        correct: `${num} ${unit}`,
        wrongs,
      };
    }
  }

  // Match name/place patterns
  const namePatterns = [
    { regex: /^(.*)\s+הו?[אי][הא]?\s+(ה.+)\s+ב/, q: (m: RegExpMatchArray) => `מה ${m[2]}?`, c: (t: string) => t.replace(/[.!]$/, '') },
    { regex: /נקרא[ת]?\s+"([^"]+)"/, q: () => 'מה השם הנכון?', c: (_t: string, m: RegExpMatchArray) => m[1] },
  ];

  for (const p of namePatterns) {
    const m = text.match(p.regex);
    if (m) {
      return {
        question: text.replace(/[.!]$/, '') + '?',
        correct: 'נכון',
        wrongs: ['לא נכון', 'אולי', 'לא בטוח'],
      };
    }
  }

  // Default: true/false style
  return {
    question: text.replace(/[.!]$/, '') + ' - נכון או לא?',
    correct: 'נכון!',
    wrongs: generateFalseStatements(text),
  };
}

function generateNumberAlternatives(num: number): number[] {
  const results: number[] = [];
  if (num >= 1000) {
    results.push(Math.round(num * 0.3));
    results.push(Math.round(num * 2.5));
    results.push(Math.round(num * 0.6));
  } else if (num >= 10) {
    results.push(Math.round(num * 0.4));
    results.push(Math.round(num * 3));
    results.push(Math.round(num * 0.7));
  } else {
    results.push(Math.max(1, Math.round(num * 0.3)));
    results.push(Math.round(num * 4));
    results.push(Math.round(num * 2));
  }
  return results.filter(r => r !== num);
}

function formatNumber(num: number): string {
  return num.toLocaleString('he-IL');
}

function generateFalseStatements(_text: string): string[] {
  const falses = [
    'לא נכון - זה הפוך!',
    'לא נכון - המספר שונה!',
    'לא נכון - זה לא מדויק!',
  ];
  return falses;
}

// Generate all quiz questions from facts
function buildQuizQuestions(): QuizQuestion[] {
  return facts.map((fact) => {
    const template = generateFromFact(fact.id, fact.text, fact.emoji);
    if (!template) {
      return {
        id: fact.id,
        question: fact.text.replace(/[.!]$/, '') + ' - נכון או לא?',
        correctAnswer: 'נכון!',
        wrongAnswers: ['לא נכון - זה הפוך!', 'לא נכון - המספר שונה!', 'לא נכון - זה לא מדויק!'],
        emoji: fact.emoji,
        factId: fact.id,
      };
    }
    return {
      id: fact.id,
      question: template.question,
      correctAnswer: template.correct,
      wrongAnswers: template.wrongs.slice(0, 3),
      emoji: fact.emoji,
      factId: fact.id,
    };
  });
}

const allQuestions = buildQuizQuestions();

export function getQuizByCategory(categoryId: CategoryId): QuizQuestion[] {
  const categoryFacts = getFactsByCategory(categoryId);
  const factIds = new Set(categoryFacts.map(f => f.id));
  return allQuestions.filter(q => factIds.has(q.factId));
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
  return shuffleArray([question.correctAnswer, ...question.wrongAnswers]);
}
