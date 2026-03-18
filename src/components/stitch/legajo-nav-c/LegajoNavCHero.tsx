import Link from 'next/link';
import type { StitchLegajoNavCViewData } from '@/lib/stitch/legajoNavCAdapter';

export interface LegajoNavCHeroProps {
  readonly data: Readonly<StitchLegajoNavCViewData>;
}

export default function LegajoNavCHero({ data }: Readonly<LegajoNavCHeroProps>) {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-6 border-b border-[#d9d3c6] px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,480px)] lg:px-8 lg:py-7">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B48E4B]">{data.heroEyebrow}</p>
          <span className="rounded-full border border-[#d6c7a9] bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6e5d37]">
            Legajo {data.legajoId}
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#4E463B] sm:text-[1.02rem]">{data.description}</p>

        <div className="mt-5 rounded-[1.35rem] border border-[#d9d3c6] bg-[linear-gradient(180deg,rgba(255,252,246,0.9),rgba(245,238,224,0.88))] p-5 shadow-[0_14px_30px_rgba(32,28,24,0.05)]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.metrics.map((metric) => (
              <div key={metric.label}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B48E4B]">{metric.label}</p>
                <p className="mt-1 font-serif text-lg font-bold text-[#1A1A1A]">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="relative overflow-hidden rounded-[1.35rem] border border-[#d9d3c6] bg-[#E5E1D8] shadow-[0_18px_36px_rgba(32,28,24,0.08)]">
          {data.heroImageSrc ? (
            <img src={data.heroImageSrc} alt={data.heroImageAlt} className="h-full min-h-[240px] w-full object-cover mix-blend-multiply opacity-90" />
          ) : (
            <div className="flex min-h-[320px] items-end bg-[linear-gradient(145deg,#efe8d7,#d8cebc)] p-8 text-[#2D2D2D]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B48E4B]">Modo textual / documental</p>
                <p className="mt-3 max-w-sm font-serif text-2xl leading-tight">
                  El legajo puede recorrerse con CorpusBase completo aunque todavia no tenga manuscrito local destacado.
                </p>
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 border-[18px] border-white/20" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={data.backToCurrentHref}
            className="rounded-full border border-[#d6c7a9] bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6e5d37] transition-colors hover:border-[#B48E4B] hover:text-[#8d6b1f]"
          >
            {data.primaryCtaLabel}
          </Link>
          {data.sourceHref ? (
            <a
              href={data.sourceHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#d6c7a9] bg-[#F9F7F2] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6e5d37] transition-colors hover:border-[#B48E4B] hover:text-[#8d6b1f]"
            >
              Ver imagen fuente
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
