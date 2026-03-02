'use client';

interface PlayerAvatarProps {
  name: string;
  photo: string | null;
  answered?: boolean;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    container: 'w-10 h-10',
    text: 'text-sm',
    initial: 'text-lg font-bold',
    name: 'text-xs',
    score: 'text-[10px]',
    ring: 'ring-2 ring-offset-1',
  },
  md: {
    container: 'w-14 h-14',
    text: 'text-base',
    initial: 'text-xl font-bold',
    name: 'text-sm',
    score: 'text-xs',
    ring: 'ring-3 ring-offset-2',
  },
  lg: {
    container: 'w-20 h-20',
    text: 'text-lg',
    initial: 'text-3xl font-bold',
    name: 'text-base',
    score: 'text-sm',
    ring: 'ring-4 ring-offset-2',
  },
} as const;

// Bright, kid-friendly colors for fallback initials
const avatarColors = [
  'bg-pink-400',
  'bg-purple-400',
  'bg-indigo-400',
  'bg-blue-400',
  'bg-teal-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-orange-400',
  'bg-rose-400',
  'bg-cyan-400',
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function PlayerAvatar({
  name,
  photo,
  answered = false,
  score,
  size = 'md',
}: PlayerAvatarProps) {
  const config = sizeConfig[size];
  const initial = name.charAt(0).toUpperCase();
  const bgColor = getColorForName(name);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Avatar circle */}
      <div
        className={`
          ${config.container} rounded-full overflow-hidden
          ${config.ring} ring-offset-white
          ${answered ? 'ring-green-400 animate-answered-pulse' : 'ring-transparent'}
          transition-shadow duration-300
        `}
      >
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className={`
              w-full h-full flex items-center justify-center
              ${bgColor} text-white ${config.initial}
              select-none
            `}
          >
            {initial}
          </div>
        )}
      </div>

      {/* Name */}
      <span
        className={`${config.name} font-medium text-gray-700 text-center leading-tight max-w-[5rem] truncate`}
      >
        {name}
      </span>

      {/* Score */}
      {score !== undefined && (
        <span
          className={`${config.score} font-bold text-purple-600 bg-purple-100 rounded-full px-2 py-0.5`}
        >
          {score}
        </span>
      )}
    </div>
  );
}
