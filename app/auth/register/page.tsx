'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(1, 'Укажите имя'),
  email: z.string().email('Неверный email').min(1, 'Укажите email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Минимум 6 символов'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Пароли не совпадают',
  path: ['password_confirmation'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

 const onSubmit = async (data: RegisterForm) => {
  setError(null);
  setServerErrors({});
  try {
    await api.post('/register', data);
    router.push('/auth/login?registered=true');
  } catch (err: any) {
    if (err.response?.status === 422) {
      const errors = err.response.data.errors;
      if (errors) {
        const flat: Record<string, string> = {};
        Object.entries(errors).forEach(([key, msgs]) => {
          flat[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setServerErrors(flat);
      }
    } else {
      setError(err.response?.data?.message || 'Ошибка при регистрации');
    }
  }
};

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Регистрация</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('name')}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Имя"
          />
          {errors.name?.message && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          {serverErrors.name && <p className="text-red-500 text-xs mt-1">{serverErrors.name}</p>}
        </div>

        <div>
          <input
            {...register('email')}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
          />
          {errors.email?.message && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          {serverErrors.email && <p className="text-red-500 text-xs mt-1">{serverErrors.email}</p>}
        </div>

        <div>
          <input
            {...register('phone')}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Телефон"
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            placeholder="Пароль"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {errors.password?.message && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          {serverErrors.password && <p className="text-red-500 text-xs mt-1">{serverErrors.password}</p>}
        </div>

        <div className="relative">
          <input
            type={showConfirmation ? 'text' : 'password'}
            {...register('password_confirmation')}
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            placeholder="Подтверждение пароля"
          />
          <button
            type="button"
            onClick={() => setShowConfirmation(!showConfirmation)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {errors.password_confirmation?.message && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Уже есть аккаунт?{' '}
        <Link href="/auth/login" className="text-blue-600 hover:underline">Войти</Link>
      </p>
    </div>
  );
}