import type { Metadata } from 'next';
import CreateCarClient from '@/components/CreateCarClient';

export const metadata: Metadata = {
  title: 'Добавить автомобиль | Arendasv74',
  description: 'Разместите объявление об аренде авто с правом выкупа. Загрузите фото, укажите условия и цену.',
};

export default function CreateCarPage() {
  return <CreateCarClient />;
}