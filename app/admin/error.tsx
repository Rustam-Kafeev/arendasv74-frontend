'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Что-то пошло не так</h2>
      <p className="text-gray-500 mb-6">Произошла ошибка при загрузке страницы</p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium">
          Попробовать снова
        </button>
        <Link href="/admin" className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition font-medium">
          В админку
        </Link>
      </div>
    </div>
  );
}