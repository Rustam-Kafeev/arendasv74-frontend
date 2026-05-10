'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, ChevronRight, Trash2, User } from 'lucide-react';

interface Conversation {
  id: number;
  car_id: number;
  car_name: string;
  interlocutor_name: string;
  interlocutor_id: number;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  created_at: string;
}

export default function MessagesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/conversations');
      setConversations(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить сообщения');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      loadConversations();
      api.post('/conversations/mark-read').catch(console.error);
    }
  }, [user, isLoading, router, loadConversations]);

  const handleDelete = async (convId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Удалить этот диалог?')) return;
    try {
      await api.delete(`/conversations/${convId}`);
      setConversations(prev => prev.filter(c => c.id !== convId));
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={loadConversations} className="text-blue-600 hover:underline">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Сообщения</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg mb-1">У вас пока нет сообщений</p>
          <p className="text-sm">Когда кто-то напишет вам по объявлению, чат появится здесь</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Link
              key={conv.id}
              href={`/dashboard/messages/${conv.id}`}
              className="flex items-start gap-3 bg-white rounded-xl shadow-sm border p-4 hover:bg-gray-50 transition relative group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{conv.interlocutor_name}</p>
                  {conv.unread_count > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full ml-2 shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.car_name}</p>
                <p className="text-sm text-gray-700 mt-0.5 line-clamp-1">
                  {conv.last_message || 'Нет сообщений'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">{conv.last_message_time}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={(e) => handleDelete(conv.id, e)}
                className="absolute top-2 right-2 p-1.5 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                title="Удалить диалог"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}