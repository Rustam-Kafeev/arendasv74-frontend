import type { Metadata } from 'next';
import DashboardClient from '@/components/DashboardClient';

export const metadata: Metadata = {
  title: 'Личный кабинет | Arendasv74',
  description: 'Управляйте объявлениями, отслеживайте статистику просмотров и сообщений.',
  openGraph: {
    title: 'Личный кабинет | Arendasv74',
    description: 'Статистика, сообщения, управление объявлениями',
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}