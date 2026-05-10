'use client';

interface CarFiltersProps {
  filters: { city: string; brand: string };
  onChange: (filters: { city: string; brand: string }) => void;
}

export default function CarFilters({ filters, onChange }: CarFiltersProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
      <input
        type="text"
        name="city"
        placeholder="Город"
        value={filters.city}
        onChange={handleChange}
        className="flex-1 min-w-[100px] sm:flex-none sm:w-auto border rounded-lg px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="text"
        name="brand"
        placeholder="Марка"
        value={filters.brand}
        onChange={handleChange}
        className="flex-1 min-w-[100px] sm:flex-none sm:w-auto border rounded-lg px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={() => onChange({ city: '', brand: '' })}
        className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm sm:text-base font-medium transition-colors"
      >
        Сбросить
      </button>
    </div>
  );
}