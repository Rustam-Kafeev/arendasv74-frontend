'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const res = await api.get('/conversations');
        const conversations = res.data || [];
        const count = conversations.filter((c: any) => c.unread_count > 0).length;
        setUnreadCount(count);
      } catch (err) {
        logError('Ошибка загрузки сообщений:', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return unreadCount;
}