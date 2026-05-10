'use client';

import { useEffect, useReducer } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useCitySelector } from '@/hooks/useCitySelector';
import CarBasicInfo from './CarBasicInfo';
import CarCitySelector from './CarCitySelector';
import CarPhotoUploader from './CarPhotoUploader';
import PaymentGate from '@/components/PaymentGate';

const carSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  price_period: z.enum(['day', 'week', 'month']).default('day'),
  advance: z.coerce.number().min(0).optional(),
  city_description: z.string().optional(),
});

type CarFormData = z.infer<typeof carSchema>;

type FormState = {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  existingPhotos: string[];
  newPhotos: File[];
  priceDisplay: string;
  advanceDisplay: string;
  carsCount: number;
};

type FormAction =
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: boolean }
  | { type: 'SET_EXISTING_PHOTOS'; payload: string[] }
  | { type: 'SET_NEW_PHOTOS'; payload: File[] }
  | { type: 'SET_PRICE_DISPLAY'; payload: string }
  | { type: 'SET_ADVANCE_DISPLAY'; payload: string }
  | { type: 'SET_CARS_COUNT'; payload: number };

const initialState: FormState = {
  isSubmitting: false, error: null, success: false,
  existingPhotos: [], newPhotos: [], priceDisplay: '', advanceDisplay: '', carsCount: 0,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_SUBMITTING': return { ...state, isSubmitting: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'SET_SUCCESS': return { ...state, success: action.payload };
    case 'SET_EXISTING_PHOTOS': return { ...state, existingPhotos: action.payload };
    case 'SET_NEW_PHOTOS': return { ...state, newPhotos: action.payload };
    case 'SET_PRICE_DISPLAY': return { ...state, priceDisplay: action.payload };
    case 'SET_ADVANCE_DISPLAY': return { ...state, advanceDisplay: action.payload };
    case 'SET_CARS_COUNT': return { ...state, carsCount: action.payload };
    default: return state;
  }
}

export default function CarForm({ car }: { car?: any }) {
  const isEditing = !!car;
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { allCities, loading: cl, selectedCities, setSelectedCities, toggleCity, selectAll, deselectAll, isSelected } = useCitySelector();
  const [state, dispatch] = useReducer(formReducer, initialState);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CarFormData>({
    resolver: zodResolver(carSchema) as any,
    defaultValues: { price_period: 'day', price: 0, advance: 0, city_description: '' },
  });

  const isAdmin = user?.is_admin || false;
  const parseNumber = (v: string) => Number(v.replace(/\D/g, '')) || 0;

  useEffect(() => {
    if (user) {
      api.get('/my-cars').then(res => dispatch({ type: 'SET_CARS_COUNT', payload: res.data?.length || 0 })).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (car) {
      const p = car.cities?.[0]?.pivot?.price_per_day ?? 0;
      const a = car.cities?.[0]?.pivot?.advance || 0;
      reset({ brand: car.brand, model: car.model, year: car.year, description: car.description || '', price: p, price_period: car.cities?.[0]?.pivot?.price_period || 'day', advance: a, city_description: car.cities?.[0]?.pivot?.description || '' });
      dispatch({ type: 'SET_PRICE_DISPLAY', payload: p ? p.toLocaleString('ru-RU') : '' });
      dispatch({ type: 'SET_ADVANCE_DISPLAY', payload: a ? a.toLocaleString('ru-RU') : '' });
      dispatch({ type: 'SET_EXISTING_PHOTOS', payload: car.photos || [] });
      if (car.cities) setSelectedCities(car.cities.map((c: any) => ({ id: c.id, name: c.name, price: c.pivot?.price_per_day ?? 0, price_period: c.pivot?.price_period || 'day', advance: c.pivot?.advance || 0, description: c.pivot?.description || '' })));
    }
  }, [car, reset, setSelectedCities]);

  useEffect(() => { if (!isLoading && !user) router.push('/auth/login'); }, [user, isLoading, router]);
  if (isLoading || cl) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!user) return null;

  const onSubmit = async (data: CarFormData) => {
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: false });
    try {
      if (selectedCities.length === 0) { dispatch({ type: 'SET_ERROR', payload: 'Выберите хотя бы один город' }); dispatch({ type: 'SET_SUBMITTING', payload: false }); return; }

      const fd = new FormData();
      fd.append('brand', data.brand); fd.append('model', data.model); fd.append('year', String(data.year)); fd.append('description', data.description);
      fd.append('cities', JSON.stringify(selectedCities.map(c => ({ id: c.id, price_per_day: parseNumber(state.priceDisplay) || data.price || 0, price_period: data.price_period || 'day', advance: parseNumber(state.advanceDisplay) || data.advance || undefined, description: data.city_description || '' }))));
      if (isEditing) fd.append('existing_photos', JSON.stringify(state.existingPhotos));
      state.newPhotos.forEach(f => fd.append('photos[]', f));

      if (isEditing) {
        await api.post(`/cars/${car.id}?_method=PUT`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        dispatch({ type: 'SET_SUCCESS', payload: true });
        setTimeout(() => router.push(`/cars/${car.id}`), 1000);
      } else {
        const res = await api.post('/cars', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        dispatch({ type: 'SET_SUCCESS', payload: true });
        setTimeout(() => router.push(`/cars/${res.data.id}`), 1000);
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || 'Ошибка при сохранении' });
    } finally { dispatch({ type: 'SET_SUBMITTING', payload: false }); }
  };

  return (
    <PaymentGate isAdmin={isAdmin} carsCount={state.carsCount} isEditing={isEditing}>
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Редактировать объявление' : 'Добавить автомобиль'}</h1>
        {state.error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">{state.error}</div>}
        {state.success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">{isEditing ? '✅ Объявление обновлено!' : '✅ Объявление опубликовано!'}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <CarBasicInfo register={register} errors={errors} />
          <CarCitySelector allCities={allCities} selectedCities={selectedCities} toggleCity={toggleCity} selectAll={selectAll} deselectAll={deselectAll} isSelected={isSelected} register={register} priceDisplay={state.priceDisplay} setPriceDisplay={(v) => dispatch({ type: 'SET_PRICE_DISPLAY', payload: v })} advanceDisplay={state.advanceDisplay} setAdvanceDisplay={(v) => dispatch({ type: 'SET_ADVANCE_DISPLAY', payload: v })} />
          <CarPhotoUploader existingPhotos={state.existingPhotos} setExistingPhotos={(p) => dispatch({ type: 'SET_EXISTING_PHOTOS', payload: p })} onFilesChange={(f) => dispatch({ type: 'SET_NEW_PHOTOS', payload: f })} isEditing={isEditing} />
          <button type="submit" disabled={state.isSubmitting || selectedCities.length === 0} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
            {state.isSubmitting ? 'Сохранение...' : isEditing ? 'Сохранить изменения' : 'Опубликовать объявление'}
          </button>
        </form>
      </div>
    </PaymentGate>
  );
}