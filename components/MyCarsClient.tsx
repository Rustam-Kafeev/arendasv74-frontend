'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Car } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Edit3,
  Trash2,
  Plus,
  Car as CarIcon,
  MapPin,
  Calendar,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';

export default function MyCarsClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      api.get('/my-cars')
        .then(res => setCars(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это объявление?')) return;
    try {
      await api.delete(`/cars/${id}`);
      setCars(prev => prev.filter(car => car.id !== id));
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мои объявления</h1>
          <p className="text-gray-600 mt-1">
            {cars.length === 0 ? 'У вас пока нет ни одного объявления' : `Всего ${cars.length} объявлений`}
          </p>
        </div>
        <Link
          href="/cars/create"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Добавить авто
        </Link>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border">
          <CarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Нет объявлений</h3>
          <p className="text-gray-500 mb-6">Разместите своё первое объявление, чтобы начать получать заявки</p>
          <Link
            href="/cars/create"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Разместить объявление
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cars.map(car => {
            const photoUrl = car.photos?.[0]
              ? car.photos[0].startsWith('http') ? car.photos[0] : `http://127.0.0.1:8000${car.photos[0]}`
              : '/placeholder-car.jpg';

            return (
              <div key={car.id} className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition group">
                <div className="flex flex-col sm:flex-row">
                  {/* Фото */}
                  <div className="relative w-full sm:w-48 h-44 sm:h-auto flex-shrink-0 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none overflow-hidden bg-gray-100">
                    <Image
                      src={photoUrl}
                      alt={`${car.brand} ${car.model}`}
                      fill
                      className="object-cover"
                      unoptimized={photoUrl.startsWith('http')}
                    />
                    {!car.is_available && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Неактивно
                      </div>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                            {car.brand} {car.model} {car.year}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" /> {car.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" /> {car.year}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{car.price_per_day} ₽</p>
                          <p className="text-sm text-gray-500">/ день</p>
                        </div>
                      </div>

                      {/* Статус и просмотры */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Eye className="w-4 h-4" />
                          <span>{car.views_today || 0} сегодня</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className={`w-2 h-2 rounded-full ${car.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={car.is_available ? 'text-green-700' : 'text-red-700'}>
                            {car.is_available ? 'Активно' : 'Неактивно'}
                          </span>
                        </div>
                        {car.buyout_price && (
                          <span className="text-sm text-gray-500">
                            Выкуп: {car.buyout_price} ₽
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                      <Link
                        href={`/cars/${car.id}`}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition"
                      >
                        <Eye className="w-4 h-4" /> Просмотр
                      </Link>
                      <Link
                        href={`/cars/${car.id}/edit`}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition"
                      >
                        <Edit3 className="w-4 h-4" /> Ред.
                      </Link>
                      <button
                        onClick={() => handleDelete(car.id)}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}