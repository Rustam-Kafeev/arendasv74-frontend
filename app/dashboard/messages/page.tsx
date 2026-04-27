'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/conversations')
      .then(res => setConversations(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Сообщения</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-500">У вас пока нет сообщений.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/dashboard/messages/${conv.id}`}
              className="block border p-4 rounded hover:bg-gray-50 transition"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium">
                    {conv.car.brand} {conv.car.model}
                  </p>
                  <p className="text-sm text-gray-600">
                    {conv.renter_id === user?.id ? 'Вы арендатор' : 'Вы владелец'}
                  </p>
                  {conv.messages?.[0] && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {conv.messages[0].body}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}