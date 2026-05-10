'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface PhotoUploaderProps {
  onUpload: (url: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export default function PhotoUploader({ onUpload, disabled, className = '' }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Ошибка загрузки');

      const data = await res.json();
      if (data.url) {
        await onUpload(data.url);
      } else {
        throw new Error('URL не получен');
      }
    } catch (err) {
      alert('Не удалось загрузить фото. Попробуйте позже.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className={`p-2 hover:bg-gray-100 rounded-full transition shrink-0 text-gray-500 disabled:opacity-50 ${className}`}
        title="Прикрепить фото"
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera className="w-5 h-5" />
        )}
      </button>
    </>
  );
}