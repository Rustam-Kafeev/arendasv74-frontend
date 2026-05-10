'use client';

import { useState, useEffect } from 'react';
import { logError } from '@/lib/logger';

const DEFAULT_CITY = 'Челябинск';

export function useCity() {
  const [city, setCityState] = useState<string>(DEFAULT_CITY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initCity = async () => {
      const savedCity = localStorage.getItem('userCity');
      if (savedCity) {
        setCityState(savedCity);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const detected = data.city || DEFAULT_CITY;
        setCityState(detected);
        localStorage.setItem('userCity', detected);
      } catch (err) {
        logError('Ошибка определения города:', err);
        setCityState(DEFAULT_CITY);
      } finally {
        setLoading(false);
      }
    };

    initCity();
  }, []);

  const setCity = (newCity: string) => {
    setCityState(newCity);
    localStorage.setItem('userCity', newCity);
  };

  return { city, setCity, loading };
}