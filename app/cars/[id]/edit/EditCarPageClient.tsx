'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import CarForm from '@/components/CarForm';

export default function EditCarPageClient() {
  const { id } = useParams();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/auth/login'); return; }
    if (!id) return;

    api.get(`/cars/${id}`)
      .then(res => { setCar(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, user, isLoading, router]);

  if (isLoading || loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!car) return <div className="text-center py-12 text-gray-500">Автомобиль не найден</div>;
  if (user?.id !== car.user_id) return <div className="text-center py-12 text-red-500">Доступ запрещён</div>;

  return <CarForm car={car} />;
}