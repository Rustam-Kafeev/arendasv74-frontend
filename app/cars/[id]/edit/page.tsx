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
    resolver: zodResolver(carSchema),
  });

  // Загрузка данных автомобиля
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

  // Проверка, является ли пользователь владельцем (бэкенд тоже проверяет через Policy)
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
      // Добавляем текстовые поля
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      // Существующие фото (оставшиеся после удаления)
      formData.append('existing_photos', JSON.stringify(existingPhotos));
      // Новые фото
      newPhotos.forEach((file) => {
        formData.append('photos[]', file);
      });
      // Для метода PUT Laravel требует указать _method=PUT при multipart/form-data,
      // но мы используем axios.put, который отправляет POST с _method.
      // Однако axios умеет слать PUT с FormData, просто укажем метод PUT.
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
        {/* Поля формы такие же, как при создании */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Марка</label>
            <input {...register('brand')} className="w-full border rounded px-3 py-2" />
            {errors.brand?.message && <p className="text-red-500 text-sm">{String(errors.brand.message)}</p>}
          </div>
          <div>
            <label className="block mb-1">Модель</label>
            <input {...register('model')} className="w-full border rounded px-3 py-2" />
            {errors.model?.message && <p className="text-red-500 text-sm">{String(errors.model.message)}</p>}
          </div>
        </div>
        <div>
          <label className="block mb-1">Год выпуска</label>
          <input type="number" {...register('year')} className="w-full border rounded px-3 py-2" />
          {errors.year?.message && <p className="text-red-500 text-sm">{String(errors.year.message)}</p>}
        </div>
        <div>
          <label className="block mb-1">Город</label>
          <input {...register('city')} className="w-full border rounded px-3 py-2" />
          {errors.city?.message && <p className="text-red-500 text-sm">{String(errors.city.message)}</p>}
        </div>
        <div>
          <label className="block mb-1">Описание</label>
          <textarea {...register('description')} rows={4} className="w-full border rounded px-3 py-2" />
          {errors.description?.message && <p className="text-red-500 text-sm">{String(errors.description.message)}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Цена за день (₽)</label>
            <input type="number" step="0.01" {...register('price_per_day')} className="w-full border rounded px-3 py-2" />
            {errors.price_per_day?.message && <p className="text-red-500 text-sm">{String(errors.price_per_day.message)}</p>}
          </div>
          <div>
            <label className="block mb-1">Цена выкупа (₽, опционально)</label>
            <input type="number" step="0.01" {...register('buyout_price')} className="w-full border rounded px-3 py-2" />
            {errors.buyout_price?.message && <p className="text-red-500 text-sm">{String(errors.buyout_price.message)}</p>}
          </div>
        </div>

        {/* Управление существующими фото */}
        {existingPhotos.length > 0 && (
          <div>
            <label className="block mb-2 font-medium">Текущие фотографии</label>
            <div className="flex flex-wrap gap-2">
              {existingPhotos.map((photo, idx) => {
                const url = photo.startsWith('http') ? photo : `http://127.0.0.1:8000${photo}`;
                return (
                  <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden group">
                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(idx)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Новые фото */}
        <div>
          <label className="block mb-2 font-medium">Добавить новые фото</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleNewFiles}
            ref={fileInputRef}
            className="hidden"
            id="new-photos"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center cursor-pointer hover:bg-gray-50"
          >
            <Plus className="w-8 h-8 text-gray-400 mb-1" />
            <span className="text-blue-600">Выбрать файлы</span>
          </div>
          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden group">
                  <Image src={url} alt="preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(idx)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}