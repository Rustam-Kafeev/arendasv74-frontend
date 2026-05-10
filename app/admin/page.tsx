'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user?.is_admin) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user?.is_admin) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Админ-панель</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/users" className="bg-white rounded-xl shadow p-4 hover:bg-gray-50 transition">
          <p className="text-gray-500 text-sm">Пользователи</p>
          <p className="text-2xl font-bold mt-1">→</p>
        </Link>
        <Link href="/admin/cars" className="bg-white rounded-xl shadow p-4 hover:bg-gray-50 transition">
          <p className="text-gray-500 text-sm">Объявления</p>
          <p className="text-2xl font-bold mt-1">→</p>
        </Link>
        <Link href="/admin/conversations" className="bg-white rounded-xl shadow p-4 hover:bg-gray-50 transition">
          <p className="text-gray-500 text-sm">Диалоги</p>
          <p className="text-2xl font-bold mt-1">→</p>
        </Link>
      </div>
      
      <p className="text-sm text-gray-400 mt-4">Раздел в разработке</p>
    </div>
  );
}