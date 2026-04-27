'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Car } from '@/types';
import CarCard from '@/components/Cars/CarCard';
import CarFilters from '@/components/Cars/CarFilters';

export default function HomePageClient() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', brand: '' });

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.brand) params.append('brand', filters.brand);
      const response = await api.get(`/cars?${params.toString()}`);
      console.log('API response:', response.data);
      const carsData = response.data.data || response.data;
      if (Array.isArray(carsData)) {
        setCars(carsData);
      } else {
        console.error('Неожиданный формат данных:', carsData);
        setCars([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки автомобилей:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [filters]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Каталог автомобилей</h1>
      <CarFilters filters={filters} onChange={setFilters} />
      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : cars.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Автомобили не найдены</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}