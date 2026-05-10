'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Eye, MapPin, Calendar, Edit3, Trash2, ExternalLink, Power, PowerOff } from 'lucide-react';

interface CarItem {
  id: number;
  brand: string;
  model: string;
  year: number;
  photos: string[];
  is_available: boolean;
  views_today: number;
  created_at: string;
  cities?: { id: number; name: string }[];
  price_per_day?: number;
}

export default function MyCarsClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!isLoading && !user) { router.push('/auth/login'); return; }
    if (user) {
      api.get('/my-cars')
        .then(res => { setCars(res.data || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это объявление навсегда?')) return;
    try {
      await api.delete(`/cars/${id}`);
      setCars(prev => prev.filter(c => c.id !== id));
    } catch { alert('Ошибка при удалении'); }
  };

  const handleToggleActive = async (car: CarItem) => {
    try {
      const fd = new FormData();
      fd.append('is_available', String(!car.is_available));
      fd.append('brand', car.brand);
      fd.append('model', car.model);
      fd.append('year', String(car.year));
      fd.append('description', '');
      fd.append('cities', JSON.stringify((car.cities || []).map(c => ({ id: c.id, price_per_day: 0 }))));
      fd.append('existing_photos', JSON.stringify(car.photos || []));
      await api.post(`/cars/${car.id}?_method=PUT`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCars(prev => prev.map(c => c.id === car.id ? { ...c, is_available: !c.is_available } : c));
    } catch { alert('Ошибка'); }
  };

  if (isLoading || loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!user) return null;

  const filtered = cars.filter(c => {
    if (filter === 'active') return c.is_available;
    if (filter === 'inactive') return !c.is_available;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Мои объявления</h1>
          <p className="text-sm text-gray-500 mt-1">Всего {cars.length} объявлений</p>
        </div>
        <Link href="/cars/create" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium text-sm">
          <Plus className="w-4 h-4" />Добавить
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : 'Неактивные'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Нет объявлений</p>
          <Link href="/cars/create" className="text-blue-600 hover:underline">Создать первое объявление</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(car => {
            const photoUrl = car.photos?.[0]
              ? (car.photos[0].startsWith('http') ? car.photos[0] : `http://127.0.0.1:8000${car.photos[0]}`)
              : null;

            return (
              <div key={car.id} className="bg-white rounded-2xl shadow-sm border p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-40 h-40 sm:h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {photoUrl ? (
                    <Image src={photoUrl} alt={`${car.brand} ${car.model}`} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">Нет фото</div>
                  )}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${car.is_available ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                    {car.is_available ? 'Активно' : 'Скрыто'}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{car.brand} {car.model}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{car.year}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{car.views_today || 0} сегодня</span>
                  {car.cities && car.cities.length > 0 && (
  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{car.cities.length} городов</span>
)}
                  </div>
                  {car.cities && car.cities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {car.cities.slice(0, 5).map(c => (
                        <span key={c.id} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{c.name}</span>
                      ))}
                      {car.cities.length > 5 && <span className="text-xs text-gray-400">+{car.cities.length - 5}</span>}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <Link href={`/cars/${car.id}`} className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition">
                    <ExternalLink className="w-3.5 h-3.5" />Смотреть
                  </Link>
                  <Link href={`/cars/${car.id}/edit`} className="flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-medium text-blue-700 transition">
                    <Edit3 className="w-3.5 h-3.5" />Ред.
                  </Link>
                  <button onClick={() => handleToggleActive(car)} className="flex items-center gap-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-medium text-amber-700 transition">
                    {car.is_available ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                    {car.is_available ? 'Скрыть' : 'Актив.'}
                  </button>
                  <button onClick={() => handleDelete(car.id)} className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium text-red-600 transition">
                    <Trash2 className="w-3.5 h-3.5" />Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}