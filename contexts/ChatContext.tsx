'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  openChat: (carId?: number, carName?: string, convId?: number) => void;
  closeChat: () => void;
  chatCarId: number | null;
  chatCarName: string;
  initialConvId: number | null;
  isChatOpen: boolean;
  isGeneralList: boolean;
}

const ChatContext = createContext<ChatContextType>({
  openChat: () => {},
  closeChat: () => {},
  chatCarId: null,
  chatCarName: '',
  initialConvId: null,
  isChatOpen: false,
  isGeneralList: false,
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatCarId, setChatCarId] = useState<number | null>(null);
  const [chatCarName, setChatCarName] = useState('');
  const [initialConvId, setInitialConvId] = useState<number | null>(null);
  const [isGeneralList, setIsGeneralList] = useState(false);

  const openChat = (carId?: number, carName?: string, convId?: number) => {
    if (carId === undefined || carId === null) {
      // Открыть список чатов
      setIsGeneralList(true);
      setChatCarId(null);
      setChatCarName('Все сообщения');
      setInitialConvId(null);
    } else {
      // Открыть конкретный чат
      setIsGeneralList(false);
      setChatCarId(carId);
      setChatCarName(carName || 'Чат');
      setInitialConvId(convId || null);
    }
  };

  const closeChat = () => {
    setChatCarId(null);
    setChatCarName('');
    setInitialConvId(null);
    setIsGeneralList(false);
  };

  return (
    <ChatContext.Provider value={{
      openChat,
      closeChat,
      chatCarId,
      chatCarName,
      initialConvId,
      isChatOpen: chatCarId !== null || isGeneralList,
      isGeneralList
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);