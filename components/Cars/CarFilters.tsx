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
    <div className="flex gap-4 mb-6">
      <input
        type="text"
        name="city"
        placeholder="Город"
        value={filters.city}
        onChange={handleChange}
        className="border rounded px-3 py-2"
      />
      <input
        type="text"
        name="brand"
        placeholder="Марка"
        value={filters.brand}
        onChange={handleChange}
        className="border rounded px-3 py-2"
      />
      <button
        onClick={() => onChange({ city: '', brand: '' })}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Сбросить
      </button>
    </div>
  );
}