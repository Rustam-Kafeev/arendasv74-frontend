'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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

export default function EditCarClient() {
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
  const [allCities, setAllCities] = useState<CityOption[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CarForm>({
    resolver: zodResolver(carSchema) as any,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cities',
  });

  // Загрузка городов и данных автомобиля
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (!id) return;

    // Загружаем список всех городов
    api.get('/cities').then((res) => setAllCities(res.data)).catch(console.error);

    // Загружаем данные автомобиля
    api.get(`/cars/${id}`).then((res) => {
      const data = res.data;
      setCar(data);
      setExistingPhotos(data.photos || []);

      // Преобразуем cities в формат для формы
      const citiesForForm = data.cities?.map((c: any) => ({
        id: c.id,
        price_per_day: c.pivot?.price_per_day || 0,
        buyout_price: c.pivot?.buyout_price,
        description: c.pivot?.description || '',
      })) || [{ id: 0, price_per_day: 0, buyout_price: undefined, description: '' }];

      reset({
        brand: data.brand,
        model: data.model,
        year: data.year,
        description: data.description || '',
        cities: citiesForForm,
      });
    }).catch(console.error);
  }, [id, user, isLoading, router, reset]);

  if (isLoading || !car) return <div className="text-center py-8">Загрузка...</div>;
  if (!user || user.id !== car.user_id) return <div className="text-center py-8 text-red-500">Доступ запрещён</div>;

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

      // Существующие фото (оставшиеся после удаления)
      formData.append('existing_photos', JSON.stringify(existingPhotos));

      // Новые фото
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Редактировать объявление</h1>
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
                  <label className="block text-sm mb-1">Выкуп</label>
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

        {/* Существующие фото */}
        {existingPhotos.length > 0 && (
          <div>
            <label className="block mb-2 font-medium">Текущие фотографии</label>
            <div className="flex flex-wrap gap-2">
              {existingPhotos.map((photo, idx) => {
                const url = photo.startsWith('http') ? photo : `https://res.cloudinary.com/dfded8l5v/image/upload/${photo}`;
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

        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}