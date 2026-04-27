import type { Metadata } from 'next';
import CarDetailClient from '@/components/CarDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/cars/${id}`, { cache: 'no-store' });
    const car = await res.json();
    if (!car) throw new Error('Car not found');

    const photoUrl = car.photos?.[0]?.startsWith('http') 
      ? car.photos[0] 
      : `http://127.0.0.1:8000${car.photos?.[0] || '/placeholder-car.jpg'}`;

    return {
      title: `${car.brand} ${car.model} ${car.year} — Аренда с выкупом | Arendasv74`,
      description: car.description?.slice(0, 160) || 'Детальная информация о машине, условиях аренды и выкупа.',
      openGraph: {
        title: `${car.brand} ${car.model} ${car.year} — ${car.price_per_day} ₽/день`,
        description: car.description?.slice(0, 160),
        images: [{ url: photoUrl, width: 800, height: 600 }],
      },
    };
  } catch (error) {
    return {
      title: 'Автомобиль | Arendasv74',
      description: 'Просмотр автомобиля и условий аренды',
    };
  }
}

export default async function CarDetailPage({ params }: Props) {
  const { id } = await params;
  return <CarDetailClient carId={id} />;
}