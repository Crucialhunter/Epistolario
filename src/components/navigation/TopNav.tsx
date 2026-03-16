import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/legajos', label: 'Archivo' },
];

export default function TopNav() {
  return (
    <header className="border-b border-[#e7dcc6] bg-[#fcfbf8]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 md:px-10 lg:px-16">
        <Link href="/" className="min-w-0">
          <span className="block text-[11px] font-bold uppercase tracking-[0.28em] text-[#a38420]">Epistolario</span>
          <span className="reader-display block text-lg font-semibold text-[#221c13]">Archivo digital</span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-[#e7dcc6] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6a5d47] transition-colors hover:border-[#d8c89e] hover:text-[#a38420]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
