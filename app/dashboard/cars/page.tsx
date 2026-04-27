import type { Metadata } from 'next';
import MyCarsClient from '@/components/MyCarsClient';

export const metadata: Metadata = {
  title: 'Мои объявления | Arendasv74',
  description: 'Управляйте своими автомобилями, редактируйте описание и фотографии.',
};

export default function MyCarsPage() {
  return <MyCarsClient />;
}