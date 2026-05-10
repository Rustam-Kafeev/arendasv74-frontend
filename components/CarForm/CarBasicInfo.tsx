//(марка, модель, год, описание)

import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface CarBasicInfoProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export default function CarBasicInfo({ register, errors }: CarBasicInfoProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1.5 text-sm font-medium">Марка</label>
          <input {...register('brand')} className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Hyundai" />
          {errors.brand?.message && <p className="text-red-500 text-xs mt-1">{String(errors.brand.message)}</p>}
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-medium">Модель</label>
          <input {...register('model')} className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Solaris" />
          {errors.model?.message && <p className="text-red-500 text-xs mt-1">{String(errors.model.message)}</p>}
        </div>
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium">Год выпуска</label>
        <input type="number" {...register('year')} className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="2024" />
        {errors.year?.message && <p className="text-red-500 text-xs mt-1">{String(errors.year.message)}</p>}
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium">Общее описание</label>
        <textarea {...register('description')} rows={4} className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Опишите автомобиль, условия..." />
        {errors.description?.message && <p className="text-red-500 text-xs mt-1">{String(errors.description.message)}</p>}
      </div>
    </>
  );
}