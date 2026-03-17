import type { StitchLegajoNavCViewData } from '@/lib/stitch/legajoNavCAdapter';
import LegajoNavCHero from '@/components/stitch/legajo-nav-c/LegajoNavCHero';
import LegajoNavCOverview from '@/components/stitch/legajo-nav-c/LegajoNavCOverview';
import LegajoNavCWorkspace from '@/components/stitch/legajo-nav-c/LegajoNavCWorkspace';
import LegajoNavCNarrativeModule from '@/components/stitch/legajo-nav-c/LegajoNavCNarrativeModule';
import UnifiedTopHeader from '@/components/stitch/shared/UnifiedTopHeader';

export interface StitchLegajoNavCPageProps {
  readonly data: Readonly<StitchLegajoNavCViewData>;
}

export default function StitchLegajoNavCPage({ data }: Readonly<StitchLegajoNavCPageProps>) {
  return (
    <div className="min-h-screen bg-[#F9F7F2] font-sans text-[#1A1A1A]">
      <UnifiedTopHeader
        brand={data.projectName}
        navItems={data.headerLinks}
        badge="Archivo digital"
        contextEyebrow="Vista de legajo"
        contextTitle={data.title}
        contextMeta={data.description}
      />
      <LegajoNavCHero data={data} />

      <nav className="sticky top-[107px] z-40 border-b border-[#E5E1D8] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-4 px-4 sm:gap-8 sm:px-6 lg:gap-12 lg:px-8">
          {data.tabs.map((tab) => (
            <a
              key={tab.id}
              href={tab.href}
              className={`border-b-4 py-5 text-[11px] font-bold uppercase tracking-[0.2em] ${
                tab.active ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-gray-400'
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
