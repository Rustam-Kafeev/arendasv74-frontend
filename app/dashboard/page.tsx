import type { Metadata } from 'next';
import DashboardClient from '../../components/DashboardClient';

export const metadata: Metadata = {
  title: 'Личный кабинет | Arendasv74',
  description: 'Статистика просмотров, управление объявлениями и сообщениями.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}