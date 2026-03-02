'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { onRoomChange, onPlayersChange, RoomData, PlayerData } from '@/lib/gameRoom';
import { submitAnswer, advanceQuestion, onAnswersChange, PlayerAnswer, GameQuestion } from '@/lib/gameEngine';
import { AuthUser } from '@/lib/auth';
import { ref, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import CountdownTimer from './CountdownTimer';
import PlayerAvatar from './PlayerAvatar';
import QuestionResults from './QuestionResults';

interface MultiplayerGameProps {
  roomCode: string;
  roomData: RoomData;
  currentUser: AuthUser;
}

type Phase = 'get-ready' | 'question' | 'results';

const QUESTION_DURATION = 20000; // 20 seconds
const GET_READY_DURATION = 3000; // 3 seconds
const RESULTS_DURATION = 4000; // 4 seconds

export default function MultiplayerGame({ roomCode, roomData: initialRoomData, currentUser }: MultiplayerGameProps) {
  const [phase, setPhase] = useState<Phase>('get-ready');
  const [countdown, setCountdown] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState<number>(initialRoomData.currentQuestion);
  const [questionData, setQuestionData] = useState<GameQuestion | null>(null);
  const [players, setPlayers] = useState<Record<string, PlayerData>>({});
  const [answers, setAnswers] = useState<Record<string, PlayerAnswer>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const [showPointsAnim, setShowPointsAnim] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(initialRoomData.questionStartedAt ?? Date.now());
  const [roomData, setRoomData] = useState<RoomData>(initialRoomData);

  const isHost = currentUser.uid === roomData.hostUid;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const currentQuestionRef = useRef(currentQuestion);
  currentQuestionRef.current = currentQuestion;
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const playersRef = useRef(players);
  playersRef.current = players;
  const hasAdvancedRef = useRef(false);

  // Subscribe to room changes (detect currentQuestion changes from host)
  useEffect(() => {
    const unsubscribe = onRoomChange(roomCode, (data) => {
      if (!data) return;
      setRoomData(data);

      // Detect question change (from host advancing)
      if (data.currentQuestion !== currentQuestionRef.current && data.status === 'playing') {
        setCurrentQuestion(data.currentQuestion);
        setQuestionStartedAt(data.questionStartedAt ?? Date.now());
        setSelectedAnswer(null);
        setEarnedPoints(null);
        setShowPointsAnim(false);
        setAnswers({});
        hasAdvancedRef.current = false;
        setPhase('get-ready');
        setCountdown(3);
      }
    });
    return unsubscribe;
  }, [roomCode]);

  // Subscribe to players
  useEffect(() => {
    const unsubscribe = onPlayersChange(roomCode, (playersData) => {
      setPlayers(playersData);
    });
    return unsubscribe;
  }, [roomCode]);

  // Subscribe to answers for the current question
  useEffect(() => {
    const unsubscribe = onAnswersChange(roomCode, currentQuestion, (answersData) => {
      setAnswers(answersData);
    });
    return unsubscribe;
  }, [roomCode, currentQuestion]);

  // Fetch question data from Firebase
  useEffect(() => {
    const qRef = ref(db, `rooms/${roomCode}/questions/${currentQuestion}`);
    const handler = onValue(qRef, (snapshot) => {
      if (snapshot.exists()) {
        setQuestionData(snapshot.val() as GameQuestion);
      }
    });
    return () => off(qRef, 'value', handler);
  }, [roomCode, currentQuestion]);

  // Get-ready countdown
  useEffect(() => {
    if (phase !== 'get-ready') return;

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('question');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Check if all players answered (host responsibility)
  useEffect(() => {
    if (!isHost || phase !== 'question') return;
    const playerCount = Object.keys(playersRef.current).length;
    const answerCount = Object.keys(answers).length;
    if (playerCount > 0 && answerCount >= playerCount && !hasAdvancedRef.current) {
      // All players answered - go to results
      setPhase('results');
    }
  }, [answers, isHost, phase]);

  // Results timer (host advances after 4 seconds)
  useEffect(() => {
    if (phase !== 'results') return;

    const timer = setTimeout(() => {
      if (isHost && !hasAdvancedRef.current) {
        hasAdvancedRef.current = true;
        advanceQuestion(roomCode, currentQuestion, roomData.roundLength);
      }
    }, RESULTS_DURATION);

    return () => clearTimeout(timer);
  }, [phase, isHost, roomCode, currentQuestion, roomData.roundLength]);

  // Handle time up from CountdownTimer
  const handleTimeUp = useCallback(() => {
    if (phaseRef.current === 'question') {
      setPhase('results');
    }
  }, []);

  // Handle answer selection
  const handleAnswer = useCallback(async (answer: string) => {
    if (selectedAnswer !== null || phase !== 'question' || !questionData) return;
    setSelectedAnswer(answer);

    try {
      const points = await submitAnswer(
        roomCode,
        currentUser.uid,
        currentQuestion,
        answer,
        questionStartedAt,
      );
      setEarnedPoints(points);
      setShowPointsAnim(true);
      // Hide the points animation after 1.5s
      setTimeout(() => setShowPointsAnim(false), 1500);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  }, [selectedAnswer, phase, questionData, roomCode, currentUser.uid, currentQuestion, questionStartedAt]);

  const totalQuestions = roomData.roundLength;

  // --- RENDER: Get Ready Phase ---
  if (phase === 'get-ready') {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <p className="text-lg font-bold text-gray-500">
          {currentQuestion + 1} {totalQuestions} מתוך
        </p>
        <div className="text-8xl font-black text-purple-600 animate-bounce">
          {countdown}
        </div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent animate-pulse">
          !התכוננו
        </h1>
      </main>
    );
  }

  // --- RENDER: Results Phase ---
  if (phase === 'results' && questionData) {
    return (
      <main className="min-h-dvh flex flex-col items-center px-6 py-8" dir="rtl">
        <div className="mb-4 text-center">
          <p className="text-sm font-bold text-gray-500">
            {currentQuestion + 1} {totalQuestions} מתוך
          </p>
          <h2 className="text-2xl font-black text-gray-800">תוצאות</h2>
        </div>
        <QuestionResults
          question={questionData}
          players={players}
          answers={answers}
          currentUserUid={currentUser.uid}
        />
        <p className="mt-6 text-gray-400 text-sm animate-pulse">
          {currentQuestion + 1 < totalQuestions ? '...ממשיכים לשאלה הבאה' : '...מסכמים תוצאות'}
        </p>
      </main>
    );
  }

  // --- RENDER: Question Phase ---
  if (!questionData) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-6xl animate-bounce">🎲</div>
        <p className="text-2xl font-black text-gray-600">...טוענת שאלה</p>
      </main>
    );
  }

  const isTrueFalse = questionData.options.length === 2;
  const hasAnswered = selectedAnswer !== null;
  const letters = ['א', 'ב', 'ג', 'ד'];

  return (
    <main className="min-h-dvh flex flex-col items-center px-6 py-6" dir="rtl">
      {/* Header: question counter */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-500 bg-white/60 px-3 py-1 rounded-full">
          {currentQuestion + 1} / {totalQuestions}
        </span>
      </div>

      {/* Player avatar strip */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-center gap-3 flex-wrap">
          {Object.entries(players).map(([uid, player]) => (
            <PlayerAvatar
              key={uid}
              name={player.name}
              photo={player.photo}
              answered={!!answers[uid]}
              score={player.score}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Countdown timer */}
      <div className="mb-4">
        <CountdownTimer
          duration={QUESTION_DURATION}
          startedAt={questionStartedAt}
          onTimeUp={handleTimeUp}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-3xl shadow-xl p-6 max-w-md w-full mb-6">
        <span className="text-5xl block text-center mb-4">{questionData.emoji}</span>
        <p className="text-lg text-center leading-relaxed text-gray-700 font-medium">
          {questionData.question}
        </p>
      </div>

      {/* Answer buttons */}
      <div className={`w-full max-w-md ${isTrueFalse ? 'flex gap-3' : 'space-y-3'}`}>
        {questionData.options.map((answer, i) => {
          const isSelected = selectedAnswer === answer;
          const isCorrect = answer === questionData.correctAnswer;

          let btnClass = 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200';
          if (hasAnswered && isSelected && isCorrect) {
            btnClass = 'bg-green-50 text-green-700 border-2 border-green-400 ring-2 ring-green-200';
          } else if (hasAnswered && isSelected && !isCorrect) {
            btnClass = 'bg-red-50 text-red-700 border-2 border-red-400 ring-2 ring-red-200';
          } else if (hasAnswered) {
            btnClass = 'bg-gray-50 text-gray-400 border-2 border-gray-100';
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(answer)}
              disabled={hasAnswered}
              className={`${isTrueFalse ? 'flex-1' : 'w-full'} py-4 px-5 rounded-2xl font-medium ${isTrueFalse ? 'text-center' : 'text-right'} transition-all ${btnClass} ${
                !hasAnswered ? 'active:scale-95 hover:scale-[1.02]' : ''
              }`}
            >
              {isTrueFalse ? (
                <span className="text-lg">{answer}</span>
              ) : (
                <span className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      hasAnswered && isSelected && isCorrect
                        ? 'bg-green-400 text-white'
                        : hasAnswered && isSelected && !isCorrect
                        ? 'bg-red-400 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {hasAnswered && isSelected && isCorrect
                      ? '\u2713'
                      : hasAnswered && isSelected && !isCorrect
                      ? '\u2717'
                      : letters[i]}
                  </span>
                  <span>{answer}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Post-answer feedback */}
      {hasAnswered && (
        <div className="w-full max-w-md mt-6 text-center relative">
          {/* Points animation */}
          {showPointsAnim && earnedPoints !== null && earnedPoints > 0 && (
            <div
              className="text-3xl font-black text-purple-600 animate-points-fly"
            >
              +{earnedPoints}!
            </div>
          )}
          <p className="text-lg text-gray-400 animate-pulse mt-2">
            ...ממתינים לשאר השחקנים
          </p>
        </div>
      )}
    </main>
  );
}
