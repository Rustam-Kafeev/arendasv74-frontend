// app/page.tsx
import type { Metadata } from 'next';
import HomePageClient from '../components/HomePageClient';

export const metadata: Metadata = {
  title: 'Каталог автомобилей | Аренда с правом выкупа',
  description: 'Найдите автомобиль в аренду с правом выкупа. Большой выбор машин от частных лиц. Удобный поиск по городу и марке.',
  openGraph: {
    title: 'Каталог автомобилей | Аренда с правом выкупа',
    description: 'Найдите автомобиль в аренду с правом выкупа. Большой выбор машин от частных лиц. Удобный поиск по городу и марке.',
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function HomePage() {
  return <HomePageClient />;
}