'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';
import { Trash2, Plus } from 'lucide-react';

const carSchema = z.object({
  brand: z.string().min(1, 'Укажите марку'),
  model: z.string().min(1, 'Укажите модель'),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  description: z.string().min(10, 'Опишите автомобиль (минимум 10 символов)'),
  city: z.string().min(1, 'Укажите город'),
price_per_day: z.coerce.number().positive('Цена должна быть положительной'),
buyout_price: z.coerce.number().positive().optional(),
});

type CarForm = z.infer<typeof carSchema>;

export default function EditCarPage() {
  const { id } = useParams();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarForm>({
    resolver: zodResolver(carSchema) as any,
  });

  useEffect(() => {
    if (id) {
      api.get(`/cars/${id}`).then((res) => {
        const data = res.data;
        setCar(data);
        setExistingPhotos(data.photos || []);
        reset({
          brand: data.brand,
          model: data.model,
          year: data.year,
          description: data.description,
          city: data.city,
          price_per_day: data.price_per_day,
          buyout_price: data.buyout_price || '',
        });
      });
    }
  }, [id, reset]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  const isOwner = user?.id === car?.user_id;

  const handleNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setNewPhotos((prev) => [...prev, ...fileArray]);
      const urls = fileArray.map((f) => URL.createObjectURL(f));
      setPreviewUrls((prev) => [...prev, ...urls]);
    }
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CarForm) => {
    if (!isOwner) {
      setError('Вы не можете редактировать это объявление');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      formData.append('existing_photos', JSON.stringify(existingPhotos));
      newPhotos.forEach((file) => {
        formData.append('photos[]', file);
      });
      await api.post(`/cars/${id}?_method=PUT`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push(`/cars/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !car) return <div className="text-center py-8">Загрузка...</div>;
  if (!isOwner) return <div className="text-center py-8 text-red-500">Доступ запрещён</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Редактировать объявление</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Поля такие же, как в create, но с предзаполнением */}
        {/* ... */}
        {/* Блоки existingPhotos и newPhotos остаются без изменений */}
        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}