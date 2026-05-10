'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Car } from '@/types';
import CarCard from '@/components/Cars/CarCard';
import CarFilters from '@/components/Cars/CarFilters';
import { useCityContext } from '@/contexts/CityContext';
import { logError } from '@/lib/logger';

export default function HomePageClient() {
  const { city, loading: cityLoading } = useCityContext();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', brand: '' });

  useEffect(() => {
    if (!cityLoading && city) {
      setFilters({ city, brand: '' });
    }
  }, [city, cityLoading]);

  const fetchCars = useCallback(async () => {
    if (!filters.city) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('city', filters.city);
      if (filters.brand) params.append('brand', filters.brand);
      const response = await api.get(`/cars?${params.toString()}`);
      const carsData = response.data.data || response.data;
      setCars(Array.isArray(carsData) ? carsData : []);
    } catch (error) {
      logError('Ошибка загрузки автомобилей:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [filters.city, filters.brand]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  if (cityLoading) return <div className="text-center py-8">Определяем ваш город...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Каталог автомобилей {filters.city ? `в ${filters.city}` : ''}</h1>
      <CarFilters filters={filters} onChange={setFilters} />
      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : cars.length === 0 ? (
        <div className="text-center py-8 text-gray-500">В этом городе пока нет доступных автомобилей</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}