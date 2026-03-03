'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kid-names';

export function useNames() {
  const [names, setNamesState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setNamesState(stored);
    setLoaded(true);
  }, []);

  const setNames = useCallback((value: string) => {
    localStorage.setItem(STORAGE_KEY, value);
    setNamesState(value);
  }, []);

  const clearNames = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setNamesState(null);
  }, []);

  return { names, setNames, clearNames, loaded };
}
