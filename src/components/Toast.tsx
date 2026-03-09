'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
  };

  return (
    <div
      className={`fixed bottom-6 left-4 right-4 max-w-lg mx-auto ${colors[type]} text-white px-4 py-3 rounded-2xl shadow-lg z-50 flex items-center gap-3`}
      onClick={onClose}
    >
      <span className="text-xl font-bold">{icons[type]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
    </div>
  );
}
