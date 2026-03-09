import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-green-600 text-white px-4 py-4 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <Image src="/logo.png" alt="לוגו" width={40} height={40} className="rounded-xl" />
        <div>
          <h1 className="text-lg font-bold leading-tight">ניהול רכבים</h1>
        </div>
      </div>
    </header>
  );
}
