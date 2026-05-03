import type { Metadata } from 'next';
import EditCarClient from '@/components/EditCarClient';

export const metadata: Metadata = {
  title: 'Редактирование объявления | Arendasv74',
  description: 'Измените описание, цену, фотографии автомобиля.',
};

export default function EditCarPage() {
  return <EditCarClient />;
}