import Link from 'next/link';
import type { StitchLegajoNavCViewData } from '@/lib/stitch/legajoNavCAdapter';

export interface LegajoNavCHeaderProps {
  readonly data: Readonly<StitchLegajoNavCViewData>;
}

export default function LegajoNavCHeader({ data }: Readonly<LegajoNavCHeaderProps>) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-[#1A1A1A] px-4 py-3 text-white sm:px-6 lg:px-8">
      <div className="flex items-center gap-6">
        <div className="font-serif text-xl font-bold tracking-tight">{data.projectName}</div>
        <nav className="hidden items-center gap-6 text-[11px] font-medium uppercase tracking-[0.22em] text-gray-400 md:flex">
          {data.headerLinks.map((link) => (
            <Link key={link.label} href={link.href} className={link.active ? 'text-white' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden min-w-[220px] items-center rounded-sm bg-zinc-800 px-3 py-2 text-sm text-gray-400 md:flex">Buscar en el archivo...</div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs">JS</div>
      </div>
    </header>
  );
}
