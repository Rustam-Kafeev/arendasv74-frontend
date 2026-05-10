'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function AdminConversationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = () => {
    api.get('/admin/conversations')
      .then(res => { setConversations(res.data.data || res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && !user?.is_admin) { router.push('/auth/login'); return; }
    loadConversations();
  }, [user, isLoading, router]);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот диалог?')) return;
    try {
      await api.delete(`/admin/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
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
        <h1 className="text-2xl font-bold">Диалоги</h1>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Авто</th>
              <th className="p-3 text-left">Владелец</th>
              <th className="p-3 text-left">Арендатор</th>
              <th className="p-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.car?.brand} {c.car?.model}</td>
                <td className="p-3">{c.owner?.name || '—'}</td>
                <td className="p-3">{c.renter?.name || '—'}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 hover:text-red-700 p-1"
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