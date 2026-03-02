'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export interface AuthUser {
  uid: string;
  name: string;
  photo: string | null;
}

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    name: user.displayName || 'שחקן',
    photo: user.photoURL,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toAuthUser(firebaseUser) : null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Handle redirect result (for mobile)
  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      // If popup blocked or failed, fall back to redirect
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr: any) {
          setError(redirectErr?.message || 'Sign in failed');
        }
      } else {
        console.error('Sign in failed:', err);
        setError(err?.message || 'Sign in failed');
      }
    }
  }, []);

  const logOut = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  }, []);

  return { user, loading, error, signIn, logOut };
}
