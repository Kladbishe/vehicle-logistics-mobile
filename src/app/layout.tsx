import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'ניהול רכבים',
  description: 'Internal vehicle management system',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
};

// The actual layout (html/body/lang/dir) lives in app/[locale]/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
