'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Settings, LogOut, Menu, X, Shield } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const unreadCount = useUnreadMessages();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600 shrink-0">
          Arendasv74
        </Link>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-gray-700">
          <Link href="/" className="hover:text-blue-600 transition-colors">Каталог</Link>
          <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">Как это работает</Link>
          {user ? (
            <>
              <Link href="/cars/create" className="hover:text-blue-600 transition-colors">Добавить объявление</Link>
              <Link href="/dashboard/messages" className="relative hover:text-blue-600 transition-colors">
                Сообщения
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-5 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              {user?.is_admin && (
                <Link href="/admin" className="hover:text-blue-600 transition-colors">
                  Админка
                </Link>
              )}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Меню пользователя"
                >
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt="Аватар" width={32} height={32} className="object-cover w-full h-full" unoptimized={user.avatar_url?.startsWith('http')} />
                  ) : (
                    <Image src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '?')}&background=random&size=64`} alt="Аватар" width={32} height={32} className="object-cover w-full h-full" unoptimized />
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(false)}>
                      <User className="w-4 h-4" /> Личный кабинет
                    </Link>
                    <Link href="/profile/edit" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(false)}>
                      <Settings className="w-4 h-4" /> Редактировать профиль
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 transition-colors">
                      <LogOut className="w-4 h-4" /> Выйти
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-blue-600 transition-colors">Войти</Link>
              <Link href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Регистрация</Link>
            </>
          )}
        </nav>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors relative" aria-label="Открыть меню">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5 font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-white z-40 overflow-y-auto" ref={mobileMenuRef}>
          <nav className="flex flex-col p-4 space-y-1">
            <Link href="/" className="px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg" onClick={closeAllMenus}>Каталог</Link>
            <Link href="/how-it-works" className="px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg" onClick={closeAllMenus}>Как это работает</Link>
            {user ? (
              <>
                <Link href="/cars/create" className="px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg" onClick={closeAllMenus}>Добавить объявление</Link>
                <Link href="/dashboard/messages" className="relative px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg flex items-center" onClick={closeAllMenus}>
                  Сообщения
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full px-1 font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user?.is_admin && (
                  <Link href="/admin" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg" onClick={closeAllMenus}>
                    <Shield className="w-5 h-5" /> Админка
                  </Link>
                )}
                <hr className="my-2" />
                <div className="px-4 py-2">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg" onClick={closeAllMenus}>
                  <User className="w-5 h-5" /> Личный кабинет
                </Link>
                <Link href="/profile/edit" className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg" onClick={closeAllMenus}>
                  <Settings className="w-5 h-5" /> Редактировать профиль
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-red-600 transition-colors text-lg">
                  <LogOut className="w-5 h-5" /> Выйти
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg" onClick={closeAllMenus}>Войти</Link>
                <Link href="/auth/register" className="px-4 py-3 rounded-lg bg-blue-600 text-white text-center hover:bg-blue-700 transition-colors text-lg" onClick={closeAllMenus}>Регистрация</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}