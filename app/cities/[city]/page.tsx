import type { Metadata } from 'next';
import CityPageClient from '@/components/CityPageClient';

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city);
  return {
    title: `Аренда авто с выкупом в ${cityName} | Arendasv74`,
    description: `Выберите автомобиль в аренду с правом выкупа в городе ${cityName}. Удобный каталог, чаты с владельцами, выгодные условия.`,
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const cityName = decodeURIComponent(city);
  return <CityPageClient city={cityName} />;
}