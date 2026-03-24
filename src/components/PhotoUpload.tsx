'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface PhotoUploadProps {
  label: string;
  sublabel?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
}

interface PhotoItem {
  file: File;
  url: string;
}

export default function PhotoUpload({
  label,
  sublabel,
  multiple = false,
  onChange,
}: PhotoUploadProps) {
  const t = useTranslations('photoUpload');
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PhotoItem[]>([]);

  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve) => {
      if (!file.type.startsWith('image/')) { resolve(file); return; }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1600;
        let { width, height } = img;
        if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.82
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = '';
    const compressed = await Promise.all(files.map(compressImage));
    const newItems = compressed.map((file) => ({ file, url: URL.createObjectURL(file) }));
    const updated = multiple ? [...items, ...newItems] : newItems;
    setItems(updated);
    onChange(updated.map((i) => i.file));
  };

  const handleDelete = (index: number) => {
    URL.revokeObjectURL(items[index].url);
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange(updated.map((i) => i.file));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}

      {multiple ? (
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="w-full border-2 border-dashed border-green-300 rounded-2xl p-4 flex flex-col items-center gap-1 bg-green-50 active:bg-green-100 transition-colors"
        >
          <span className="text-2xl">📷</span>
          <span className="text-xs font-medium text-green-700">{t('addPhotos')}</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="border-2 border-dashed border-green-300 rounded-2xl p-4 flex flex-col items-center gap-1 bg-green-50 active:bg-green-100 transition-colors"
          >
            <span className="text-2xl">📷</span>
            <span className="text-xs font-medium text-green-700">{t('camera')}</span>
          </button>

          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center gap-1 bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <span className="text-2xl">🖼️</span>
            <span className="text-xs font-medium text-gray-600">{t('gallery')}</span>
          </button>
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-green-600 font-semibold">
          {t('photoCount', { count: items.length })}
        </p>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />

      {items.length > 0 && (
        <div className={`grid gap-2 mt-2 ${multiple ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {items.map((item, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img src={item.url} alt={`preview-${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-md active:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
