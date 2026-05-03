'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useChat } from '@/components/ChatContext';
import { X, Send, MessageCircle } from 'lucide-react';

const quickReplies = [
  'Здравствуйте! Подскажите, пожалуйста, условия.',
  'Какая цена при выкупе?',
];

export default function ChatPopup() {
  const { chatCarId, chatCarName, closeChat, isChatOpen } = useChat();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatCarId || !user) return;

    api.get(`/cars/${chatCarId}/conversation`)
      .then(res => {
        setConversationId(res.data.id);
        setMessages(res.data.messages || []);
      })
      .catch(console.error);
  }, [chatCarId, user]);

  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(async () => {
      const res = await api.get(`/conversations/${conversationId}`);
      setMessages(res.data.messages || []);
    }, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const sendMessage = async (body: string) => {
    if (!conversationId || !body.trim()) return;
    await api.post(`/conversations/${conversationId}/messages`, { body });
    setNewMsg('');
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border flex flex-col z-50">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-sm">{chatCarName || 'Чат'}</span>
        </div>
        <button onClick={closeChat} className="p-1 hover:bg-gray-200 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(msg => {
          const isOwn = msg.user_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-2 rounded-lg text-sm ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                {msg.body}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="border-t p-2 flex gap-2">
        <input
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(newMsg)}
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Сообщение..."
        />
        <button
          onClick={() => sendMessage(newMsg)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Быстрые ответы */}
      <div className="flex gap-2 overflow-x-auto p-2 border-t">
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(reply)}
            className="whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-sm px-3 py-1 rounded-full"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}