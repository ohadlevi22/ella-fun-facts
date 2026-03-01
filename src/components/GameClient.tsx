'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { getCategoryById, CategoryId } from '@/data/facts';
import { getQuizByCategory, getShuffledAnswers, shuffleArray, QuizQuestion } from '@/data/quiz';

type GameState = 'playing' | 'answered' | 'finished';

export default function GameClient({ categoryId }: { categoryId: CategoryId }) {
  const category = getCategoryById(categoryId);
  const questions = useMemo(() => shuffleArray(getQuizByCategory(categoryId)), [categoryId]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>(() =>
    questions.length > 0 ? getShuffledAnswers(questions[0]) : []
  );

  const currentQuestion = questions[currentIndex] as QuizQuestion | undefined;

  const handleAnswer = useCallback((answer: string) => {
    if (gameState !== 'playing' || !currentQuestion) return;

    const correct = answer === currentQuestion.correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setGameState('answered');
  }, [gameState, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setGameState('finished');
      return;
    }
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setShuffledAnswers(getShuffledAnswers(questions[nextIdx]));
    setSelectedAnswer(null);
    setGameState('playing');
  }, [currentIndex, questions]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setGameState('playing');
    setSelectedAnswer(null);
    setShuffledAnswers(getShuffledAnswers(questions[0]));
  }, [questions]);

  if (!category || questions.length === 0 || !currentQuestion) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-2xl mb-4">🤔 לא נמצאו שאלות</p>
          <Link href="/game" className="text-purple-600 underline">חזרה למשחק</Link>
        </div>
      </main>
    );
  }

  // Finished screen
  if (gameState === 'finished') {
    const percentage = Math.round((score / questions.length) * 100);
    const getEmoji = () => {
      if (percentage >= 90) return '🏆';
      if (percentage >= 70) return '🌟';
      if (percentage >= 50) return '👍';
      return '💪';
    };
    const getMessage = () => {
      if (percentage >= 90) return 'מדהים! את גאונית!';
      if (percentage >= 70) return 'כל הכבוד! עבודה מעולה!';
      if (percentage >= 50) return 'יופי! יש מקום לשיפור!';
      return 'לא נורא, נסי שוב!';
    };

    return (
      <main className="min-h-dvh px-6 py-8 flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
          <span className="text-8xl block mb-4">{getEmoji()}</span>
          <h1 className="text-3xl font-black mb-2">{getMessage()}</h1>
          <p className="text-xl text-gray-600 mb-6">
            {score} מתוך {questions.length} תשובות נכונות
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div
              className={`h-4 rounded-full transition-all duration-1000 ${
                percentage >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                percentage >= 50 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                'bg-gradient-to-r from-red-400 to-pink-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-4xl font-black text-purple-600 mb-8">{percentage}%</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRestart}
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg bg-gradient-to-r ${category.gradient} hover:scale-105 active:scale-95 transition-all`}
            >
              🔄 שחקי שוב!
            </button>
            <Link
              href="/game"
              className="w-full py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold text-lg text-center hover:bg-gray-200 transition-all"
            >
              🎮 בחרי קטגוריה אחרת
            </Link>
            <Link
              href="/"
              className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
            >
              🏠 חזרה הביתה
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-6 py-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-6">
        <Link
          href="/game"
          className="w-12 h-12 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-2xl shadow-md hover:bg-white hover:scale-110 transition-all"
        >
          →
        </Link>
        <h1 className={`text-xl font-black bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`}>
          🎮 {category.emoji} {category.name}
        </h1>
        <div className="text-center">
          <span className="text-sm text-gray-500 font-bold bg-white/60 px-3 py-1 rounded-full block">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-500">ניקוד: {score}</span>
          <span className="text-sm text-gray-400">{Math.round(((currentIndex) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 bg-gradient-to-r ${category.gradient}`}
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-xl p-6 max-w-sm w-full mb-6">
        <span className="text-5xl block text-center mb-4">{currentQuestion.emoji}</span>
        <p className="text-lg text-center leading-relaxed text-gray-700 font-medium">
          {currentQuestion.question}
        </p>
      </div>

      {/* Answers */}
      <div className="w-full max-w-sm space-y-3">
        {shuffledAnswers.map((answer, i) => {
          const isSelected = selectedAnswer === answer;
          const isTheCorrect = answer === currentQuestion.correctAnswer;
          const showResult = gameState === 'answered';

          let btnClass = 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200';
          if (showResult && isTheCorrect) {
            btnClass = 'bg-green-50 text-green-700 border-2 border-green-400 ring-2 ring-green-200';
          } else if (showResult && isSelected && !isCorrect) {
            btnClass = 'bg-red-50 text-red-700 border-2 border-red-400 ring-2 ring-red-200';
          } else if (showResult) {
            btnClass = 'bg-gray-50 text-gray-400 border-2 border-gray-100';
          }

          const letters = ['א', 'ב', 'ג', 'ד'];

          return (
            <button
              key={i}
              onClick={() => handleAnswer(answer)}
              disabled={gameState === 'answered'}
              className={`w-full py-4 px-5 rounded-2xl font-medium text-right transition-all ${btnClass} ${
                gameState === 'playing' ? 'active:scale-95 hover:scale-[1.02]' : ''
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  showResult && isTheCorrect ? 'bg-green-400 text-white' :
                  showResult && isSelected && !isCorrect ? 'bg-red-400 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {showResult && isTheCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✗' : letters[i]}
                </span>
                <span>{answer}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback + Next */}
      {gameState === 'answered' && (
        <div className="w-full max-w-sm mt-6 text-center">
          <p className={`text-xl font-bold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
            {isCorrect ? '🎉 נכון! כל הכבוד!' : '😅 לא נכון, בפעם הבאה!'}
          </p>
          <button
            onClick={handleNext}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg bg-gradient-to-r ${category.gradient} hover:scale-105 active:scale-95 transition-all`}
          >
            {currentIndex >= questions.length - 1 ? '🏆 לתוצאות!' : '⬅️ שאלה הבאה'}
          </button>
        </div>
      )}
    </main>
  );
}
