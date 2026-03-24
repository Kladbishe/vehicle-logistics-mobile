'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === 'he' ? 'en' : 'he';
    const pathWithoutLocale = pathname.replace(/^\/(he|en)/, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <header className="bg-green-600 text-white px-4 py-4 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <Image src="/logo.png" alt={t('logoAlt')} width={40} height={40} className="rounded-xl" />
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight">{t('title')}</h1>
        </div>
        <button
          onClick={switchLocale}
          className="text-xs font-bold bg-green-700 hover:bg-green-800 active:bg-green-900 px-3 py-1.5 rounded-lg transition-colors"
        >
          {locale === 'he' ? 'EN' : 'HE'}
        </button>
      </div>
    </header>
  );
}
