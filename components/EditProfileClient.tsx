'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';

export default function EditProfileClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div className="text-center py-8">Загрузка...</div>;
  if (!user) return null; // если редирект ещё не сработал, ничего не рендерим

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('email', email);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // После успешного сохранения перезагружаем страницу, чтобы обновить аватар в интерфейсе
      window.location.reload();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка при сохранении профиля');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/profile/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });
      setMessage('Пароль успешно изменён');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка смены пароля');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Редактировать профиль</h1>
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('успешно') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Кликабельный аватар */}
      <div className="flex flex-col items-center mb-8">
        <div
          onClick={handleAvatarClick}
          className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 cursor-pointer hover:opacity-80 transition relative group border-2 border-dashed border-gray-400"
          title="Нажмите, чтобы загрузить фото"
        >
          {preview ? (
            <Image src={preview} alt="Предпросмотр" fill className="object-cover" unoptimized />
          ) : user.avatar_url ? (
            <Image src={user.avatar_url} alt="Аватар" fill className="object-cover" unoptimized={user.avatar_url.startsWith('http')} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500 bg-gray-100">
              {user.name?.charAt(0) || '?'}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition">
            <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">Сменить фото</span>
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          className="hidden"
        />
        <button type="button" onClick={handleAvatarClick} className="mt-2 text-sm text-blue-600 hover:underline">
          Загрузить аватар
        </button>
      </div>

      {/* Форма профиля */}
      <form onSubmit={handleProfileUpdate} className="space-y-4 mb-8">
        <div>
          <label className="block mb-1">Имя</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Телефон</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Сохранить изменения
        </button>
      </form>

      {/* Смена пароля */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Сменить пароль</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block mb-1">Текущий пароль</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block mb-1">Новый пароль</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block mb-1">Подтверждение пароля</label>
            <input type="password" value={newPasswordConfirmation} onChange={e => setNewPasswordConfirmation(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Изменить пароль
          </button>
        </form>
      </div>
    </div>
  );
}