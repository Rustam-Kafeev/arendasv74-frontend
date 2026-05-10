// contexts/CityContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useCity } from '@/hooks/useCity';

interface CityContextType {
  city: string;
  setCity: (city: string) => void;
  loading: boolean;
}

const CityContext = createContext<CityContextType>({
  city: 'Челябинск',
  setCity: () => {},
  loading: true,
});

export function CityProvider({ children }: { children: ReactNode }) {
  const { city, setCity, loading } = useCity();

  return (
    <CityContext.Provider value={{ city, setCity, loading }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext() {
  return useContext(CityContext);
}