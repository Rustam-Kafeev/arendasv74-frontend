// components/CreateCarClient.tsx (фрагмент)
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
// ... остальные импорты

export default function CreateCarClient() {
  const [allCities, setAllCities] = useState<{ id: number; name: string }[]>([]);
  const [selectedCities, setSelectedCities] = useState<number[]>([]);
  const [useAllCities, setUseAllCities] = useState(true);

  useEffect(() => {
    // Загружаем список городов при монтировании
    api.get('/cities').then(res => setAllCities(res.data));
  }, []);

  const handleSubmit = async (data: CarForm) => {
    // ... код подготовки formData
    if (!useAllCities && selectedCities.length > 0) {
      // Отправляем массив городов с ценами, взятыми из основных полей
      formData.append('cities', JSON.stringify(
        selectedCities.map(id => ({
          id,
          price_per_day: data.price_per_day,
          buyout_price: data.buyout_price || null,
          description: data.description,
        }))
      ));
    }
    // иначе cities не отправляем → бэкенд привяжет ко всем городам автоматически
    // ... остальной код отправки
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... поля марка, модель, год, описание, цена ... */}

      {/* Выбор городов */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useAllCities}
            onChange={(e) => setUseAllCities(e.target.checked)}
          />
          <span>Доступно во всех городах России</span>
        </label>
        {!useAllCities && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">Выберите города:</p>
            <select
              multiple
              value={selectedCities.map(String)}
              onChange={(e) =>
                setSelectedCities(
                  Array.from(e.target.selectedOptions, (o) => Number(o.value))
                )
              }
              className="w-full border rounded px-3 py-2"
              size={Math.min(allCities.length, 8)}
            >
              {allCities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Удерживайте Ctrl/Cmd для выбора нескольких.</p>
          </div>
        )}
      </div>

      {/* ... остальные поля (фото, кнопка отправки) ... */}
    </form>
  );
}