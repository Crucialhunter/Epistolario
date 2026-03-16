import type { StitchLegajoNavCViewData } from '@/lib/stitch/legajoNavCAdapter';

export interface LegajoNavCNarrativeModuleProps {
  readonly data: Readonly<StitchLegajoNavCViewData>;
}

export default function LegajoNavCNarrativeModule({ data }: Readonly<LegajoNavCNarrativeModuleProps>) {
  return (
    <section className="bg-[#1A1A1A] py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl tracking-wide">{data.narrative.title}</h2>
        <div className="mt-8 grid overflow-hidden rounded-lg border border-white/10 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
          <div className="min-h-[320px] bg-zinc-900" />
          <div className="flex flex-col justify-between gap-6 bg-[#201f1d] p-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B48E4B]">Placeholder curatorial</p>
              <p className="mt-4 text-sm leading-relaxed text-white/75">{data.narrative.description}</p>
            </div>
            <button className="w-fit border border-[#B48E4B]/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F9F7F2]">
              {data.narrative.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
