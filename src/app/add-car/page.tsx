'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import PhotoUpload from '@/components/PhotoUpload';
import Toast from '@/components/Toast';
import SelectWithCustom from '@/components/SelectWithCustom';
import { CAR_TYPES } from '@/config/car-types';
import { CAR_BRANDS } from '@/config/car-brands';
import { COMPANIES } from '@/config/companies';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  carNumber: string;
  carBrand: string;
  carType: string;
  tokefTest: string;
  mileage: string;
  assignedTo: string;
  company: string;
  rishaonPhoto: File | null;
  giyusPhoto: File | null;
  carPhotos: File[];
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

const emptyForm: FormData = {
  carNumber: '',
  carBrand: '',
  carType: '',
  tokefTest: '',
  mileage: '',
  assignedTo: '',
  company: '',
  rishaonPhoto: null,
  giyusPhoto: null,
  carPhotos: [],
};

export default function AddCarPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ message, type });
  };

  const set = (field: Partial<FormData>) => setForm((f) => ({ ...f, ...field }));

  const handleCheckCarNumber = async () => {
    const num = form.carNumber.trim();
    if (!num) { showToast('יש להזין מספר רכב', 'error'); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${encodeURIComponent(num)}`);
      const data = await res.json();
      if (data.exists) { showToast('רכב עם מספר זה כבר קיים במערכת', 'error'); return; }
      setStep(2);
    } catch {
      showToast('שגיאת חיבור. נסה שוב.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsNext = () => {
    if (!form.carBrand) { showToast('יש לבחור יצרן', 'error'); return; }
    if (!form.carType) { showToast('יש לבחור סוג רכב', 'error'); return; }
    if (!form.tokefTest) { showToast('יש להזין תאריך תוקף טסט', 'error'); return; }
    if (!form.mileage) { showToast("יש להזין קילומטראז'", 'error'); return; }
    if (!form.assignedTo.trim()) { showToast('יש להזין שם', 'error'); return; }
    if (!form.company) { showToast('יש לבחור חברה', 'error'); return; }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!form.rishaonPhoto) { showToast('נא לצלם את רישיון הרכב', 'error'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('carNumber', form.carNumber.trim().toUpperCase());
      formData.append('carBrand', form.carBrand);
      formData.append('carType', form.carType);
      formData.append('tokefTest', form.tokefTest);
      formData.append('mileage', form.mileage);
      formData.append('assignedTo', form.assignedTo.trim());
      formData.append('company', form.company);
      formData.append('rishaonPhoto', form.rishaonPhoto);
      if (form.giyusPhoto) formData.append('giyusPhoto', form.giyusPhoto);
      form.carPhotos.forEach((photo, i) => formData.append(`carPhoto_${i}`, photo));

      const res = await fetch('/api/cars', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) { showToast(data.error || 'שגיאה בשמירה', 'error'); return; }
      setStep(4);
    } catch {
      showToast('שגיאת חיבור. נסה שוב.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels: Record<number, string> = { 1: '1/3', 2: '2/3', 3: '3/3', 4: '' };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {step === 4 && (
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-lg mx-auto w-full text-center">
          <div className="text-7xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">הרכב נוסף בהצלחה!</h2>
          <div className="w-full space-y-3 mt-8">
            <button
              onClick={() => { setStep(1); setForm(emptyForm); }}
              className="block w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base"
            >
              הוסף רכב נוסף
            </button>
            <Link href="/" className="block w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold text-base text-center">
              ← חזרה לדף הבית
            </Link>
          </div>
        </main>
      )}

      {step !== 4 && (
        <>
          <div className="bg-white border-b px-4 py-3 flex items-center gap-3 max-w-lg mx-auto w-full">
            <Link href="/" className="text-blue-600 font-medium text-sm">← חזרה</Link>
            <div className="flex-1 text-center text-sm font-semibold text-gray-500">
              הוספת רכב · {stepLabels[step]}
            </div>
            <div className="w-12" />
          </div>

          <div className="bg-gray-100 h-1 max-w-lg mx-auto w-full">
            <div className="bg-green-600 h-1 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>

          <main className="flex-1 px-6 py-6 max-w-lg mx-auto w-full">

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">מספר רכב</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">מספר לוחית רישוי</label>
                  <input
                    type="text"
                    value={form.carNumber}
                    onChange={(e) => set({ carNumber: e.target.value })}
                    placeholder="לדוגמה: 12-345-67"
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-lg font-bold text-center tracking-widest focus:outline-none focus:border-green-600"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckCarNumber()}
                  />
                </div>
                <button onClick={handleCheckCarNumber} disabled={loading}
                  className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-50 active:bg-green-700">
                  {loading ? 'בודק...' : 'המשך →'}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">פרטי הרכב</h2>
                  <p className="text-gray-400 text-sm">{form.carNumber}</p>
                </div>

                <SelectWithCustom label="יצרן" options={CAR_BRANDS} value={form.carBrand}
                  onChange={(v) => set({ carBrand: v })} placeholder="בחר יצרן" customPlaceholder="הכנס יצרן" required />

                <SelectWithCustom label="סוג רכב" options={CAR_TYPES} value={form.carType}
                  onChange={(v) => set({ carType: v })} placeholder="בחר סוג" customPlaceholder="הכנס סוג" required />

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">תוקף טסט *</label>
                  <input type="date" value={form.tokefTest} onChange={(e) => set({ tokefTest: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:border-green-600" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">קילומטראז&#39; *</label>
                  <input type="number" value={form.mileage} onChange={(e) => set({ mileage: e.target.value })}
                    placeholder="לדוגמה: 85000"
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:border-green-600" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">שייך ל *</label>
                  <input type="text" value={form.assignedTo} onChange={(e) => set({ assignedTo: e.target.value })}
                    placeholder="שם / מחלקה"
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:border-green-600" />
                </div>

                <SelectWithCustom label="חברה" options={COMPANIES} value={form.company}
                  onChange={(v) => set({ company: v })} placeholder="בחר חברה" customPlaceholder="הכנס שם חברה" required />

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold">← חזרה</button>
                  <button onClick={handleDetailsNext} className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-bold active:bg-green-700">המשך →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">תמונות</h2>
                  <p className="text-gray-400 text-sm">{form.carNumber}</p>
                </div>

                <PhotoUpload label="רישיון רכב *" sublabel="צלם את רישיון הרכב" multiple={false}
                  onChange={(files) => set({ rishaonPhoto: files[0] })} />

                <PhotoUpload label="טופס גיוס" sublabel="אם יש — צלם את הטופס" multiple={false}
                  onChange={(files) => set({ giyusPhoto: files[0] || null })} />

                <PhotoUpload label="תמונות הרכב" sublabel="5–10 תמונות מכל הצדדים" multiple={true}
                  onChange={(files) => set({ carPhotos: [...form.carPhotos, ...files] })} />

                <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-xs text-green-700">
                  📁 התמונות יישמרו בתיקייה: <strong>cars / {form.carNumber}</strong>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold">← חזרה</button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 active:bg-green-600">
                    {loading ? <span dir="ltr">שומר...</span> : '✓ שמור'}
                  </button>
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
