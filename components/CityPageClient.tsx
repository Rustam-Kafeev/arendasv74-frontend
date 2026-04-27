'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Car } from '@/types';
import CarCard from '@/components/Cars/CarCard';

interface CityPageClientProps {
  city: string;
}

export default function CityPageClient({ city }: CityPageClientProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/cars', { params: { city } })
      .then((response) => {
        const carsData = response.data.data || response.data;
        setCars(Array.isArray(carsData) ? carsData : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Аренда авто с выкупом в {city}</h1>
      <p className="text-gray-600 mb-6">Автомобили, доступные в вашем городе</p>
      
      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : cars.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Нет доступных автомобилей в {city}</div>
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