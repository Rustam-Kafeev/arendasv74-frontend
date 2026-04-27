'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Settings, LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Arendasv74
        </Link>
        <nav className="flex items-center space-x-4 text-gray-700">
          <Link href="/" className="hover:text-blue-600">Каталог</Link>
          <Link href="/how-it-works" className="hover:text-blue-600">Как это работает</Link>
          {user ? (
            <>
              <Link href="/cars/create" className="hover:text-blue-600">Добавить объявление</Link>
              <Link href="/dashboard/messages" className="hover:text-blue-600">Сообщения</Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="Аватар"
                      width={32}
                      height={32}
                      className="object-cover"
                      unoptimized={user.avatar_url.startsWith('http://127.0.0.1')}
                    />
                  ) : (
                    <Image
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '?')}&background=random&size=64`}
                      alt="Аватар"
                      width={32}
                      height={32}
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="w-4 h-4" /> Личный кабинет
                    </Link>
                    <Link
                      href="/profile/edit"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" /> Редактировать профиль
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      <LogOut className="w-4 h-4" /> Выйти
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-blue-600">Войти</Link>
              <Link href="/auth/register" className="hover:text-blue-600">Регистрация</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}