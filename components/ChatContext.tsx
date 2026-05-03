'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  openChat: (carId: number, carName?: string) => void;
  closeChat: () => void;
  chatCarId: number | null;
  chatCarName: string;
  isChatOpen: boolean;
}

const ChatContext = createContext<ChatContextType>({
  openChat: () => {},
  closeChat: () => {},
  chatCarId: null,
  chatCarName: '',
  isChatOpen: false,
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatCarId, setChatCarId] = useState<number | null>(null);
  const [chatCarName, setChatCarName] = useState('');

  const openChat = (carId: number, carName?: string) => {
    setChatCarId(carId);
    setChatCarName(carName || '');
  };

  const closeChat = () => {
    setChatCarId(null);
    setChatCarName('');
  };

  return (
    <ChatContext.Provider value={{ openChat, closeChat, chatCarId, chatCarName, isChatOpen: chatCarId !== null }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);