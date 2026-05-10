//(выбор городов + цена/аванс)
import { useRef, useState } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { X, ChevronDown, Search } from 'lucide-react';

interface City {
  id: number; name: string;
}

interface Props {
  allCities: City[];
  selectedCities: City[];
  toggleCity: (city: City) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isSelected: (id: number) => boolean;
  register: UseFormRegister<any>;
  priceDisplay: string;
  setPriceDisplay: (v: string) => void;
  advanceDisplay: string;
  setAdvanceDisplay: (v: string) => void;
}

export default function CarCitySelector({
  allCities, selectedCities, toggleCity, selectAll, deselectAll, isSelected,
  register, priceDisplay, setPriceDisplay, advanceDisplay, setAdvanceDisplay,
}: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSelectedList, setShowSelectedList] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = allCities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const count = selectedCities.length;

  return (
    <>
      {/* Цена */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="font-medium text-sm mb-3">Цена и условия (для всех городов)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Цена</label>
            <div className="flex gap-1">
              <input type="text" inputMode="numeric" value={priceDisplay} onChange={e => { const raw = e.target.value.replace(/\D/g, ''); setPriceDisplay(raw ? Number(raw).toLocaleString('ru-RU') : ''); }} className="flex-1 border rounded px-2 py-2 text-sm" placeholder="0" />
              <select {...register('price_period')} className="border rounded px-2 py-2 text-sm"><option value="day">день</option><option value="week">нед</option><option value="month">мес</option></select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Аванс</label>
            <input type="text" inputMode="numeric" value={advanceDisplay} onChange={e => { const raw = e.target.value.replace(/\D/g, ''); setAdvanceDisplay(raw ? Number(raw).toLocaleString('ru-RU') : ''); }} className="w-full border rounded px-2 py-2 text-sm" placeholder="0" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Описание</label>
            <input type="text" {...register('city_description')} className="w-full border rounded px-2 py-2 text-sm" placeholder="Особые условия..." />
          </div>
        </div>
      </div>

      {/* Выбор городов */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium">Города ({count})</label>
          <div className="flex gap-2">
            <button type="button" onClick={selectAll} className="text-blue-600 text-xs hover:underline">Все ({allCities.length})</button>
            {count > 0 && <button type="button" onClick={deselectAll} className="text-red-500 text-xs hover:underline">Снять</button>}
          </div>
        </div>
        <button type="button" onClick={() => setShowDropdown(!showDropdown)} className="w-full flex items-center justify-between border rounded-lg px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition">
          <span className={count === 0 ? 'text-gray-400' : ''}>{count === 0 ? 'Выберите города...' : `Выбрано: ${count}`}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl overflow-hidden">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg outline-none" placeholder="Поиск городов..." autoFocus />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">Ничего не найдено</p> : filtered.map(city => (
                <label key={city.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                  <input type="checkbox" checked={isSelected(city.id)} onChange={() => toggleCity(city)} className="rounded accent-blue-600" />
                  {city.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {count > 0 && (
          <div className="mt-2">
            <button type="button" onClick={() => setShowSelectedList(!showSelectedList)} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
              {showSelectedList ? 'Скрыть' : 'Показать'} выбранные ({count})
              <ChevronDown className={`w-3 h-3 transition ${showSelectedList ? 'rotate-180' : ''}`} />
            </button>
            {showSelectedList && (
              <div className="mt-1 flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {selectedCities.map(city => (
                  <span key={city.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {city.name}
                    <button type="button" onClick={() => toggleCity(city)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}