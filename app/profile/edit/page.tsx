import type { Metadata } from 'next';
import EditProfileClient from '@/components/EditProfileClient';

export const metadata: Metadata = {
  title: 'Редактировать профиль | Arendasv74',
  description: 'Измените имя, телефон, email, аватар и пароль.',
};

export default function EditProfilePage() {
  return <EditProfileClient />;
}