import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function RecentMessages({ stats }: { stats: any }) {
  return (
    <Link href="/dashboard/messages" className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition cursor-pointer block group">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          Сообщения
          {stats?.unread_messages ? (
            <span className="inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2 font-medium">
              {stats.unread_messages} новых
            </span>
          ) : null}
        </h2>
        <span className="text-sm text-blue-600 group-hover:underline">Все →</span>
      </div>
      {stats?.recent_messages?.length ? (
        <ul className="space-y-3">
          {stats.recent_messages.map((msg: any) => (
            <li key={msg.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                {msg.user_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{msg.user_name}</p>
                <p className="text-xs text-gray-500 truncate">{msg.car_brand} {msg.car_model}</p>
                <p className="text-sm text-gray-700 mt-0.5 line-clamp-1">{msg.body}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">Нет новых сообщений</p>
      )}
    </Link>
  );
}