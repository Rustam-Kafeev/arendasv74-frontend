import { Zap, AlertCircle } from 'lucide-react';

export default function Tips({ stats }: { stats: any }) {
  const tips: string[] = [];
  if (stats?.active_cars === 0 && stats?.cars_count > 0) {
    tips.push('У вас есть неактивные объявления — активируйте их, чтобы получать просмотры.');
  }
  if (stats?.cars_count === 0) {
    tips.push('Добавьте своё первое объявление, чтобы начать получать заявки.');
  }
  if (stats?.today_views === 0 && stats?.cars_count > 0) {
    tips.push('Ваши объявления не просматривали сегодня. Попробуйте обновить фото или снизить цену.');
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Советы по улучшению
        </h2>
      </div>
      {tips.length > 0 ? (
        <ul className="space-y-3">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{tip}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">🎉 Отличная работа! Все объявления активны и получают просмотры.</p>
      )}
    </div>
  );
}