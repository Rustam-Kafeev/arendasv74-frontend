'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';

const carSchema = z.object({
  brand: z.string().min(1, 'Укажите марку'),
  model: z.string().min(1, 'Укажите модель'),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  description: z.string().min(10, 'Опишите автомобиль (минимум 10 символов)'),
  city: z.string().min(1, 'Укажите город'),
  price_per_day: z.coerce.number().positive('Цена должна быть положительной'),
  buyout_price: z.coerce.number().positive().optional(),
  photos: z.any().optional(),
});

type CarForm = z.infer<typeof carSchema>;

export default function CreateCarPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarForm>({
    resolver: zodResolver(carSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const onSubmit = async (data: CarForm) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'photos') {
          const files = (value as FileList) || fileInputRef.current?.files;
          if (files) {
            for (let i = 0; i < files.length; i++) {
              formData.append('photos[]', files[i]);
            }
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      await api.post('/cars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push('/dashboard/cars');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при создании объявления');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center py-8">Загрузка...</div>;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Добавить автомобиль</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Марка</label>
            <input {...register('brand')} className="w-full border rounded px-3 py-2" />
            {errors.brand && <p className="text-red-500 text-sm">{errors.brand.message}</p>}
          </div>
          <div>
            <label className="block mb-1">Модель</label>
            <input {...register('model')} className="w-full border rounded px-3 py-2" />
            {errors.model && <p className="text-red-500 text-sm">{errors.model.message}</p>}
          </div>
        </div>
        <div>
          <label className="block mb-1">Год выпуска</label>
          <input type="number" {...register('year')} className="w-full border rounded px-3 py-2" />
          {errors.year && <p className="text-red-500 text-sm">{errors.year.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Город</label>
          <input {...register('city')} className="w-full border rounded px-3 py-2" />
          {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Описание</label>
          <textarea {...register('description')} rows={4} className="w-full border rounded px-3 py-2" />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Цена за день (₽)</label>
            <input type="number" step="0.01" {...register('price_per_day')} className="w-full border rounded px-3 py-2" />
            {errors.price_per_day && <p className="text-red-500 text-sm">{errors.price_per_day.message}</p>}
          </div>
          <div>
            <label className="block mb-1">Цена выкупа (₽, опционально)</label>
            <input type="number" step="0.01" {...register('buyout_price')} className="w-full border rounded px-3 py-2" />
            {errors.buyout_price && <p className="text-red-500 text-sm">{errors.buyout_price.message}</p>}
          </div>
        </div>

        {/* --- Стилизованная загрузка фотографий --- */}
        <div>
          <label className="block mb-2 font-medium">Фотографии</label>

          <input
            type="file"
            multiple
            accept="image/*"
            {...register('photos')}
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
          >
            {previewUrls.length === 0 ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-blue-600 font-medium">Добавить фото</span>
                <span className="text-sm text-gray-500 mt-1">
                  (можно выбрать несколько)
                </span>
              </>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative w-[50px] h-[50px] border rounded overflow-hidden">
                    <Image
                      src={url}
                      alt={`Превью ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="w-[50px] h-[50px] border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {errors.photos && (
            <p className="text-red-500 text-sm mt-1">{
              typeof errors.photos.message === 'string' 
      ? errors.photos.message 
      : 'Пожалуйста, выберите фотографии'}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Создание...' : 'Опубликовать объявление'}
        </button>
      </form>
    </div>
  );
}