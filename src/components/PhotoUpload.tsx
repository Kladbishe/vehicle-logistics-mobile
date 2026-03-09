'use client';

import { useRef, useState } from 'react';

interface PhotoUploadProps {
  label: string;
  sublabel?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
}

export default function PhotoUpload({
  label,
  sublabel,
  multiple = false,
  onChange,
}: PhotoUploadProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    onChange(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => (multiple ? [...prev, ...urls] : urls));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}

      <div className="grid grid-cols-2 gap-2">
        {/* Camera button */}
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="border-2 border-dashed border-blue-300 rounded-2xl p-4 flex flex-col items-center gap-1 bg-blue-50 active:bg-blue-100 transition-colors"
        >
          <span className="text-2xl">📷</span>
          <span className="text-xs font-medium text-blue-600">צלם</span>
        </button>

        {/* Gallery button */}
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center gap-1 bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <span className="text-2xl">🖼️</span>
          <span className="text-xs font-medium text-gray-600">גלריה</span>
        </button>
      </div>

      {previews.length > 0 && (
        <p className="text-xs text-green-600 font-semibold">
          ✓ {previews.length} {previews.length === 1 ? 'תמונה' : 'תמונות'}
        </p>
      )}

      {/* Camera input */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      {/* Gallery input */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />

      {previews.length > 0 && (
        <div className={`grid gap-2 mt-2 ${multiple ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {previews.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img src={url} alt={`preview-${i}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
