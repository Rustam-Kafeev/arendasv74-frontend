'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { X, Upload } from 'lucide-react';

interface Props {
  existingPhotos: string[];
  setExistingPhotos: (photos: string[]) => void;
  onFilesChange: (files: File[]) => void;
  isEditing: boolean;
}

export default function CarPhotoUploader({ existingPhotos, setExistingPhotos, onFilesChange, isEditing }: Props) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allFilesRef = useRef<File[]>([]);

  const handleNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Добавляем к уже существующим
    allFilesRef.current = [...allFilesRef.current, ...fileArray];
    
    // Обновляем превью
    const urls = fileArray.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...urls]);
    
    // Передаём все файлы родителю
    onFilesChange(allFilesRef.current);
  };

  const removeExisting = (i: number) => {
    setExistingPhotos(existingPhotos.filter((_, idx) => idx !== i));
  };

  const removeNew = (i: number) => {
    // Находим глобальный индекс удаляемого файла
    const globalIndex = i;
    
    allFilesRef.current = allFilesRef.current.filter((_, idx) => idx !== globalIndex);
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[globalIndex]);
      return prev.filter((_, idx) => idx !== globalIndex);
    });
    
    onFilesChange(allFilesRef.current);
  };

  return (
    <>
      {isEditing && existingPhotos.length > 0 && (
        <div>
          <label className="block mb-2 text-sm font-medium">Текущие фото</label>
          <div className="flex flex-wrap gap-2">
            {existingPhotos.map((p, i) => {
              const url = p.startsWith('http') ? p : `http://127.0.0.1:8000${p}`;
              return (
                <div key={i} className="relative w-20 h-20 border rounded-lg overflow-hidden group">
                  <Image src={url} alt="" fill className="object-cover" unoptimized />
                  <button type="button" onClick={() => removeExisting(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {previewUrls.length > 0 && (
        <div>
          <label className="block mb-2 text-sm font-medium">Новые фото</label>
          <div className="flex flex-wrap gap-2">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative w-20 h-20 border rounded-lg overflow-hidden group">
                <Image src={url} alt="preview" fill className="object-cover" />
                <button type="button" onClick={() => removeNew(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block mb-2 text-sm font-medium">Добавить фото</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleNewFiles}
          ref={fileInputRef}
          className="hidden"
          id="car-photos"
        />
        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">Выбрать файлы</span>
        </div>
      </div>
    </>
  );
}