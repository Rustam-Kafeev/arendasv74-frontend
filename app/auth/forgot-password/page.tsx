'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { register: registerEmail, handleSubmit: handleEmail } = useForm();
  const { register: registerCode, handleSubmit: handleCode } = useForm();
  const { register: registerPassword, handleSubmit: handlePassword } = useForm();

  const sendCode = async (data: any) => {
    setError(null);
    try {
      await api.post('/forgot-password', { email: data.email });
      setEmail(data.email);
      setStep('code');
    } catch (err: any) {
      setError('Не удалось отправить код');
    }
  };

  const verifyCode = async (data: any) => {
    setError(null);
    setCode(data.code);
    setStep('password');
  };

  const resetPassword = async (data: any) => {
    setError(null);
    try {
      await api.post('/reset-password', {
        email,
        code,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      setSuccess(true);
    } catch (err: any) {
      setError('Неверный код или ошибка');
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Пароль изменён!</h1>
        <Link href="/auth/login" className="text-blue-600 hover:underline">Войти</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Назад ко входу
      </Link>
      <h1 className="text-2xl font-bold mb-6">Восстановление пароля</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {step === 'email' && (
        <form onSubmit={handleEmail(sendCode)} className="space-y-4">
          <p className="text-sm text-gray-500">Введите email, на который зарегистрирован аккаунт</p>
          <input {...registerEmail('email')} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Email" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm">Отправить код</button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={handleCode(verifyCode)} className="space-y-4">
          <p className="text-sm text-gray-500">Введите код, отправленный на {email}</p>
          <input {...registerCode('code')} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Код из письма" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm">Подтвердить</button>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={handlePassword(resetPassword)} className="space-y-4">
          <p className="text-sm text-gray-500">Придумайте новый пароль</p>
          <input type="password" {...registerPassword('password')} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Новый пароль" required />
          <input type="password" {...registerPassword('password_confirmation')} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Подтвердите пароль" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm">Сохранить пароль</button>
        </form>
      )}
    </div>
  );
}