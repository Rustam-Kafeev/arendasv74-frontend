'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCitySelector } from '@/hooks/useCitySelector';
import { ArrowLeft, ChevronDown, Search } from 'lucide-react';

export default function CarCitiesPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const currentCity = searchParams.get('city') || '';
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const [priceDisplay, setPriceDisplay] = useState('');
  const [pricePeriod, setPricePeriod] = useState('day');
  const [advanceDisplay, setAdvanceDisplay] = useState('');
  const [description, setDescription] = useState('');

  const {
    allCities,
    selectedCities,
    setSelectedCities,
    toggleCity,
    selectAll,
    deselectAll,
    isSelected,
    loading: citiesLoading,
  } = useCitySelector();

  useEffect(() => {
    if (!isLoading && !user) { router.push('/auth/login'); return; }
    if (!id) return;

    api.get(`/cars/${id}`).then(res => {
      const d = res.data;
      setCar(d);
      const cities = (d.cities || []).map((c: any) => ({
        id: c.id, name: c.name,
        price: c.pivot?.price_per_day ?? 0,
        price_period: c.pivot?.price_period || 'day',
        advance: c.pivot?.advance || 0,
        description: c.pivot?.description || '',
      }));
      setSelectedCities(cities);
      if (cities.length > 0) {
        setPriceDisplay(cities[0].price ? cities[0].price.toLocaleString('ru-RU') : '');
        setAdvanceDisplay(cities[0].advance ? cities[0].advance.toLocaleString('ru-RU') : '');
        setPricePeriod(cities[0].price_period);
        setDescription(cities[0].description || '');
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, user, isLoading, router, setSelectedCities]);

  const parseNumber = (val: string) => Number(val.replace(/\D/g, '')) || 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const price = parseNumber(priceDisplay);
      const advance = parseNumber(advanceDisplay);

      const cities = selectedCities.map(c => ({
        id: c.id, price_per_day: price, price_period: pricePeriod,
        advance: advance || undefined, description: description || '',
      }));

      const fd = new FormData();
      fd.append('brand', car.brand);
      fd.append('model', car.model);
      fd.append('year', String(car.year));
      fd.append('description', car.description || '');
      fd.append('cities', JSON.stringify(cities));
      fd.append('existing_photos', JSON.stringify(car.photos || []));
      await api.post(`/cars/${id}?_method=PUT`, fd);
      router.push(`/cars/${id}?city=${encodeURIComponent(currentCity)}`);
    } catch { alert('Ошибка сохранения'); }
    finally { setSaving(false); }
  };

  if (isLoading || loading || citiesLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!car) return <div className="text-center py-12">Автомобиль не найден</div>;

  const filteredCities = allCities.filter(c =>
    !isSelected(c.id) && c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/cars/${id}?city=${encodeURIComponent(currentCity)}`} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5" /></Link>
        <div><h1 className="text-xl font-bold">Города и цены</h1><p className="text-sm text-gray-500">{car.brand} {car.model} {car.year}</p></div>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
        <h3 className="font-medium text-sm mb-3">Цена и условия (для всех выбранных городов)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Цена</label>
            <div className="flex gap-1">
              <input type="text" inputMode="numeric" value={priceDisplay} onChange={e => setPriceDisplay(e.target.value.replace(/\D/g, '') ? Number(e.target.value.replace(/\D/g, '')).toLocaleString('ru-RU') : '')} className="flex-1 border rounded px-2 py-2 text-sm" placeholder="0" />
              <select value={pricePeriod} onChange={e => setPricePeriod(e.target.value)} className="border rounded px-2 py-2 text-sm"><option value="day">день</option><option value="week">нед</option><option value="month">мес</option></select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Аванс</label>
            <input type="text" inputMode="numeric" value={advanceDisplay} onChange={e => setAdvanceDisplay(e.target.value.replace(/\D/g, '') ? Number(e.target.value.replace(/\D/g, '')).toLocaleString('ru-RU') : '')} className="w-full border rounded px-2 py-2 text-sm" placeholder="0" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Описание</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded px-2 py-2 text-sm" placeholder="Особые условия..." />
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Города ({selectedCities.length})</label>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-blue-600 text-xs hover:underline">Все ({allCities.length})</button>
            <button onClick={deselectAll} className="text-red-500 text-xs hover:underline">Снять</button>
          </div>
        </div>
        <button type="button" onClick={() => setShowDropdown(!showDropdown)} className="w-full flex items-center justify-between border rounded-lg px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition">
          <span className={selectedCities.length === 0 ? 'text-gray-400' : ''}>{selectedCities.length === 0 ? 'Выберите города...' : `Выбрано: ${selectedCities.length}`}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={citySearch} onChange={e => setCitySearch(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Поиск городов..." autoFocus />
              </div>
            </div>
            <div className="overflow-y-auto p-1" style={{ maxHeight: '60vh' }}>
              {filteredCities.map(city => (
                <label key={city.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                  <input type="checkbox" checked={isSelected(city.id)} onChange={() => toggleCity(city)} className="rounded accent-blue-600" />
                  {city.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link href={`/cars/${id}?city=${encodeURIComponent(currentCity)}`} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 text-center font-medium text-sm">Отмена</Link>
        <button onClick={handleSave} disabled={saving || selectedCities.length === 0} className="flex-[2] bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">{saving ? 'Сохранение...' : 'Сохранить'}</button>
      </div>
    </div>
  );
}