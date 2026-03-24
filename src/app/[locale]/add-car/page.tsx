'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Header from '@/components/Header';
import PhotoUpload from '@/components/PhotoUpload';
import Toast from '@/components/Toast';
import SelectWithCustom from '@/components/SelectWithCustom';
import { CAR_TYPES } from '@/config/app-config';
import { CAR_BRANDS } from '@/config/app-config';
import { COMPANIES } from '@/config/app-config';
import { DRIVERS } from '@/config/app-config';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  carNumber: string;
  carBrand: string;
  carType: string;
  tokefTest: string;
  mileage: string;
  assignedTo: string;
  company: string;
  filledBy: string;
  rishaonPhoto: File | null;
  giyusPhoto: File | null;
  carPhotos: File[];
  hasEquipment: boolean | null;
  missingEquipment: string;
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
  filledBy: '',
  rishaonPhoto: null,
  giyusPhoto: null,
  carPhotos: [],
  hasEquipment: null,
  missingEquipment: '',
};

export default function AddCarPage() {
  const t = useTranslations();
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
    if (!num) { showToast(t('common.carNumberRequired'), 'error'); return; }
    if (num.replace(/\D/g, '').length <= 4) { showToast(t('common.carNumberTooShort'), 'error'); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/cars/${encodeURIComponent(num)}`);
      const data = await res.json();
      if (data.exists) { showToast(t('addCar.carExists'), 'error'); return; }
      setStep(2);
    } catch {
      showToast(t('common.connectionError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsNext = () => {
    if (!form.carBrand) { showToast(t('addCar.brandRequired'), 'error'); return; }
    if (!form.carType) { showToast(t('addCar.typeRequired'), 'error'); return; }
    if (!form.tokefTest) { showToast(t('addCar.tokefRequired'), 'error'); return; }
    if (new Date(form.tokefTest).getFullYear() < 2026) { showToast(t('addCar.tokefMinYear'), 'error'); return; }
    if (!form.mileage) { showToast(t('addCar.mileageRequired'), 'error'); return; }
    if (!form.assignedTo) { showToast(t('addCar.assignedToRequired'), 'error'); return; }
    if (!form.company) { showToast(t('addCar.companyRequired'), 'error'); return; }
    if (!form.filledBy) { showToast(t('addCar.filledByRequired'), 'error'); return; }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!form.rishaonPhoto) { showToast(t('addCar.rishaonRequired'), 'error'); return; }
    if (form.hasEquipment === null) { showToast(t('addCar.equipmentRequired'), 'error'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('carNumber', form.carNumber.trim().toUpperCase());
      formData.append('carBrand', form.carBrand);
      formData.append('carType', form.carType);
      formData.append('tokefTest', form.tokefTest);
      formData.append('mileage', form.mileage);
      formData.append('assignedTo', form.assignedTo);
      formData.append('company', form.company);
      formData.append('filledBy', form.filledBy);
      formData.append('hasEquipment', form.hasEquipment === null ? '' : form.hasEquipment ? 'yes' : 'no');
      formData.append('missingEquipment', form.missingEquipment);
      formData.append('rishaonPhoto', form.rishaonPhoto);
      if (form.giyusPhoto) formData.append('giyusPhoto', form.giyusPhoto);
      form.carPhotos.forEach((photo, i) => formData.append(`carPhoto_${i}`, photo));

      const res = await fetch('/api/cars', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) { showToast(data.error || t('addCar.saveFailed'), 'error'); return; }
      setStep(4);
    } catch {
      showToast(t('common.connectionError'), 'error');
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('addCar.successTitle')}</h2>
          <div className="w-full space-y-3 mt-8">
            <button
              onClick={() => { setStep(1); setForm(emptyForm); }}
              className="block w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base"
            >
              {t('addCar.addAnother')}
            </button>
            <Link href="/" className="block w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold text-base text-center">
              {t('common.backToHome')}
            </Link>
          </div>
        </main>
      )}

      {step !== 4 && (
        <>
          <div className="bg-white border-b px-4 py-3 flex items-center gap-3 max-w-lg mx-auto w-full">
            <Link href="/" className="text-green-600 font-medium text-sm">{t('common.back')}</Link>
            <div className="flex-1 text-center text-sm font-semibold text-gray-500">
              {t('addCar.pageTitle')} · {stepLabels[step]}
            </div>
            <div className="w-12" />
          </div>

          <div className="bg-gray-100 h-1 max-w-lg mx-auto w-full">
            <div className="bg-green-600 h-1 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>

          <main className="flex-1 px-6 py-6 max-w-lg mx-auto w-full">

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">{t('addCar.step1Title')}</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">{t('addCar.plateLabel')}</label>
                  <input
                    type="text"
                    value={form.carNumber}
                    onChange={(e) => set({ carNumber: e.target.value })}
                    placeholder={t('common.carNumberPlaceholder')}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-lg font-bold text-center tracking-widest focus:outline-none focus:border-green-600"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckCarNumber()}
                  />
                </div>
                <button onClick={handleCheckCarNumber} disabled={loading}
                  className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base disabled:opacity-50 active:bg-green-700">
                  {loading ? t('common.checking') : t('common.next')}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{t('addCar.step2Title')}</h2>
                  <p className="text-gray-400 text-sm">{form.carNumber}</p>
                </div>

                <SelectWithCustom label={t('addCar.brandLabel')} options={CAR_BRANDS} value={form.carBrand}
                  onChange={(v) => set({ carBrand: v })} placeholder={t('addCar.brandPlaceholder')} customPlaceholder={t('addCar.brandCustom')} required />

                <SelectWithCustom label={t('addCar.typeLabel')} options={CAR_TYPES} value={form.carType}
                  onChange={(v) => set({ carType: v })} placeholder={t('addCar.typePlaceholder')} customPlaceholder={t('addCar.typeCustom')} required />

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">{t('addCar.tokefLabel')}</label>
                  <input type="date" value={form.tokefTest} onChange={(e) => set({ tokefTest: e.target.value })}
                    min="2026-01-01"
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:border-green-600" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">{t('addCar.mileageLabel')}</label>
                  <input type="number" value={form.mileage} onChange={(e) => set({ mileage: e.target.value })}
                    placeholder={t('addCar.mileagePlaceholder')}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:border-green-600" />
                </div>

                <SelectWithCustom label={t('addCar.assignedToLabel')} options={DRIVERS} value={form.assignedTo}
                  onChange={(v) => set({ assignedTo: v })} placeholder={t('addCar.assignedToPlaceholder')} customPlaceholder={t('addCar.assignedToCustom')} required />

                <SelectWithCustom label={t('addCar.companyLabel')} options={COMPANIES} value={form.company}
                  onChange={(v) => set({ company: v })} placeholder={t('addCar.companyPlaceholder')} customPlaceholder={t('addCar.companyCustom')} required />

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">{t('addCar.filledByLabel')}</label>
                  <input type="text" value={form.filledBy} onChange={(e) => set({ filledBy: e.target.value })}
                    placeholder={t('addCar.filledByPlaceholder')}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:border-green-600" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold">{t('common.back')}</button>
                  <button onClick={handleDetailsNext} className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-bold active:bg-green-700">{t('common.next')}</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{t('addCar.step3Title')}</h2>
                  <p className="text-gray-400 text-sm">{form.carNumber}</p>
                </div>

                <PhotoUpload label={t('addCar.rishaonLabel')} sublabel={t('addCar.rishaonSublabel')} multiple={false}
                  onChange={(files) => set({ rishaonPhoto: files[0] })} />

                <PhotoUpload label={t('addCar.giyusLabel')} sublabel={t('addCar.giyusSublabel')} multiple={false}
                  onChange={(files) => set({ giyusPhoto: files[0] || null })} />

                <PhotoUpload label={t('addCar.carPhotosLabel')} sublabel={t('addCar.carPhotosSublabel')} multiple={true}
                  onChange={(files) => set({ carPhotos: files })} />

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">{t('addCar.hasEquipmentLabel')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => set({ hasEquipment: true, missingEquipment: '' })}
                      className={`py-4 rounded-2xl font-bold text-base border-2 transition-colors ${
                        form.hasEquipment === true
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-200 active:bg-gray-50'
                      }`}
                    >
                      {t('addCar.yes')}
                    </button>
                    <button
                      type="button"
                      onClick={() => set({ hasEquipment: false })}
                      className={`py-4 rounded-2xl font-bold text-base border-2 transition-colors ${
                        form.hasEquipment === false
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-700 border-gray-200 active:bg-gray-50'
                      }`}
                    >
                      {t('addCar.no')}
                    </button>
                  </div>

                  {form.hasEquipment === false && (
                    <input
                      type="text"
                      value={form.missingEquipment}
                      onChange={(e) => set({ missingEquipment: e.target.value })}
                      placeholder={t('addCar.missingEquipmentPlaceholder')}
                      className="w-full border-2 border-red-300 rounded-2xl px-4 py-4 focus:outline-none focus:border-red-500 bg-red-50"
                      autoFocus
                    />
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-xs text-green-700">
                  📁 {t('addCar.folderNote', { carNumber: form.carNumber })}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold">{t('common.back')}</button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 active:bg-green-700">
                    {loading ? <span dir="ltr">{t('common.saving')}</span> : t('common.save')}
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
