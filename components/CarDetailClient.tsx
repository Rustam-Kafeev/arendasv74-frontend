'use client';
import { useChat } from '@/components/ChatContext';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Car, CarCity } from '@/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  ChevronLeft, ChevronRight, Phone, MessageCircle, Eye, MapPin,
  Calendar, ShieldCheck, Banknote, Share2, Heart, AlertTriangle,
  Edit3, Trash2, ImagePlus
} from 'lucide-react';

interface CarDetailClientProps {
  carId: string;
}
const { openChat } = useChat();
export default function CarDetailClient({ carId }: CarDetailClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  useEffect(() => {
    if (carId) {
      api.get(`/cars/${carId}`)
        .then((res) => {
          const data = res.data;
          setCar(data);
          if (data.cities && data.cities.length > 0) {
            setSelectedCityId(data.cities[0].id);
          }
          setLoading(false);
        })
        .catch(console.error);
    }
  }, [carId]);

 const handleContact = () => {
  if (!user) {
    router.push('/auth/login');
    return;
  }
  openChat(car?.id!, `${car?.brand} ${car?.model}`);
};

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;
    try {
      await api.delete(`/cars/${car?.id}`);
      router.push('/dashboard/cars');
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  const nextPhoto = () => {
    if (car?.photos?.length) setCurrentPhotoIndex((prev) => (prev + 1) % car.photos.length);
  };
  const prevPhoto = () => {
    if (car?.photos?.length) setCurrentPhotoIndex((prev) => (prev - 1 + car.photos.length) % car.photos.length);
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );
  if (!car) return <div className="text-center py-12 text-gray-500">Автомобиль не найден</div>;

  const photos = car.photos || [];
  const currentPhotoUrl = photos.length > 0
    ? (photos[currentPhotoIndex].startsWith('http')
        ? photos[currentPhotoIndex]
        : `http://127.0.0.1:8000${photos[currentPhotoIndex]}`)
    : null;

  const isOwner = user?.id === car.user_id;
  const viewsToday = car.views_today || 0;

  const currentCity: CarCity | undefined = car.cities?.find(c => c.id === selectedCityId);
  const cityDescription = currentCity?.pivot?.description || car.description || '';
  const cityPricePerDay = currentCity?.pivot?.price_per_day ?? car.price_per_day;
  const cityBuyoutPrice = currentCity?.pivot?.buyout_price ?? car.buyout_price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Хлебные крошки */}
     <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
  <button onClick={() => router.push('/')} className="hover:text-blue-600">Главная</button>
  <span>/</span>
  {car.cities && car.cities.length > 0 && (
    <button onClick={() => router.push(`/cities/${car.cities![0].name}`)} className="hover:text-blue-600">
      {car.cities[0].name}
    </button>
  )}
  <span>/</span>
  <span className="text-gray-900 font-medium truncate">
    {car.brand} {car.model} {car.year}
  </span>
</nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Левая колонка – Галерея (без изменений, код сокращён для примера) */}
        <div className="lg:col-span-2">
          <div className="relative group overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
            {photos.length > 0 ? (
              <>
                <div className="aspect-[16/10] relative">
                  <Image src={currentPhotoUrl!} alt={`${car.brand} ${car.model}`} fill className="object-contain" unoptimized priority />
                </div>
                {photos.length > 1 && (
                  <>
                    <button onClick={prevPhoto} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full p-2 transition opacity-0 group-hover:opacity-100">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextPhoto} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full p-2 transition opacity-0 group-hover:opacity-100">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                {photos.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                    {currentPhotoIndex + 1} / {photos.length}
                  </div>
                )}
                <button onClick={() => setIsFavorite(!isFavorite)} className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition">
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </>
            ) : (
              <div className="aspect-[16/10] flex items-center justify-center text-gray-400 bg-gray-200">
                <ImagePlus className="w-12 h-12" />
                <span className="ml-2">Нет фотографий</span>
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {photos.map((photo, idx) => {
                const thumbUrl = photo.startsWith('http') ? photo : `http://127.0.0.1:8000${photo}`;
                return (
                  <button key={idx} onClick={() => setCurrentPhotoIndex(idx)}
                    className={`relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${idx === currentPhotoIndex ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}>
                    <Image src={thumbUrl} alt={`Миниатюра ${idx + 1}`} fill className="object-cover" unoptimized />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Правая колонка – Информация */}
        <div className="space-y-6">
          {/* Выбор города (если их >1) */}
          {car.cities && car.cities.length > 1 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <label className="block text-sm font-medium mb-2">Город</label>
              <select
                value={selectedCityId ?? ''}
                onChange={(e) => setSelectedCityId(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
              >
                {car.cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Цена */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-bold text-gray-900">{cityPricePerDay} ₽</span>
                <span className="text-gray-500 ml-1">/ день</span>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100" title="Поделиться">
                <Share2 className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {cityBuyoutPrice && (
              <div className="mt-3 flex items-center text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                <Banknote className="w-4 h-4 mr-2" />
                <span className="font-medium">Выкуп: {cityBuyoutPrice} ₽</span>
              </div>
            )}
            <div className="mt-4 space-y-3">
              {!isOwner && user && (
                <>
                  {car.user?.phone && (
                    <a href={`tel:${car.user.phone}`} className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium">
                      <Phone className="w-5 h-5" /> Позвонить
                    </a>
                  )}
                  <button onClick={handleContact} className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium">
                    <MessageCircle className="w-5 h-5" /> Написать сообщение
                  </button>
                </>
              )}
              {!user && (
                <button onClick={() => router.push('/auth/login')} className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition">
                  Войдите, чтобы связаться с владельцем
                </button>
              )}
            </div>
          </div>

          {/* Основные характеристики */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="font-semibold text-lg mb-4">Основные характеристики</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Год выпуска</p><p className="font-medium">{car.year}</p></div></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Город</p><p className="font-medium">{currentCity?.name || '—'}</p></div></div>
              <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Просмотров сегодня</p><p className="font-medium">{viewsToday}</p></div></div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-500">Проверено</p><p className="font-medium text-green-600">Да</p></div></div>
            </div>
          </div>

          {/* Описание (из текущего города) */}
          {cityDescription && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-semibold text-lg mb-3">Описание</h3>
              <div className={`whitespace-pre-line text-gray-700 ${!showFullDescription && cityDescription.length > 300 ? 'max-h-32 overflow-hidden relative' : ''}`}>
                {cityDescription}
                {!showFullDescription && cityDescription.length > 300 && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
              {cityDescription.length > 300 && (
                <button onClick={() => setShowFullDescription(!showFullDescription)} className="mt-2 text-blue-600 text-sm font-medium hover:underline">
                  {showFullDescription ? 'Скрыть' : 'Читать полностью'}
                </button>
              )}
            </div>
          )}

          {/* Владелец */}
<div className="bg-white p-6 rounded-2xl shadow-sm border">
  <h3 className="font-semibold text-lg mb-3">Владелец</h3>
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100">
     {car.user?.avatar_url ? (
  <Image src={car.user.avatar_url} alt={car.user?.name || 'Пользователь'} width={40} height={40} className="object-cover" unoptimized />
) : (
  <Image src={`https://ui-avatars.com/api/?name=${encodeURIComponent(car.user?.name || '?')}&background=random&size=128`}
    alt={car.user?.name || 'Пользователь'} width={40} height={40} className="object-cover" unoptimized />
)}
    </div>
    <div>
      <p className="font-medium">{car.user?.name || 'Пользователь'}</p>
      {car.user?.phone && <p className="text-sm text-gray-500">{car.user.phone}</p>}
    </div>
  </div>
</div>

          {/* Действия владельца */}
          {isOwner && (
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 mb-4">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Это ваше объявление</span>
              </div>
              <div className="space-y-2">
                <button onClick={() => router.push(`/cars/${car.id}/edit`)} className="flex items-center gap-2 w-full bg-white text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 transition border">
                  <Edit3 className="w-4 h-4" /> Редактировать
                </button>
                <button onClick={() => router.push(`/cars/${car.id}/edit?tab=photos`)} className="flex items-center gap-2 w-full bg-white text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 transition border">
                  <ImagePlus className="w-4 h-4" /> Управление фото
                </button>
                <button onClick={handleDelete} className="flex items-center gap-2 w-full bg-red-50 text-red-600 py-2.5 px-4 rounded-xl hover:bg-red-100 transition border border-red-200">
                  <Trash2 className="w-4 h-4" /> Удалить объявление
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}