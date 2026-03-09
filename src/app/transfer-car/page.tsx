'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Toast from '@/components/Toast';

type Step = 1 | 2 | 3;

interface CarInfo {
  carNumber: string;
  carBrand: string;
  carType: string;
  assignedTo: string;
  company: string;
  tokefTest: string;
  mileage: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function TransferCarPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [searchNumber, setSearchNumber] = useState('');
  const [carInfo, setCarInfo] = useState<CarInfo | null>(null);
  const [newAssignedTo, setNewAssignedTo] = useState('');

  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ message, type });
  };

  const handleSearch = async () => {
    const num = searchNumber.trim();
    if (!num) {
      showToast('יש להזין מספר רכב', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${encodeURIComponent(num)}`);
      const data = await res.json();

      if (!data.exists) {
        showToast('רכב לא נמצא. בדוק את המספר.', 'error');
        return;
      }

      setCarInfo(data.car);
      setNewAssignedTo('');
      setStep(2);
    } catch {
      showToast('שגיאת חיבור. נסה שוב.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!newAssignedTo.trim()) {
      showToast('יש להזין שם חדש', 'error');
      return;
    }
    if (newAssignedTo.trim() === carInfo?.assignedTo) {
      showToast('זהה לבעלים הנוכחי. שנה את הערך.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${encodeURIComponent(carInfo!.carNumber)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: newAssignedTo.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'שגיאה', 'error');
        return;
      }

      setStep(3);
    } catch {
      showToast('שגיאת חיבור. נסה שוב.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 max-w-lg mx-auto w-full">
        <Link href="/" className="text-green-600 font-medium text-sm">← חזרה</Link>
        <div className="flex-1 text-center text-sm font-semibold text-gray-500">העברת רכב</div>
        <div className="w-12" />
      </div>

      <main className="flex-1 px-6 py-6 max-w-lg mx-auto w-full">

        {/* STEP 1: Search */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">חיפוש רכב</h2>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">מספר רכב</label>
              <input
                type="text"
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                placeholder="לדוגמה: 12-345-67"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-lg font-bold text-center tracking-widest focus:outline-none focus:border-green-600"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-50 active:bg-blue-700"
            >
              {loading ? 'מחפש...' : '🔍 חפש'}
            </button>
          </div>
        )}

        {/* STEP 2: Transfer form */}
        {step === 2 && carInfo && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800">העברת רכב</h2>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">מספר רכב</span>
                <span className="font-bold text-gray-800">{carInfo.carNumber}</span>
              </div>
              {carInfo.carBrand && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">יצרן</span>
                  <span className="text-gray-700">{carInfo.carBrand}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">סוג</span>
                <span className="text-gray-700">{carInfo.carType}</span>
              </div>
              {carInfo.company && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">חברה</span>
                  <span className="text-gray-700">{carInfo.company}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-green-200 pt-2 mt-1">
                <span className="text-sm text-gray-500">שייך כעת ל</span>
                <span className="font-semibold text-gray-800">{carInfo.assignedTo || '—'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">העבר ל *</label>
              <input
                type="text"
                value={newAssignedTo}
                onChange={(e) => setNewAssignedTo(e.target.value)}
                placeholder="שם החדש"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:border-green-600"
                autoFocus
              />
            </div>

            {newAssignedTo && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm">
                <p className="text-amber-800">
                  <span className="font-semibold">{carInfo.assignedTo || '—'}</span>
                  {' → '}
                  <span className="font-semibold text-green-600">{newAssignedTo}</span>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold"
              >
                ← חזרה
              </button>
              <button
                onClick={handleTransfer}
                disabled={loading}
                className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 active:bg-green-600"
              >
                {loading ? 'שומר...' : '✓ העבר'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="text-center space-y-6 py-10">
            <div className="text-7xl">✅</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">הרכב הועבר!</h2>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm">
              <p className="text-gray-600">
                <span className="font-bold">{carInfo?.carNumber}</span>
                {' → '}
                <span className="font-bold text-green-600">{newAssignedTo}</span>
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => { setStep(1); setSearchNumber(''); setCarInfo(null); setNewAssignedTo(''); }}
                className="block w-full bg-green-600 text-white py-4 rounded-2xl font-bold"
              >
                העבר רכב נוסף
              </button>
              <Link
                href="/"
                className="block w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold text-center"
              >
                ← חזרה לדף הבית
              </Link>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
