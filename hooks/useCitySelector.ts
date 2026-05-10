'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { logError } from '@/lib/logger';

interface CityOption {
  id: number;
  name: string;
}

interface SelectedCity {
  id: number;
  name: string;
  price: number;
  price_period: string;
  advance: number;
  description: string;
}

export function useCitySelector() {
  const [allCities, setAllCities] = useState<CityOption[]>([]);
  const [selectedCities, setSelectedCities] = useState<SelectedCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadCities = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const res = await api.get('/cities?all=true');
      const cities = res.data?.data || res.data;
      if (Array.isArray(cities)) {
        setAllCities(cities);
        setLoaded(true);
      } else {
        logError('Ошибка: города не массив', cities);
        setAllCities([]);
      }
    } catch (err) {
      logError('Ошибка загрузки городов:', err);
      setAllCities([]);
    } finally {
      setLoading(false);
    }
  }, [loaded, loading]);

  const toggleCity = useCallback((city: CityOption) => {
    setSelectedCities(prev => {
      const exists = prev.find(c => c.id === city.id);
      if (exists) return prev.filter(c => c.id !== city.id);
      return [...prev, { id: city.id, name: city.name, price: 0, price_period: 'day', advance: 0, description: '' }];
    });
  }, []);

  const selectAll = useCallback(() => {
    const ids = new Set(selectedCities.map(c => c.id));
    const add = allCities
      .filter(c => !ids.has(c.id))
      .map(c => ({ id: c.id, name: c.name, price: 0, price_period: 'day', advance: 0, description: '' }));
    setSelectedCities(prev => [...prev, ...add]);
  }, [allCities, selectedCities]);

  const deselectAll = useCallback(() => setSelectedCities([]), []);

  const updateCity = useCallback((cityId: number, field: string, value: any) => {
    setSelectedCities(prev => prev.map(c => c.id === cityId ? { ...c, [field]: value } : c));
  }, []);

  const isSelected = useCallback(
    (cityId: number) => selectedCities.some(c => c.id === cityId),
    [selectedCities]
  );

  return {
    allCities,
    selectedCities,
    setSelectedCities,
    loadCities,
    loading,
    loaded,
    toggleCity,
    selectAll,
    deselectAll,
    updateCity,
    isSelected,
  };
}