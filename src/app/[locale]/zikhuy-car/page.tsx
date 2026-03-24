'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Header from '@/components/Header';
import PhotoUpload from '@/components/PhotoUpload';
import Toast from '@/components/Toast';
import { normalizePlate } from '@/lib/utils';

type Step = 1 | 2 | 3;

interface CarInfo {
  carNumber: string;
  carBrand: string;
  carType: string;
  assignedTo: string;
  company: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ZikhuyCarPage() {
  const t = useTranslations();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [carNumber, setCarNumber] = useState('');
  const [carInfo, setCarInfo] = useState<CarInfo | null>(null);
  const [carExists, setCarExists] = useState(false);
  const [zikhuyPhoto, setZikhuyPhoto] = useState<File | null>(null);

  const showToast = (message: string, type: ToastState['type']) => setToast({ message, type });

  const handleSearch = async () => {
    const num = carNumber.trim();
    if (!num) { showToast(t('common.carNumberRequired'), 'error'); return; }
    if (num.replace(/\D/g, '').length <= 4) { showToast(t('common.carNumberTooShort'), 'error'); return; }

    setLoading(true);
    try {
      const normalized = normalizePlate(num);
      const res = await fetch(`/api/cars/${encodeURIComponent(normalized)}`);
      const data = await res.json();

      if (data.exists) {
        setCarInfo(data.car);
        setCarExists(true);
        setStep(2);
      } else {
        setCarExists(false);
        showToast(t('zikhuyCar.carNotInSystem'), 'info');
      }
    } catch {
      showToast(t('common.connectionError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithoutCar = () => {
    setCarInfo(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!zikhuyPhoto) { showToast(t('zikhuyCar.photoRequired'), 'error'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('carNumber', normalizePlate(carNumber.trim()));
      formData.append('zikhuyPhoto', zikhuyPhoto);

      const res = await fetch('/api/zikhuy', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) { showToast(data.error || t('zikhuyCar.saveFailed'), 'error'); return; }
      setStep(3);
    } catch {
      showToast(t('common.connectionError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setCarNumber('');
    setCarInfo(null);
    setCarExists(false);
    setZikhuyPhoto(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {step !== 3 && (
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3 max-w-lg mx-auto w-full">
          <Link href="/" className="text-green-600 font-medium text-sm">{t('common.back')}</Link>
          <div className="flex-1 text-center text-sm font-semibold text-gray-500">{t('zikhuyCar.pageTitle')}</div>
          <div className="w-12" />
        </div>
      )}

      <main className="flex-1 px-6 py-6 max-w-lg mx-auto w-full">

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">{t('zikhuyCar.step1Title')}</h2>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">{t('common.carNumber')}</label>
              <input
                type="text"
                value={carNumber}
                onChange={(e) => setCarNumber(e.target.value)}
                placeholder={t('common.carNumberPlaceholder')}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-lg font-bold text-center tracking-widest focus:outline-none focus:border-green-600"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-50 active:bg-green-700"
            >
              {loading ? t('common.searching') : t('common.search')}
            </button>

            {toast?.type === 'info' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                <p className="text-sm text-amber-800 font-medium">{toast.message}</p>
                <button
                  onClick={() => { setToast(null); handleContinueWithoutCar(); }}
                  className="w-full bg-amber-500 text-white py-3 rounded-2xl font-bold text-sm active:bg-amber-600"
                >
                  {t('zikhuyCar.continueAnyway')}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{t('zikhuyCar.step2Title')}</h2>
              <p className="text-gray-400 text-sm">{normalizePlate(carNumber)}</p>
            </div>

            {carExists && carInfo && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
                {carInfo.carBrand && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('transferCar.brand')}</span>
                    <span className="text-gray-700">{carInfo.carBrand}</span>
                  </div>
                )}
                {carInfo.carType && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('transferCar.type')}</span>
                    <span className="text-gray-700">{carInfo.carType}</span>
                  </div>
                )}
                {carInfo.company && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('transferCar.company')}</span>
                    <span className="text-gray-700">{carInfo.company}</span>
                  </div>
                )}
                {carInfo.assignedTo && (
                  <div className="flex justify-between border-t border-green-200 pt-2 mt-1">
                    <span className="text-sm text-gray-500">{t('zikhuyCar.assignedTo')}</span>
                    <span className="font-semibold text-gray-800">{carInfo.assignedTo}</span>
                  </div>
                )}
              </div>
            )}

            {!carExists && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-800">
                {t('zikhuyCar.notFoundWarning')}
              </div>
            )}

            <PhotoUpload
              label={t('zikhuyCar.photoLabel')}
              sublabel={t('zikhuyCar.photoSublabel')}
              multiple={false}
              onChange={(files) => setZikhuyPhoto(files[0] || null)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold"
              >
                {t('common.back')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 active:bg-green-700"
              >
                {loading ? <span dir="ltr">{t('common.saving')}</span> : t('common.save')}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 space-y-6">
            <div className="text-7xl">✅</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{t('zikhuyCar.successTitle')}</h2>
              {carExists ? (
                <p className="text-gray-500 mt-2 text-sm">
                  {t('zikhuyCar.markedCleared', { carNumber: normalizePlate(carNumber) })}
                </p>
              ) : (
                <p className="text-gray-500 mt-2 text-sm">
                  {t('zikhuyCar.savedToFolder')}
                </p>
              )}
            </div>
            <div className="w-full space-y-3">
              <button
                onClick={handleReset}
                className="block w-full bg-green-600 text-white py-4 rounded-2xl font-bold"
              >
                {t('zikhuyCar.clearAnother')}
              </button>
              <Link
                href="/"
                className="block w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold text-center"
              >
                {t('common.backToHome')}
              </Link>
            </div>
          </div>
        )}
      </main>

      {toast && toast.type !== 'info' && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
