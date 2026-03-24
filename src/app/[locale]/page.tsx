import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Header from '@/components/Header';

export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-lg mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800">{t('home.title')}</h2>
        </div>

        <div className="w-full space-y-4">
          <Link
            href="/add-car"
            className="block w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-center py-5 px-6 rounded-2xl text-lg font-bold shadow-md transition-colors"
          >
            <span className="block text-2xl mb-1">➕</span>
            {t('home.addCar')}
          </Link>

          <Link
            href="/transfer-car"
            className="block w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 text-center py-5 px-6 rounded-2xl text-lg font-bold shadow-md border-2 border-gray-200 transition-colors"
          >
            <span className="block text-2xl mb-1">🔄</span>
            {t('home.transferCar')}
          </Link>

          <Link
            href="/zikhuy-car"
            className="block w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 text-center py-5 px-6 rounded-2xl text-lg font-bold shadow-md border-2 border-gray-200 transition-colors"
          >
            <span className="block text-2xl mb-1">📋</span>
            {t('home.zikhuyCar')}
          </Link>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        {t('home.footer')}
      </footer>
    </div>
  );
}
