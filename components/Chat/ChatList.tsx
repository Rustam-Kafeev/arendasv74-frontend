'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useChat } from '@/contexts/ChatContext';
import { X, MessageCircle, ChevronRight, User } from 'lucide-react';
import { logError } from '@/lib/logger';

interface ChatListProps {
  onClose: () => void;
}

export default function ChatList({ onClose }: ChatListProps) {
  const { user } = useAuth();
  const { openChat } = useChat();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/conversations');
      setConversations(res.data || []);
    } catch (err) {
      logError('Ошибка загрузки чатов:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col md:left-auto md:right-4 md:bottom-16 md:w-96 md:rounded-2xl md:max-h-[500px]">
        <div className="flex items-center justify-between p-4 border-b shrink-0 md:rounded-t-2xl">
          <h2 className="font-semibold text-lg">Сообщения</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm">У вас пока нет сообщений</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  onClose();
                  openChat(conv.car_id, `${conv.interlocutor_name} — ${conv.car_name}`, conv.id);
                }}
                className="flex items-start gap-3 p-4 hover:bg-gray-50 border-b transition w-full text-left"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{conv.interlocutor_name}</p>
                    {conv.unread_count > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full ml-2 shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.car_name}</p>
                  <p className="text-sm text-gray-700 mt-0.5 line-clamp-1">
                    {conv.last_message || 'Нет сообщений'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}