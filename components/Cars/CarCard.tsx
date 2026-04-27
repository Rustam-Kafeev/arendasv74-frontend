'use client';

import { Car } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Eye } from 'lucide-react';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const photoUrl = car.photos?.[0]
    ? car.photos[0].startsWith('http')
      ? car.photos[0]
      : `http://127.0.0.1:8000${car.photos[0]}`
    : '/placeholder-car.jpg';

  return (
    <Link
      href={`/cars/${car.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={photoUrl}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={photoUrl.startsWith('http')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm">
          {car.price_per_day} ₽ / день
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {car.brand} {car.model}
        </h3>
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {car.year}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {car.city}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
          <Eye className="w-4 h-4" />
          <span>{car.views_today || 0} сегодня</span>
        </div>
        {car.buyout_price && (
          <div className="mt-3 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg w-fit">
            Выкуп: {car.buyout_price} ₽
          </div>
        )}
      </div>
    </Link>
  );
}