'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { onRoomChange, RoomData } from '@/lib/gameRoom';
import WaitingRoom from '@/components/WaitingRoom';
import Link from 'next/link';

function RoomContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { user, loading: authLoading } = useAuth();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }
    const unsubscribe = onRoomChange(code, (data) => {
      if (!data) {
        setNotFound(true);
      } else {
        setRoomData(data);
        setNotFound(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [code]);

  // Loading state
  if (authLoading || loading) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-6xl animate-bounce">🎲</div>
        <p className="text-2xl font-black text-gray-600">...טוענת את החדר</p>
      </main>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-6xl">🔒</div>
        <h1 className="text-3xl font-black text-gray-800">צריך להתחבר קודם!</h1>
        <p className="text-lg text-gray-500 text-center">
          כדי להצטרף למשחק, צריך קודם להתחבר עם חשבון גוגל
        </p>
        <Link
          href="/multiplayer"
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          לדף ההתחברות
        </Link>
      </main>
    );
  }

  // No code in URL
  if (!code) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-6xl">😕</div>
        <h1 className="text-3xl font-black text-gray-800">חסר קוד חדר!</h1>
        <p className="text-lg text-gray-500 text-center">
          נראה שהגעת לכאן בלי קוד חדר. חזרו ללובי כדי ליצור או להצטרף לחדר.
        </p>
        <Link
          href="/multiplayer"
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          חזרה ללובי
        </Link>
      </main>
    );
  }

  // Room not found
  if (notFound) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6" dir="rtl">
        <div className="text-6xl">🔍</div>
        <h1 className="text-3xl font-black text-gray-800">החדר לא נמצא!</h1>
        <p className="text-lg text-gray-500 text-center">
          לא מצאנו חדר עם הקוד <span className="font-black text-gray-700" dir="ltr">{code}</span>.
          <br />
          אולי הוא כבר נסגר?
        </p>
        <Link
          href="/multiplayer"
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          חזרה ללובי
        </Link>
      </main>
    );
  }

  // Router based on room status
  if (roomData?.status === 'waiting') {
    return (
      <main className="min-h-dvh flex flex-col items-center px-6 py-8">
        <WaitingRoom roomCode={code} roomData={roomData} currentUser={user} />
      </main>
    );
  }

  if (roomData?.status === 'playing') {
    // Placeholder until MultiplayerGame component (Task 10)
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6" dir="rtl">
        <div className="text-6xl animate-bounce">🎮</div>
        <h1 className="text-3xl font-black text-gray-800">המשחק מתחיל!</h1>
        <p className="text-lg text-gray-500">
          חדר <span className="font-black" dir="ltr">{code}</span>
        </p>
      </main>
    );
  }

  if (roomData?.status === 'finished') {
    // Placeholder until FinalScoreboard component (Task 11)
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6" dir="rtl">
        <div className="text-6xl">🏆</div>
        <h1 className="text-3xl font-black text-gray-800">המשחק נגמר!</h1>
        <p className="text-lg text-gray-500">
          חדר <span className="font-black" dir="ltr">{code}</span>
        </p>
        <Link
          href="/multiplayer"
          className="mt-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          חזרה ללובי
        </Link>
      </main>
    );
  }

  return null;
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex flex-col items-center justify-center gap-4">
          <div className="text-6xl animate-bounce">🎲</div>
          <p className="text-2xl font-black text-gray-600">...טוען</p>
        </main>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
