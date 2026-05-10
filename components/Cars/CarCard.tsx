'use client';

import { useState, useRef, useCallback } from 'react';
import { Car } from '@/types';
import Image from 'next/image';
import PlaceholderCarImage from '@/components/PlaceholderCarImage';
import Link from 'next/link';
import { MapPin, Calendar, Eye, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useChat } from '@/contexts/ChatContext';
import { useRouter } from 'next/navigation';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { openChat } = useChat();
  const router = useRouter();

  const photos = car.photos || [];
  const hasMultiplePhotos = photos.length > 1;

  const getPhotoUrl = (photo: string) => {
    return photo.startsWith('http') ? photo : `http://127.0.0.1:8000${photo}`;
  };

  const currentPhotoUrl = photos.length > 0 ? getPhotoUrl(photos[currentPhotoIndex]) : null;

  const displayCity = car.city || (car.cities && car.cities.length > 0 ? car.cities[0].name : '—');
  const pivotData = car.cities && car.cities.length > 0 ? car.cities[0].pivot : null;
  const displayPrice = car.price_per_day || pivotData?.price_per_day || null;
  const displayPeriod = pivotData?.price_period || 'day';
  const displayAdvance = car.buyout_price || pivotData?.buyout_price || null;
  const periodLabel = displayPeriod === 'month' ? 'месяц' : 'день';

  const goToPhoto = useCallback((index: number) => {
    setCurrentPhotoIndex((prev) => {
      if (index < 0) return photos.length - 1;
      if (index >= photos.length) return 0;
      return index;
    });
  }, [photos.length]);

  const nextPhoto = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); goToPhoto(currentPhotoIndex + 1); };
  const prevPhoto = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); goToPhoto(currentPhotoIndex - 1); };

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

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push('/auth/login'); return; }
    openChat(car.id, `${car.brand} ${car.model}`);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Фото */}
      <Link href={`/cars/${car.id}?city=${encodeURIComponent(displayCity)}`}>
        <div
          ref={imageContainerRef}
          className="relative w-full aspect-[4/3] sm:h-48 lg:h-56 overflow-hidden bg-gray-100 cursor-pointer"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {currentPhotoUrl ? (
            <Image src={currentPhotoUrl} alt={`${car.brand} ${car.model}`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized loading="eager" />
          ) : (
            <PlaceholderCarImage className="w-full h-full" />
          )}

          {isHovering && hasMultiplePhotos && (
            <>
              <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-lg transition z-20"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-lg transition z-20"><ChevronRight className="w-4 h-4" /></button>
            </>
          )}

          {hasMultiplePhotos && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {photos.map((_, idx) => (
                <button key={idx} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentPhotoIndex(idx); }} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentPhotoIndex ? 'bg-white scale-125' : 'bg-white/60'}`} />
              ))}
            </div>
          )}

          {hasMultiplePhotos && isHovering && (
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full z-10">{currentPhotoIndex + 1}/{photos.length}</div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {displayPrice && (
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm z-10">
              {Number(displayPrice).toLocaleString()} ₽ / {periodLabel}
            </div>
          )}
        </div>
      </Link>

      {/* Инфо */}
      <div className="p-3 sm:p-4">
        <Link href={`/cars/${car.id}?city=${encodeURIComponent(displayCity)}`}>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{car.brand} {car.model}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />{car.year}</span>
            <span className="flex items-center gap-1 min-w-0"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /><span className="truncate">{displayCity}</span></span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-xs sm:text-sm text-gray-500"><Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{car.views_today || 0} сегодня</div>
          {displayAdvance && Number(displayAdvance) > 0 && (
            <div className="mt-2 text-xs sm:text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-lg inline-block">Аванс: {Number(displayAdvance).toLocaleString()} ₽</div>
          )}
        </Link>

        {/* Кнопка Написать */}
        {user && car.user_id !== user.id && (
          <button
            onClick={handleContact}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Написать
          </button>
        )}
      </div>
    </div>
  );
}