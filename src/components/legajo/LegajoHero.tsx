import AvailabilityBadge from '@/components/archive/AvailabilityBadge';
import { LegajoCorpusVM } from '@/lib/view-models';

export default function LegajoHero({ legajo }: { legajo: LegajoCorpusVM }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#d8c89e] bg-[#2d2a26] text-[#fcfbf8] shadow-2xl">
      <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:px-10 lg:py-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#d8be66]">Legajo {legajo.id}</p>
          <h1 className="reader-display mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">{legajo.title}</h1>
          <p className="mt-3 text-base text-[#d8be66]">{legajo.dateRange}</p>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-[#ebe3d1]">{legajo.summary}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-[#1b180d]/50 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Disponibilidad</p>
          <div className="mt-4">
            <AvailabilityBadge {...legajo.availability} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-[#ebe3d1]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f7742]">Cartas</p>
              <p className="reader-display mt-2 text-2xl text-white">{legajo.letterCount}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f7742]">Imagenes</p>
              <p className="reader-display mt-2 text-2xl text-white">{legajo.imageCount}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
