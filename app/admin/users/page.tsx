'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    api.get('/admin/users')
      .then(res => { setUsers(res.data.data || res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && !user?.is_admin) { router.push('/auth/login'); return; }
    loadUsers();
  }, [user, isLoading, router]);

  const handleDelete = async (id: number) => {
    if (id === user?.id) {
      alert('Нельзя удалить самого себя');
      return;
    }
    if (!confirm('Удалить этого пользователя?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  if (isLoading || loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!user?.is_admin) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold">Пользователи</h1>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Имя</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Телефон</th>
              <th className="p-3 text-left">Админ</th>
              <th className="p-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone || '—'}</td>
                <td className="p-3">{u.is_admin ? '✅' : '—'}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}