'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

const carSchema = z.object({
  brand: z.string().min(1, 'Укажите марку'),
  model: z.string().min(1, 'Укажите модель'),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  description: z.string().min(10, 'Опишите автомобиль (минимум 10 символов)'),
  cities: z.array(
    z.object({
      id: z.coerce.number().min(1, 'Выберите город'),
      price_per_day: z.coerce.number().positive('Цена должна быть положительной'),
      buyout_price: z.coerce.number().positive().optional(),
      description: z.string().optional(),
    })
  ).min(1, 'Выберите хотя бы один город'),
  photos: z.any().optional(),
});

type CarForm = z.infer<typeof carSchema>;

interface CityOption {
  id: number;
  name: string;
}

export default function CreateCarClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allCities, setAllCities] = useState<CityOption[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    api.get('/cities').then((res) => setAllCities(res.data)).catch(console.error);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CarForm>({
    resolver: zodResolver(carSchema) as any, // временное решение конфликта типов
    defaultValues: {
      cities: [{ id: 0, price_per_day: 0, buyout_price: undefined, description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cities',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const addCity = () => {
    append({ id: 0, price_per_day: 0, buyout_price: undefined, description: '' });
  };

  const onSubmit = async (data: CarForm) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('brand', data.brand);
      formData.append('model', data.model);
      formData.append('year', data.year.toString());
      formData.append('description', data.description);
      formData.append('cities', JSON.stringify(data.cities));
      if (fileInputRef.current?.files) {
        for (let i = 0; i < fileInputRef.current.files.length; i++) {
          formData.append('photos[]', fileInputRef.current.files[i]);
        }
      }
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
        {/* Основные поля */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <label className="block mb-1">Общее описание</label>
          <textarea {...register('description')} rows={3} className="w-full border rounded px-3 py-2" />
          {errors.description?.message && <p className="text-red-500 text-sm">{String(errors.description.message)}</p>}
        </div>

        {/* Города */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Города и цены</h3>
            <button type="button" onClick={addCity} className="text-blue-600 hover:underline text-sm">+ Добавить город</button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded p-3 mb-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Город #{index + 1}</span>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Город</label>
                  <select {...register(`cities.${index}.id` as const)} className="w-full border rounded px-2 py-1 text-sm">
                    <option value="">Выберите город</option>
                    {allCities.map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Цена/день</label>
                  <input type="number" step="0.01" {...register(`cities.${index}.price_per_day` as const)} className="w-full border rounded px-2 py-1 text-sm" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Аванс</label>
                  <input type="number" step="0.01" {...register(`cities.${index}.buyout_price` as const)} className="w-full border rounded px-2 py-1 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm mb-1">Описание для города</label>
                  <textarea rows={2} {...register(`cities.${index}.description` as const)} className="w-full border rounded px-2 py-1 text-sm" />
                </div>
              </div>
            </div>
          ))}
          {errors.cities?.message && <p className="text-red-500 text-sm">{String(errors.cities.message)}</p>}
        </div>

        {/* Загрузка фото */}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-blue-600 font-medium">Добавить фото</span>
                <span className="text-sm text-gray-500 mt-1">(можно выбрать несколько)</span>
              </>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative w-[50px] h-[50px] border rounded overflow-hidden">
                    <Image src={url} alt={`preview-${idx}`} fill className="object-cover" />
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-[50px] h-[50px] border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100">
                  +
                </button>
              </div>
            )}
          </div>
          {errors.photos && <p className="text-red-500 text-sm mt-1">Пожалуйста, выберите фотографии</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Создание...' : 'Опубликовать объявление'}
        </button>
      </form>
    </div>
  );
}