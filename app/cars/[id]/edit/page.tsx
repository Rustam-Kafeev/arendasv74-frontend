import type { Metadata } from 'next';
import EditCarPageClient from './EditCarPageClient';

export const metadata: Metadata = {
  title: 'Редактирование объявления | Arendasv74',
  description: 'Измените описание, цену, фотографии автомобиля.',
};

export default function EditCarPage() {
  return <EditCarPageClient />;
}