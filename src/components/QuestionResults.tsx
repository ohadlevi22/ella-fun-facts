'use client';

import { GameQuestion, PlayerAnswer } from '@/lib/gameEngine';
import { PlayerData } from '@/lib/gameRoom';
import PlayerAvatar from './PlayerAvatar';

interface QuestionResultsProps {
  question: GameQuestion;
  players: Record<string, PlayerData>;
  answers: Record<string, PlayerAnswer>;
  currentUserUid: string;
}

export default function QuestionResults({
  question,
  players,
  answers,
  currentUserUid,
}: QuestionResultsProps) {
  // Build sorted player list by total score descending
  const sortedPlayers = Object.entries(players)
    .map(([uid, player]) => {
      const answer = answers[uid] as PlayerAnswer | undefined;
      return {
        uid,
        name: player.name,
        photo: player.photo,
        totalScore: player.score,
        pointsThisRound: answer?.points ?? 0,
        correct: answer?.correct ?? false,
        streak: player.streak,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-5" dir="rtl">
      {/* Correct answer banner */}
      <div className="w-full bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center">
        <p className="text-sm font-bold text-green-600 mb-1">התשובה הנכונה</p>
        <p className="text-xl font-black text-green-700">{question.correctAnswer}</p>
      </div>

      {/* Player results */}
      <div className="w-full space-y-2">
        {sortedPlayers.map((player, index) => {
          const isCurrentUser = player.uid === currentUserUid;
          return (
            <div
              key={player.uid}
              className={`
                flex items-center gap-3 p-3 rounded-2xl transition-all
                ${isCurrentUser ? 'bg-purple-50 border-2 border-purple-200' : 'bg-white border border-gray-100'}
                ${index === 0 ? 'shadow-md' : 'shadow-sm'}
              `}
            >
              {/* Rank */}
              <span className="text-lg font-black text-gray-400 w-6 text-center flex-shrink-0">
                {index + 1}
              </span>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <PlayerAvatar
                  name={player.name}
                  photo={player.photo}
                  answered={player.correct}
                  size="sm"
                />
              </div>

              {/* Name + correct/wrong indicator */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate text-sm">
                  {player.name}
                  {isCurrentUser && <span className="text-purple-500 mr-1">(את)</span>}
                </p>
                <p className="text-xs text-gray-500">
                  {player.correct ? 'נכון!' : 'לא נכון'}
                  {player.correct && player.pointsThisRound > 0 && (
                    <span className="text-purple-600 font-bold mr-1">
                      +{player.pointsThisRound}
                    </span>
                  )}
                </p>
              </div>

              {/* Streak */}
              {player.streak >= 2 && (
                <div className="flex items-center gap-0.5 bg-orange-100 text-orange-600 rounded-full px-2 py-0.5 text-xs font-bold flex-shrink-0">
                  <span>x{player.streak}</span>
                </div>
              )}

              {/* Total score */}
              <div className="text-left flex-shrink-0">
                <p className="text-lg font-black text-purple-600">{player.totalScore}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
