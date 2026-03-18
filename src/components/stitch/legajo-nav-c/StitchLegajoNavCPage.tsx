import type { StitchLegajoNavCViewData } from '@/lib/stitch/legajoNavCAdapter';
import AppHeader from '@/components/navigation/AppHeader';
import LegajoNavCHero from '@/components/stitch/legajo-nav-c/LegajoNavCHero';
import LegajoNavCOverview from '@/components/stitch/legajo-nav-c/LegajoNavCOverview';
import LegajoNavCWorkspace from '@/components/stitch/legajo-nav-c/LegajoNavCWorkspace';
import LegajoNavCNarrativeModule from '@/components/stitch/legajo-nav-c/LegajoNavCNarrativeModule';

export interface StitchLegajoNavCPageProps {
  readonly data: Readonly<StitchLegajoNavCViewData>;
}

export default function StitchLegajoNavCPage({ data }: Readonly<StitchLegajoNavCPageProps>) {
  return (
    <div className="app-page font-sans text-[#1A1A1A]">
      <AppHeader
        brand={data.projectName}
        navItems={data.headerLinks}
        badge="Archivo digital"
        contextMode="none"
      />
      <LegajoNavCHero data={data} />

      <nav
        className="sticky z-40 border-b border-[#d8d0c1] bg-[rgba(249,247,242,0.94)] backdrop-blur-sm shadow-[0_8px_24px_rgba(44,44,42,0.06)]"
        style={{ top: 'var(--app-header-height, 72px)' }}
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap justify-center gap-4 px-4 sm:gap-8 sm:px-6 lg:gap-12 lg:px-8">
          {data.tabs.map((tab) => (
            <a
              key={tab.id}
              href={tab.href}
              className={`border-b-[3px] py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                tab.active ? 'border-[#B48E4B] text-[#1A1A1A]' : 'border-transparent text-[#8f8577] hover:text-[#6f6453]'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </nav>

      {data.mode === 'overview' ? <LegajoNavCOverview data={data} /> : <LegajoNavCWorkspace data={data} />}
      <LegajoNavCNarrativeModule data={data} />
    </div>
  );
}
