'use client';

import { useEffect, useRef, useReducer } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ArrowLeft, Send, User, Phone, MessageCircle, Mic, X } from 'lucide-react';
import PhotoUploader from '@/components/Chat/PhotoUploader';
import MessageContent from '@/components/Chat/MessageContent';
import { isImageUrl, getImageUrl } from '@/lib/utils';

interface ChatState {
  messages: any[];
  newMsg: string;
  loading: boolean;
  error: string | null;
  conversation: any;
  lightboxImage: string | null;
  sending: boolean;
}

type ChatAction =
  | { type: 'SET_MESSAGES'; payload: any[] }
  | { type: 'SET_NEW_MSG'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATION'; payload: any }
  | { type: 'SET_LIGHTBOX_IMAGE'; payload: string | null }
  | { type: 'SET_SENDING'; payload: boolean }
  | { type: 'ADD_OPTIMISTIC_MESSAGE'; payload: any }
  | { type: 'REMOVE_OPTIMISTIC_MESSAGE'; payload: number };

const initialState: ChatState = {
  messages: [], newMsg: '', loading: true, error: null,
  conversation: null, lightboxImage: null, sending: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_MESSAGES': return { ...state, messages: action.payload };
    case 'SET_NEW_MSG': return { ...state, newMsg: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'SET_CONVERSATION': return { ...state, conversation: action.payload };
    case 'SET_LIGHTBOX_IMAGE': return { ...state, lightboxImage: action.payload };
    case 'SET_SENDING': return { ...state, sending: action.payload };
    case 'ADD_OPTIMISTIC_MESSAGE': return { ...state, messages: [...state.messages, action.payload] };
    case 'REMOVE_OPTIMISTIC_MESSAGE': return { ...state, messages: state.messages.filter(m => m.id !== action.payload) };
    default: return state;
  }
}

export default function ChatDetailPage() {
  const { id } = useParams();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) { router.push('/auth/login'); return; }
    if (!id) return;
    api.get(`/conversations/${id}`)
      .then(res => {
        dispatch({ type: 'SET_CONVERSATION', payload: res.data });
        dispatch({ type: 'SET_MESSAGES', payload: res.data.messages || [] });
        dispatch({ type: 'SET_LOADING', payload: false });
        api.post('/conversations/mark-read').catch(console.error);
      })
      .catch(() => {
        dispatch({ type: 'SET_ERROR', payload: 'Не удалось загрузить диалог' });
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, [id, user, isLoading, router]);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/conversations/${id}`);
        dispatch({ type: 'SET_MESSAGES', payload: res.data.messages || [] });
      } catch (err) { console.error(err); }
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [state.messages]);

  useEffect(() => {
    if (!state.loading && inputRef.current) inputRef.current.focus();
  }, [state.loading]);

  const sendMessage = async (body: string) => {
    if (!body?.trim() || state.sending) return;
    const messageToSend = body.trim();
    dispatch({ type: 'SET_SENDING', payload: true });
    dispatch({ type: 'SET_NEW_MSG', payload: '' });
    const optimisticMessage = { id: Date.now(), user_id: user?.id, body: messageToSend, created_at: new Date().toISOString() };
    dispatch({ type: 'ADD_OPTIMISTIC_MESSAGE', payload: optimisticMessage });
    try {
      await api.post(`/conversations/${id}/messages`, { body: messageToSend });
      const res = await api.get(`/conversations/${id}`);
      dispatch({ type: 'SET_MESSAGES', payload: res.data.messages || [] });
    } catch (err) {
      dispatch({ type: 'REMOVE_OPTIMISTIC_MESSAGE', payload: optimisticMessage.id });
      dispatch({ type: 'SET_NEW_MSG', payload: messageToSend });
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false });
      inputRef.current?.focus();
    }
  };

  if (isLoading || state.loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (state.error) return <div className="max-w-2xl mx-auto px-4 py-8 text-center"><p className="text-red-500 mb-4">{state.error}</p><button onClick={() => router.back()} className="text-blue-600 hover:underline">Вернуться назад</button></div>;
  if (!state.conversation) return <div className="max-w-2xl mx-auto px-4 py-8 text-center"><p className="text-gray-500">Диалог не найден</p><Link href="/dashboard/messages" className="text-blue-600 hover:underline mt-2 inline-block">Вернуться к сообщениям</Link></div>;

  const interlocutor = state.conversation?.renter_id === user?.id ? state.conversation?.owner : state.conversation?.renter;
  const car = state.conversation?.car;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden fixed inset-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shrink-0">
        <Link href="/dashboard/messages" className="p-2 hover:bg-gray-100 rounded-full transition shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0"><User className="w-5 h-5" /></div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{interlocutor?.name || 'Пользователь'}</p>
          {car && <p className="text-xs text-gray-500 truncate">{car.brand} {car.model}</p>}
        </div>
        {interlocutor?.phone && (
          <a href={`tel:${interlocutor.phone.replace(/[^\d+]/g, '')}`} className="p-2 hover:bg-gray-100 rounded-full transition shrink-0" title="Позвонить"><Phone className="w-5 h-5 text-gray-600" /></a>
        )}
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {state.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-12 h-12 mb-2 text-gray-300" />
            <p>Напишите первым!</p>
          </div>
        ) : (
          state.messages.map((msg, idx) => {
            const isOwn = msg.user_id === user?.id;
            const showAvatar = !isOwn && (idx === 0 || state.messages[idx - 1]?.user_id !== msg.user_id);
            const hasImage = isImageUrl(msg.body);
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {!isOwn && (
                  <div className="shrink-0">
                    {showAvatar ? (
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">{interlocutor?.name?.charAt(0) || '?'}</div>
                    ) : (<div className="w-7 h-7" />)}
                  </div>
                )}
                <div className="max-w-[75%]">
                  <p className={`text-xs mb-0.5 ${isOwn ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className={`${hasImage ? '' : 'p-2.5 rounded-2xl text-sm '} ${isOwn ? (hasImage ? '' : 'bg-blue-500 text-white rounded-br-md') : (hasImage ? '' : 'bg-gray-100 text-gray-900 rounded-bl-md')}`}>
                    <MessageContent body={msg.body} onImageClick={(url) => dispatch({ type: 'SET_LIGHTBOX_IMAGE', payload: url })} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t px-3 py-2 flex gap-2 items-center bg-white shrink-0 pb-[env(safe-area-inset-bottom,12px)]">
        <PhotoUploader onUpload={async (url) => { await sendMessage(url); }} />
        <input
          ref={inputRef}
          value={state.newMsg}
          onChange={e => dispatch({ type: 'SET_NEW_MSG', payload: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && sendMessage(state.newMsg)}
          className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Сообщение..."
        />
        {state.newMsg.trim() ? (
          <button onClick={() => sendMessage(state.newMsg)} disabled={state.sending} className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition disabled:opacity-50 shrink-0"><Send className="w-5 h-5" /></button>
        ) : (
          <button className="p-2 hover:bg-gray-100 rounded-full transition shrink-0 text-gray-500" title="Голосовое сообщение"><Mic className="w-5 h-5" /></button>
        )}
      </div>

      {state.lightboxImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => dispatch({ type: 'SET_LIGHTBOX_IMAGE', payload: null })}>
          <button onClick={() => dispatch({ type: 'SET_LIGHTBOX_IMAGE', payload: null })} className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"><X className="w-6 h-6" /></button>
          <img src={getImageUrl(state.lightboxImage)} alt="Просмотр фото" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}