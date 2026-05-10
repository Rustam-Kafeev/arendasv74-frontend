'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Eye, MessageCircle, Zap, AlertCircle,
  TrendingUp, MapPin, Award, BarChart3, ArrowRight, Car
} from 'lucide-react';

interface DashboardStats {
  cars_count: number;
  active_cars: number;
  today_views: number;
  unread_messages: number;
  total_views?: number;
  views_chart?: { date: string; count: number }[];
  recent_messages?: {
    id: number; body: string; created_at: string;
    user_name: string; car_brand: string; car_model: string;
  }[];
  top_cars?: {
    id: number; brand: string; model: string; year: number;
    views_today: number; photos: string[]; is_available: boolean;
  }[];
  cities_count?: number;
}

export default function DashboardClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/auth/login'); return; }
    if (user) {
      api.get('/dashboard/stats')
        .then(res => { setStats(res.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  if (isLoading || loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!user) return null;

  const tips: string[] = [];
  if (stats) {
    if (stats.active_cars === 0 && stats.cars_count > 0) tips.push('У вас есть неактивные объявления — активируйте их.');
    if (stats.cars_count === 0) tips.push('Добавьте своё первое объявление.');
    if (stats.today_views === 0 && stats.cars_count > 0) tips.push('Обновите фото или описание для привлечения просмотров.');
    if (stats.unread_messages === 0 && stats.cars_count > 0) tips.push('Проверьте цены — возможно, они завышены.');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
          <p className="text-gray-600 mt-1">
            Добро пожаловать, {user.name}!{' '}
            <Link href="/profile/edit" className="text-sm text-blue-600 hover:underline ml-2">Редактировать профиль</Link>
          </p>
        </div>
        <Link href="/cars/create" className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium shadow-sm">
          <Plus className="w-5 h-5" />Разместить объявление
        </Link>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/cars" className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Мои объявления</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"><Car className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-3xl font-bold mt-3">{stats?.cars_count || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{stats?.active_cars || 0} активно</p>
          <span className="inline-flex items-center gap-1 text-blue-600 text-xs mt-2 group-hover:underline">Управлять <ArrowRight className="w-3 h-3" /></span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Просмотров сегодня</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-3xl font-bold mt-3">{stats?.today_views || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Всего: {stats?.total_views || 0}</p>
        </div>

        <Link href="/dashboard/messages" className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition group">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Сообщения</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-3xl font-bold mt-3">{stats?.recent_messages?.length || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{stats?.unread_messages || 0} новых</p>
          <span className="inline-flex items-center gap-1 text-blue-600 text-xs mt-2 group-hover:underline">Все <ArrowRight className="w-3 h-3" /></span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Охват</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center"><MapPin className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-3xl font-bold mt-3">{stats?.cities_count || 0}</p>
          <p className="text-xs text-gray-400 mt-1">городов</p>
        </div>
      </div>

      {/* График + Топ объявлений */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* График */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-600" />Просмотры за 7 дней</h2>
            <span className="text-sm text-gray-500">Всего: {stats?.total_views || 0}</span>
          </div>
          {stats?.views_chart && stats.views_chart.length > 0 ? (
            <div className="flex items-end gap-2 h-32">
              {stats.views_chart.map((day, idx) => {
                const max = Math.max(...stats.views_chart!.map(d => d.count), 1);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-100 rounded-t-md relative" style={{ height: `${(day.count / max) * 100}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 font-medium">{day.count}</div>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('ru', { weekday: 'short' }).slice(0, 2)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Нет данных за последние 7 дней</p>
          )}
        </div>

        {/* Топ объявлений */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-amber-500" />Топ-3 по просмотрам</h2>
          {stats?.top_cars && stats.top_cars.length > 0 ? (
            <div className="space-y-3">
              {stats.top_cars.map((car, idx) => (
                <Link key={car.id} href={`/cars/${car.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{car.brand} {car.model}</p>
                    <p className="text-xs text-gray-500">{car.year} • {car.views_today} сегодня</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${car.is_available ? 'bg-green-500' : 'bg-gray-300'}`} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Нет активных объявлений</p>
          )}
        </div>
      </div>

      {/* Сообщения и советы */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Сообщения */}
        <Link href="/dashboard/messages" className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-600" />Сообщения</h2>
            <span className="text-sm text-blue-600 group-hover:underline">Все →</span>
          </div>
          {stats?.recent_messages?.length ? (
            <ul className="space-y-3">
              {stats.recent_messages.map(msg => (
                <li key={msg.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">{msg.user_name?.charAt(0) || '?'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{msg.user_name}</p>
                    <p className="text-xs text-gray-500 truncate">{msg.car_brand} {msg.car_model}</p>
                    <p className="text-sm text-gray-700 mt-0.5 line-clamp-1">{msg.body}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Нет новых сообщений</p>
          )}
        </Link>

        {/* Советы */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-amber-500" />Советы по улучшению</h2>
          {tips.length > 0 ? (
            <ul className="space-y-3">
              {tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{tip}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">🎉 Отличная работа! Все объявления активны и получают просмотры.</p>
          )}
        </div>
      </div>
    </div>
  );
}