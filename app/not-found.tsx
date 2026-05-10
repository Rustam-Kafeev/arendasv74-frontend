import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4">Страница не найдена</h2>
      <p className="text-gray-500 mb-6">Возможно, страница была удалена или её никогда не существовало</p>
      <Link href="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition font-medium">
        На главную
      </Link>
    </div>
  );
}