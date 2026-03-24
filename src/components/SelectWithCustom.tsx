'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

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
  placeholder,
  customPlaceholder,
  required,
}: SelectWithCustomProps) {
  const t = useTranslations('select');
  const resolvedPlaceholder = placeholder ?? t('choose');
  const resolvedCustomPlaceholder = customPlaceholder ?? t('enterValue');

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
        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:border-green-600 bg-white"
      >
        <option value="">{resolvedPlaceholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value={CUSTOM_KEY}>{t('addNew')}</option>
      </select>

      {selectValue === CUSTOM_KEY && (
        <input
          type="text"
          value={customValue}
          onChange={handleCustomChange}
          placeholder={resolvedCustomPlaceholder}
          className="w-full border-2 border-green-300 rounded-2xl px-4 py-4 focus:outline-none focus:border-green-600 bg-green-50"
          autoFocus
        />
      )}
    </div>
  );
}
