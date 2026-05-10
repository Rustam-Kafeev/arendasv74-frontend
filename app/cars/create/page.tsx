import type { Metadata } from 'next';
import CarForm from '@/components/CarForm';

export const metadata: Metadata = {
  title: 'Добавить автомобиль | Arendasv74',
  description: 'Разместите объявление об аренде авто с правом выкупа',
};

export default function CreateCarPage() {
  return <CarForm />;
}