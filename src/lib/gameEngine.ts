import { ref, set, update, get, onValue, off, serverTimestamp } from 'firebase/database';
import { db } from './firebase';
import { getQuizByCategory, shuffleArray, QuizQuestion, getShuffledAnswers } from '@/data/quiz';
import { CategoryId } from '@/data/facts';

export interface GameQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  emoji: string;
}

export interface PlayerAnswer {
  answer: string;
  correct: boolean;
  answeredAt: number;
  points: number;
}

const TIME_PER_QUESTION = 20000; // 20 seconds

export function calculatePoints(timeToAnswerMs: number, correct: boolean, streak: number): number {
  if (!correct) return 0;
  const base = Math.max(100, Math.round(1000 - (timeToAnswerMs / 20)));
  const multiplier = streak >= 3 ? 1.5 : streak >= 2 ? 1.2 : 1;
  return Math.round(base * multiplier);
}

export async function startGame(roomCode: string, category: string, roundLength: number): Promise<void> {
  // Generate questions
  let allQuestions: QuizQuestion[];
  if (category === 'all') {
    const categories: CategoryId[] = ['space', 'nature', 'animals', 'vehicles', 'airplanes', 'ships', 'food', 'cultures', 'countries'];
    const perCategory = Math.ceil(roundLength / categories.length);
    allQuestions = [];
    for (const cat of categories) {
      const catQuestions = shuffleArray(getQuizByCategory(cat)).slice(0, perCategory);
      allQuestions.push(...catQuestions);
    }
    allQuestions = shuffleArray(allQuestions).slice(0, roundLength);
  } else {
    allQuestions = shuffleArray(getQuizByCategory(category as CategoryId)).slice(0, roundLength);
  }

  // Write questions to Firebase (without correctAnswer exposed in options position)
  const gameQuestions: Record<string, GameQuestion> = {};
  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];
    gameQuestions[String(i)] = {
      question: q.question,
      correctAnswer: q.correctAnswer,
      options: getShuffledAnswers(q),
      emoji: q.emoji,
    };
  }

  await set(ref(db, `rooms/${roomCode}/questions`), gameQuestions);
  await update(ref(db, `rooms/${roomCode}`), {
    status: 'playing',
    currentQuestion: 0,
    questionStartedAt: serverTimestamp(),
  });
}

export async function submitAnswer(
  roomCode: string,
  uid: string,
  questionIndex: number,
  answer: string,
  questionStartedAt: number,
): Promise<number> {
  const now = Date.now();
  const timeToAnswer = now - questionStartedAt;

  // Get the correct answer
  const qSnap = await get(ref(db, `rooms/${roomCode}/questions/${questionIndex}/correctAnswer`));
  const correctAnswer = qSnap.val();
  const correct = answer === correctAnswer;

  // Get current streak
  const streakSnap = await get(ref(db, `rooms/${roomCode}/players/${uid}/streak`));
  const currentStreak = streakSnap.val() || 0;
  const newStreak = correct ? currentStreak + 1 : 0;

  const points = calculatePoints(timeToAnswer, correct, correct ? newStreak : 0);

  // Write answer
  await set(ref(db, `rooms/${roomCode}/players/${uid}/answers/${questionIndex}`), {
    answer,
    correct,
    answeredAt: now,
    points,
  });

  // Update player score and streak
  const scoreSnap = await get(ref(db, `rooms/${roomCode}/players/${uid}/score`));
  const currentScore = scoreSnap.val() || 0;

  await update(ref(db, `rooms/${roomCode}/players/${uid}`), {
    score: currentScore + points,
    streak: newStreak,
  });

  return points;
}

export async function advanceQuestion(roomCode: string, currentQuestion: number, roundLength: number): Promise<void> {
  const nextQuestion = currentQuestion + 1;
  if (nextQuestion >= roundLength) {
    await update(ref(db, `rooms/${roomCode}`), { status: 'finished' });
  } else {
    await update(ref(db, `rooms/${roomCode}`), {
      currentQuestion: nextQuestion,
      questionStartedAt: serverTimestamp(),
    });
  }
}

export function onAnswersChange(
  roomCode: string,
  questionIndex: number,
  callback: (answers: Record<string, PlayerAnswer>) => void
): () => void {
  const answersPath = `rooms/${roomCode}/players`;
  const playersRef = ref(db, answersPath);
  const handler = onValue(playersRef, (snapshot) => {
    const players = snapshot.val() || {};
    const answers: Record<string, PlayerAnswer> = {};
    for (const [uid, playerData] of Object.entries(players as Record<string, any>)) {
      if (playerData.answers && playerData.answers[questionIndex]) {
        answers[uid] = playerData.answers[questionIndex];
      }
    }
    callback(answers);
  });
  return () => off(playersRef, 'value', handler);
}
