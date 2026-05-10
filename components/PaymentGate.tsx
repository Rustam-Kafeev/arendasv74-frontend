'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface PaymentGateProps {
  isAdmin: boolean;
  carsCount: number;
  isEditing?: boolean;
  freeLimit?: number;
  children: React.ReactNode;
}

export default function PaymentGate({ isAdmin, carsCount, isEditing = false, freeLimit = 0, children }: PaymentGateProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  if (isAdmin || isEditing) return <>{children}</>;

  if (carsCount < freeLimit) return <>{children}</>;

  return (
    <>
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Лимит объявлений исчерпан</h2>
        <p className="text-gray-500 mb-4">
          Вы разместили {carsCount} объявлений. Для размещения новых объявлений необходимо оплатить тариф.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            Выбрать тариф
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            В личный кабинет
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Тарифы на размещение</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="border rounded-xl p-4 hover:border-blue-300 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium">Базовый</p><p className="text-sm text-gray-500">1 объявление на 30 дней</p></div>
                  <p className="font-bold text-lg">500 ₽</p>
                </div>
              </div>
              <div className="border rounded-xl p-4 hover:border-blue-300 transition cursor-pointer border-blue-500 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Стандарт</p>
                    <p className="text-sm text-gray-500">5 объявлений на 30 дней</p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Популярный</span>
                  </div>
                  <p className="font-bold text-lg">2 000 ₽</p>
                </div>
              </div>
              <div className="border rounded-xl p-4 hover:border-blue-300 transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium">Бизнес</p><p className="text-sm text-gray-500">20 объявлений на 30 дней</p></div>
                  <p className="font-bold text-lg">5 000 ₽</p>
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium">
              Перейти к оплате
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">Оплата будет доступна после подключения платёжного шлюза</p>
          </div>
        </div>
      )}
    </>
  );
}