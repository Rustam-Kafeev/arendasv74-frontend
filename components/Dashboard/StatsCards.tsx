import Link from 'next/link';
import { Car, Eye } from 'lucide-react';

export default function StatsCards({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <Link href="/dashboard/cars" className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition group">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Мои объявления</span>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold mt-3">{stats?.cars_count || 0}</p>
        <p className="text-xs text-gray-400 mt-1">{stats?.active_cars || 0} активно</p>
        <span className="inline-flex items-center gap-1 text-blue-600 text-xs mt-2 group-hover:underline">Управлять →</span>
      </Link>
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Просмотров сегодня</span>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold mt-3">{stats?.today_views || 0}</p>
        <p className="text-xs text-gray-400 mt-1">за текущий день</p>
      </div>
    </div>
  );
}