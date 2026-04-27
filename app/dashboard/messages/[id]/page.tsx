'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';

export default function ChatDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = async () => {
    try {
      const res = await api.get(`/conversations/${id}`);
      setConversation(res.data);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Ошибка загрузки беседы:', error);
    }
  };

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      await api.post(`/conversations/${id}/messages`, { body: newMsg });
      setNewMsg('');
      fetchConversation();
    } catch (error) {
      alert('Ошибка отправки сообщения');
    }
  };

  if (!conversation) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  const otherUser = user?.id === conversation.renter_id
    ? conversation.owner
    : conversation.renter;

  return (
    <div className="flex flex-col h-[75vh] border rounded-lg overflow-hidden">
      {/* Заголовок */}
      <div className="bg-gray-100 p-4 border-b">
        <h2 className="font-semibold">
          {conversation.car?.brand} {conversation.car?.model}
        </h2>
        <p className="text-sm text-gray-600">Собеседник: {otherUser?.name}</p>
      </div>

      {/* Сообщения */}
   <div className="flex-1 overflow-y-auto p-4 space-y-3">
  {messages.map((msg) => {
    const isOwn = msg.user_id === user?.id;
    return (
      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[75%] p-3 rounded-lg ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
          <p>{msg.body}</p>
          <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'} block mt-1`}>
            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  })}
  <div ref={messagesEndRef} />
</div>

      {/* Форма отправки */}
      <form onSubmit={sendMessage} className="border-t p-3 flex gap-2">
        <input
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Введите сообщение..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
          Отправить
        </button>
      </form>
    </div>
  );
}