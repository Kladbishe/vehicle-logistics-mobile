'use client';

import { useState, useEffect } from 'react';

interface SelectWithCustomProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  customPlaceholder?: string;
  required?: boolean;
}

const CUSTOM_KEY = '__custom__';

export default function SelectWithCustom({
  label,
  options,
  value,
  onChange,
  placeholder = 'בחר / Выберите',
  customPlaceholder = 'הכנס ערך חדש / Введите новое значение',
  required,
}: SelectWithCustomProps) {
  // If current value is not in options list — it's a custom value
  const isCustom = value !== '' && !options.includes(value);
  const [selectValue, setSelectValue] = useState(isCustom ? CUSTOM_KEY : value);
  const [customValue, setCustomValue] = useState(isCustom ? value : '');

  useEffect(() => {
    const isCust = value !== '' && !options.includes(value);
    setSelectValue(isCust ? CUSTOM_KEY : value);
    if (!isCust) setCustomValue('');
  }, [value, options]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectValue(val);
    if (val === CUSTOM_KEY) {
      setCustomValue('');
      onChange('');
    } else {
      onChange(val);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}{required && ' *'}
      </label>

      <select
        value={selectValue}
        onChange={handleSelectChange}
        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:border-blue-500 bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value={CUSTOM_KEY}>➕ הוסף חדש / Добавить новое</option>
      </select>

      {selectValue === CUSTOM_KEY && (
        <input
          type="text"
          value={customValue}
          onChange={handleCustomChange}
          placeholder={customPlaceholder}
          className="w-full border-2 border-blue-300 rounded-2xl px-4 py-4 focus:outline-none focus:border-blue-500 bg-blue-50"
          autoFocus
        />
      )}
    </div>
  );
}
