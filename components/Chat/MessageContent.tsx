'use client';

import { isImageUrl, getImageUrl } from '@/lib/utils';
import { Camera } from 'lucide-react';

interface MessageContentProps {
  body: string;
  onImageClick?: (url: string) => void;
}

export default function MessageContent({ body, onImageClick }: MessageContentProps) {
  if (isImageUrl(body)) {
    return (
      <div
        className="cursor-pointer rounded-lg overflow-hidden"
        onClick={(e) => { e.stopPropagation(); onImageClick?.(body); }}
      >
        <img
          src={getImageUrl(body)}
          alt="Фото"
          className="object-cover max-w-[200px] max-h-[200px] w-full h-auto rounded-lg"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="flex items-center gap-2 p-3 text-gray-500"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span class="text-sm">Фото не загрузилось</span></div>';
            }
          }}
        />
      </div>
    );
  }

  if (body?.startsWith('📷')) {
    return (
      <div className="flex items-center gap-2 text-gray-500 p-2">
        <Camera className="w-4 h-4" />
        <span className="text-sm">Фото</span>
      </div>
    );
  }

  return <span>{body}</span>;
}
