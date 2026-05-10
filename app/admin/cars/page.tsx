'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, MapPin } from 'lucide-react';

export default function AdminCarsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCars = () => {
    api.get('/admin/cars')
      .then(res => { setCars(res.data.data || res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && !user?.is_admin) { router.push('/auth/login'); return; }
    loadCars();
  }, [user, isLoading, router]);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это объявление?')) return;
    try {
      await api.delete(`/admin/cars/${id}`);
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (err) { alert('Ошибка при удалении'); }
  };

  if (isLoading || loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!user?.is_admin) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold">Объявления</h1>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Марка</th>
              <th className="p-3 text-left">Модель</th>
              <th className="p-3 text-left">Год</th>
              <th className="p-3 text-left">Города</th>
              <th className="p-3 text-left">Владелец</th>
              <th className="p-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {cars.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.brand}</td>
                <td className="p-3">{c.model}</td>
                <td className="p-3">{c.year}</td>
                <td className="p-3">
                  {c.cities?.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-blue-600" title={c.cities.map((ct: any) => ct.name).join(', ')}>
                      <MapPin className="w-3.5 h-3.5" />
                      {c.cities.length}
                    </span>
                  ) : '—'}
                </td>
                <td className="p-3">{c.user?.name || '—'}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 p-1" title="Удалить"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}