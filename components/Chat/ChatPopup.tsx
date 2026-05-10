'use client';

import { useEffect, useRef, useReducer } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useChat } from '@/contexts/ChatContext';
import { X, Send, MessageCircle, Loader2, ChevronUp, ArrowLeft, Phone, Mic } from 'lucide-react';
import PhotoUploader from '@/components/Chat/PhotoUploader';
import MessageContent from '@/components/Chat/MessageContent';
import ChatList from '@/components/Chat/ChatList';
import { isImageUrl, getImageUrl } from '@/lib/utils';
import { chatReducer, initialChatState } from '@/components/Chat/chatReducer';
import { logError } from '@/lib/logger';

export default function ChatPopup() {
  const { chatCarId, chatCarName, closeChat, isChatOpen, isGeneralList, openChat, initialConvId } = useChat();
  const { user } = useAuth();
  const pathname = usePathname();
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatCarId) {
      dispatch({ type: 'SET_CONV_ID', payload: initialConvId });
      dispatch({ type: 'SET_MESSAGES', payload: [] });
      dispatch({ type: 'SET_NEW_MSG', payload: '' });
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [chatCarId, initialConvId]);

  useEffect(() => {
    if (!chatCarId || !user || isGeneralList) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const loadChat = state.convId
      ? api.get(`/conversations/${state.convId}`)
      : api.get(`/cars/${chatCarId}/conversation`);

    loadChat
      .then(res => {
        const data = res.data;
        if (!state.convId) dispatch({ type: 'SET_CONV_ID', payload: data.id });
        dispatch({ type: 'SET_MESSAGES', payload: data.messages || [] });
        const interlocutor = data.renter_id === user.id ? data.owner : data.renter;
        dispatch({ type: 'SET_PHONE_NUMBER', payload: interlocutor?.phone || null });
        dispatch({ type: 'SET_LOADING', payload: false });
      })
      .catch(() => {
        dispatch({ type: 'SET_ERROR', payload: 'Не удалось загрузить чат' });
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, [chatCarId, user, isGeneralList, state.convId]);

  useEffect(() => {
    if (!state.convId || isGeneralList) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/conversations/${state.convId}`);
        dispatch({ type: 'SET_MESSAGES', payload: res.data.messages || [] });
      } catch (err) { logError('Ошибка обновления:', err); }
    }, 3000);
    return () => clearInterval(interval);
  }, [state.convId, isGeneralList]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const sendMessage = async (body: string) => {
    if (!state.convId || !body.trim()) return;
    const messageToSend = body.trim();
    dispatch({ type: 'SET_NEW_MSG', payload: '' });
    const optimisticMessage = { id: Date.now(), user_id: user?.id, body: messageToSend, created_at: new Date().toISOString() };
    dispatch({ type: 'ADD_OPTIMISTIC_MESSAGE', payload: optimisticMessage });
    try {
      await api.post(`/conversations/${state.convId}/messages`, { body: messageToSend });
      const res = await api.get(`/conversations/${state.convId}`);
      dispatch({ type: 'SET_MESSAGES', payload: res.data.messages || [] });
    } catch (err) {
      dispatch({ type: 'REMOVE_OPTIMISTIC_MESSAGE', payload: optimisticMessage.id });
      dispatch({ type: 'SET_NEW_MSG', payload: messageToSend });
    }
  };

  const handleBackToList = () => {
    closeChat();
    setTimeout(() => openChat(), 100);
  };

  const showChatPopup = isChatOpen && !isGeneralList;
  const isChatPage = pathname?.startsWith('/dashboard/messages/') || pathname === '/dashboard/messages';

  if (!user) return null;

  return (
    <>
      {/* Плашка «Сообщения» */}
      {!showChatPopup && !isGeneralList && !isChatPage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:left-auto md:right-4 md:bottom-4 md:w-auto">
          <div className="bg-white border-t md:border md:rounded-2xl shadow-lg md:shadow-xl">
            <button onClick={() => openChat()} className="w-full flex items-center justify-between px-4 py-3 md:px-4 md:py-2.5 hover:bg-gray-50 transition md:rounded-2xl">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-sm">Сообщения</span>
              </div>
              <ChevronUp className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {!showChatPopup && !isGeneralList && !isChatPage && <div className="h-14 md:hidden" />}

      {/* Список чатов */}
      {isGeneralList && <ChatList onClose={closeChat} />}

      {/* Попап с конкретным чатом */}
      {showChatPopup && !isChatPage && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeChat} />
          <div className="fixed inset-0 z-50 bg-white flex flex-col md:inset-auto md:bottom-4 md:right-4 md:left-auto md:w-96 md:h-[550px] md:rounded-2xl md:shadow-2xl md:border">
            <div className="flex items-center gap-2 p-3 border-b bg-gray-50 md:rounded-t-2xl shrink-0">
              <button onClick={handleBackToList} className="p-1 hover:bg-gray-200 rounded-full shrink-0"><ArrowLeft className="w-5 h-5" /></button>
              <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{chatCarName || 'Чат'}</p></div>
              {state.phoneNumber && <a href={`tel:${state.phoneNumber.replace(/[^\d+]/g, '')}`} className="p-1.5 hover:bg-gray-200 rounded-full shrink-0"><Phone className="w-4 h-4 text-gray-600" /></a>}
              <button onClick={closeChat} className="p-1 hover:bg-gray-200 rounded-full shrink-0"><X className="w-5 h-5" /></button>
            </div>

            {state.loading ? (
              <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : state.error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4">
                <p className="text-red-500 text-sm mb-2">{state.error}</p>
                <button onClick={() => window.location.reload()} className="text-blue-600 text-sm hover:underline">Попробовать снова</button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {state.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400"><MessageCircle className="w-10 h-10 mb-2 text-gray-300" /><p className="text-sm">Напишите первым!</p></div>
                  ) : (
                    state.messages.map((msg, idx) => {
                      const isOwn = msg.user_id === user?.id;
                      const showAvatar = !isOwn && (idx === 0 || state.messages[idx - 1]?.user_id !== msg.user_id);
                      const hasImage = isImageUrl(msg.body);
                      return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          {!isOwn && <div className="shrink-0">{showAvatar ? <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">{chatCarName?.split(' — ')[0]?.charAt(0) || '?'}</div> : <div className="w-7 h-7" />}</div>}
                          <div className="max-w-[75%]">
                            <p className={`text-xs mb-0.5 ${isOwn ? 'text-right text-gray-400' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <div className={`${hasImage ? '' : 'p-2.5 rounded-2xl text-sm '} ${isOwn ? (hasImage ? '' : 'bg-blue-500 text-white rounded-br-md') : (hasImage ? '' : 'bg-gray-100 text-gray-900 rounded-bl-md')}`}><MessageContent body={msg.body} onImageClick={(url) => dispatch({ type: 'SET_LIGHTBOX_IMAGE', payload: url })} /></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t p-2 flex gap-1 shrink-0 items-center">
                  <PhotoUploader onUpload={async (url) => { await sendMessage(url); }} />
                  <input value={state.newMsg} onChange={e => dispatch({ type: 'SET_NEW_MSG', payload: e.target.value })} onKeyDown={e => e.key === 'Enter' && sendMessage(state.newMsg)} className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Сообщение..." />
                  {state.newMsg.trim() ? (
                    <button onClick={() => sendMessage(state.newMsg)} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shrink-0"><Send className="w-4 h-4" /></button>
                  ) : (
                    <button className="p-2 hover:bg-gray-100 rounded-full transition shrink-0 text-gray-500" title="Голосовое сообщение"><Mic className="w-4 h-4" /></button>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {state.lightboxImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => dispatch({ type: 'SET_LIGHTBOX_IMAGE', payload: null })}>
          <button onClick={() => dispatch({ type: 'SET_LIGHTBOX_IMAGE', payload: null })} className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"><X className="w-6 h-6" /></button>
          <img src={getImageUrl(state.lightboxImage)} alt="Просмотр фото" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}
    </>
  );
}