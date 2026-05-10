'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Car, CarCity } from '@/types';
import Image from 'next/image';
import PlaceholderCarImage from '@/components/PlaceholderCarImage';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useChat } from '@/contexts/ChatContext';
import {
  ChevronLeft, ChevronRight, Phone, MessageCircle, Eye, MapPin,
  Calendar, ShieldCheck, Banknote, Share2, AlertTriangle,
  Edit3, Trash2, ImagePlus, X
} from 'lucide-react';
import { logError } from '@/lib/logger';

interface CarDetailClientProps {
  carId: string;
}

export default function CarDetailClient({ carId }: CarDetailClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCity = searchParams.get('city');
  const { openChat } = useChat();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carId) {
      api.get(`/cars/${carId}`)
        .then((res) => {
          const data = res.data;
          setCar(data);
          if (data.cities && data.cities.length > 0) {
            const matchedCity = urlCity
              ? data.cities.find((c: CarCity) => c.name.toLowerCase() === urlCity.toLowerCase())
              : null;
            setSelectedCityId(matchedCity?.id || data.cities[0].id);
          }
          setLoading(false);
        })
        .catch(err => { logError('Ошибка загрузки авто:', err); setLoading(false); });
    }
  }, [carId, urlCity]);

  const handleContact = () => {
    if (!user) { router.push('/auth/login'); return; }
    openChat(car?.id!, `${car?.brand} ${car?.model}`);
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;
    try {
      await api.delete(`/cars/${car?.id}`);
      router.push('/dashboard/cars');
    } catch (error) { alert('Ошибка при удалении'); }
  };

  const photos: string[] = car?.photos || [];
  const hasMultiplePhotos = photos.length > 1;

  const getPhotoUrl = (photo: string) => {
    return photo.startsWith('http') ? photo : `http://127.0.0.1:8000${photo}`;
  };

  const currentPhotoUrl = photos.length > 0 ? getPhotoUrl(photos[currentPhotoIndex]) : null;

  const goToPhoto = useCallback((index: number) => {
    setCurrentPhotoIndex((prev) => {
      if (index < 0) return photos.length - 1;
      if (index >= photos.length) return 0;
      return index;
    });
  }, [photos.length]);

  const nextPhoto = (e?: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); goToPhoto(currentPhotoIndex + 1); };
  const prevPhoto = (e?: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); goToPhoto(currentPhotoIndex - 1); };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasMultiplePhotos || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const segmentWidth = rect.width / photos.length;
    const photoIndex = Math.floor(x / segmentWidth);
    if (photoIndex !== currentPhotoIndex && photoIndex >= 0 && photoIndex < photos.length) {
      setCurrentPhotoIndex(photoIndex);
    }
  }, [hasMultiplePhotos, photos.length, currentPhotoIndex]);

  const handleMouseLeave = () => { setIsHovering(false); setCurrentPhotoIndex(0); };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!car) return <div className="text-center py-12 text-gray-500">Автомобиль не найден</div>;

  const isOwner = user?.id === car.user_id;
  const viewsToday = car.views_today || 0;
  const currentCity: CarCity | undefined = car.cities?.find(c => c.id === selectedCityId);
  const cityDescription = currentCity?.pivot?.description || '';
  const generalDescription = car.description || '';
  const cityPricePerDay = currentCity?.pivot?.price_per_day ?? car.price_per_day;
  const cityBuyoutPrice = currentCity?.pivot?.advance ?? currentCity?.pivot?.buyout_price ?? car.buyout_price;
  const pricePeriod = currentCity?.pivot?.price_period || 'day';
  const periodLabel = pricePeriod === 'month' ? 'месяц' : 'день';

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4 overflow-x-auto whitespace-nowrap">
        <button onClick={() => router.push('/')} className="hover:text-blue-600 shrink-0">Главная</button>
        <span>/</span>
        {currentCity && <button onClick={() => router.push(`/cities/${currentCity.name}`)} className="hover:text-blue-600">{currentCity.name}</button>}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{car.brand} {car.model} {car.year}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <div ref={imageContainerRef} className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] cursor-pointer"
            onMouseEnter={() => setIsHovering(true)} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove} onClick={() => setLightboxOpen(true)}>
            {currentPhotoUrl ? (
              <Image src={currentPhotoUrl} alt={`${car.brand} ${car.model}`} fill className="object-contain" unoptimized={currentPhotoUrl.startsWith('http')} priority />
            ) : (
              <PlaceholderCarImage className="w-full h-full" />
            )}
            {isHovering && hasMultiplePhotos && (
              <>
                <button onClick={(e) => prevPhoto(e)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition z-20"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={(e) => nextPhoto(e)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition z-20"><ChevronRight className="w-5 h-5" /></button>
              </>
            )}
            {hasMultiplePhotos && (
              <>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {photos.map((_, idx) => (
                    <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(idx); }} className={`w-2 h-2 rounded-full transition-all ${idx === currentPhotoIndex ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'}`} />
                  ))}
                </div>
                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full z-10">{currentPhotoIndex + 1} / {photos.length}</div>
              </>
            )}
          </div>
          {hasMultiplePhotos && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {photos.map((photo, index) => (
                <button key={index} onClick={() => setCurrentPhotoIndex(index)} className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition ${index === currentPhotoIndex ? 'border-blue-600' : 'border-gray-200 hover:border-gray-400'}`}>
                  <Image src={getPhotoUrl(photo)} alt={`Фото ${index + 1}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          {car.cities && car.cities.length > 1 && (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border">
              <label className="block text-sm font-medium mb-2">Город</label>
              <select value={selectedCityId ?? ''} onChange={(e) => setSelectedCityId(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500">
                {car.cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>
            </div>
          )}

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div><span className="text-2xl sm:text-3xl font-bold text-gray-900">{Number(cityPricePerDay).toLocaleString()} ₽</span><span className="text-gray-500 ml-1">/ {periodLabel}</span></div>
              <button className="p-2 rounded-full hover:bg-gray-100"><Share2 className="w-5 h-5 text-gray-500" /></button>
            </div>
            {cityBuyoutPrice && Number(cityBuyoutPrice) > 0 && (
              <div className="mt-3 flex items-center text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg"><Banknote className="w-4 h-4 mr-2 shrink-0" /><span className="font-medium">Аванс: {Number(cityBuyoutPrice).toLocaleString()} ₽</span></div>
            )}
            <div className="mt-4 space-y-3">
              {!isOwner && user && (
                <>
                  {car.user?.phone && <a href={`tel:${car.user.phone.replace(/[^\d+]/g, '')}`} className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"><Phone className="w-5 h-5" /> Позвонить</a>}
                  <button onClick={handleContact} className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium"><MessageCircle className="w-5 h-5" /> Написать сообщение</button>
                </>
              )}
              {!user && <button onClick={() => router.push('/auth/login')} className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium">Войдите, чтобы связаться с владельцем</button>}
              {isOwner && <p className="text-sm text-gray-500 text-center">Это ваше объявление</p>}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border">
            <h3 className="font-semibold text-lg mb-4">Основные характеристики</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400 shrink-0" /><div><p className="text-xs text-gray-500">Год выпуска</p><p className="font-medium">{car.year}</p></div></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 shrink-0" /><div><p className="text-xs text-gray-500">Город</p><p className="font-medium">{currentCity?.name || '—'}</p></div></div>
              <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-gray-400 shrink-0" /><div><p className="text-xs text-gray-500">Просмотров сегодня</p><p className="font-medium">{viewsToday}</p></div></div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" /><div><p className="text-xs text-gray-500">Проверено</p><p className="font-medium text-green-600">Да</p></div></div>
            </div>
          </div>

          {generalDescription && (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border">
              <h3 className="font-semibold text-lg mb-3">Общее описание</h3>
              <p className="text-gray-700 text-sm whitespace-pre-line">{generalDescription}</p>
            </div>
          )}

          {cityDescription && cityDescription !== generalDescription && (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border">
              <h3 className="font-semibold text-lg mb-3">Описание для {currentCity?.name}</h3>
              <div className="relative">
                <div className={`whitespace-pre-line text-gray-700 text-sm ${!showFullDescription && cityDescription.length > 300 ? 'max-h-32 overflow-hidden' : ''}`}>{cityDescription}</div>
                {!showFullDescription && cityDescription.length > 300 && <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />}
              </div>
              {cityDescription.length > 300 && <button onClick={() => setShowFullDescription(!showFullDescription)} className="mt-2 text-blue-600 text-sm font-medium hover:underline">{showFullDescription ? 'Скрыть' : 'Читать полностью'}</button>}
            </div>
          )}

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border">
            <h3 className="font-semibold text-lg mb-3">Владелец</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 shrink-0">
                {car.user?.avatar_url ? <Image src={car.user.avatar_url} alt={car.user?.name || ''} width={40} height={40} className="object-cover w-full h-full" unoptimized /> : <Image src={`https://ui-avatars.com/api/?name=${encodeURIComponent(car.user?.name || '?')}&background=random&size=128`} alt="" width={40} height={40} className="object-cover w-full h-full" unoptimized />}
              </div>
              <div>
                <p className="font-medium">{car.user?.name || 'Пользователь'}</p>
                {car.user?.phone && <a href={`tel:${car.user.phone.replace(/[^\d+]/g, '')}`} className="text-sm text-blue-600 hover:underline">{car.user.phone}</a>}
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="bg-amber-50 p-4 sm:p-6 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 mb-4"><AlertTriangle className="w-5 h-5" /><span className="font-medium">Это ваше объявление</span></div>
              <div className="space-y-2">
                <button onClick={() => router.push(`/cars/${car.id}/edit`)} className="flex items-center gap-2 w-full bg-white text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 transition border"><Edit3 className="w-4 h-4" /> Редактировать</button>
                <button onClick={() => router.push(`/cars/${car.id}/edit?tab=photos`)} className="flex items-center gap-2 w-full bg-white text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 transition border"><ImagePlus className="w-4 h-4" /> Управление фото</button>
                <button onClick={handleDelete} className="flex items-center gap-2 w-full bg-red-50 text-red-600 py-2.5 px-4 rounded-xl hover:bg-red-100 transition border border-red-200"><Trash2 className="w-4 h-4" /> Удалить объявление</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && currentPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition"><X className="w-6 h-6" /></button>
          {hasMultiplePhotos && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevPhoto(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-full transition"><ChevronLeft className="w-6 h-6" /></button>
              <button onClick={(e) => { e.stopPropagation(); nextPhoto(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/20 rounded-full transition"><ChevronRight className="w-6 h-6" /></button>
            </>
          )}
          <div className="relative w-full max-w-5xl aspect-[16/10]"><Image src={currentPhotoUrl} alt={`${car.brand} ${car.model}`} fill className="object-contain" unoptimized={currentPhotoUrl.startsWith('http')} /></div>
          <div className="absolute bottom-4 text-white text-sm">{currentPhotoIndex + 1} / {photos.length}</div>
        </div>
      )}
    </div>
  );
}