import Link from 'next/link';

export interface UnifiedTopHeaderNavItem {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
}

export interface UnifiedTopHeaderProps {
  readonly brand: string;
  readonly navItems: readonly UnifiedTopHeaderNavItem[];
  readonly badge: string;
  readonly contextEyebrow: string;
  readonly contextTitle: string;
  readonly contextMeta?: string;
  readonly contextMode?: 'stacked' | 'compact' | 'none';
}

export default function UnifiedTopHeader({
  brand,
  navItems,
  badge,
  contextEyebrow,
  contextTitle,
  contextMeta,
  contextMode = 'stacked',
}: Readonly<UnifiedTopHeaderProps>) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#2f2a24] bg-[linear-gradient(180deg,#1A1A18_0%,#221c18_100%)] text-[#F1E9D0] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col ${
            contextMode === 'none' ? 'gap-2 py-2.5' : contextMode === 'compact' ? 'gap-3 py-3' : 'gap-4 py-4'
          } lg:flex-row lg:items-center lg:justify-between`}
        >
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="font-serif text-lg font-semibold tracking-[0.03em] text-[#F5F2E8] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#1A1A18] sm:text-xl">
              {brand}
            </Link>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4CAB7] lg:hidden">
              {badge}
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] sm:gap-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`transition-colors outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#1A1A18] ${
                  item.active
                    ? 'text-[#C5A059]'
                    : 'text-[#D4CAB7] hover:text-[#F5F2E8]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4CAB7] lg:block">
            {badge}
          </div>
        </div>

        {contextMode === 'compact' ? (
          <div className="border-t border-white/5 py-3">
            <div className="flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">{contextEyebrow}</p>
                <p className="mt-1 font-serif text-base leading-tight text-[#F5F2E8] sm:text-lg">{contextTitle}</p>
              </div>
              {contextMeta ? <p className="max-w-3xl text-sm leading-relaxed text-[#D4CAB7] lg:text-right">{contextMeta}</p> : null}
            </div>
          </div>
        ) : null}
      </div>

      {contextMode === 'stacked' ? (
        <div className="border-t border-white/5 bg-[linear-gradient(180deg,#2A241E_0%,#241F1A_100%)]">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-3 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">{contextEyebrow}</p>
              <p className="mt-1 font-serif text-lg leading-tight text-[#F5F2E8] sm:text-xl">{contextTitle}</p>
            </div>
            {contextMeta ? <p className="max-w-2xl text-sm leading-relaxed text-[#D4CAB7]">{contextMeta}</p> : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
