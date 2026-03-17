import Link from 'next/link';
import { CuratorialPeriodicalData } from '@/lib/curatorial/legajoCuratorial';

export default function CuratorialPeriodicalModule({ data }: { data: CuratorialPeriodicalData }) {
  return (
    <section className="overflow-hidden rounded-[1.4rem] border border-[#d1cebd]/80 bg-[#f5f2e8] shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
      <div className="border-b border-[#1a1a18] bg-[#1a1a18] px-6 py-4 text-[#f5f2e8] md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c5a059]">{data.issueLabel}</p>
            <h2 className="mt-2 font-serif text-[2rem] font-semibold leading-tight text-[#f5f2e8] md:text-[2.35rem]">{data.title}</h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-[#d9d2c4]">{data.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 md:px-8 md:py-8 xl:grid-cols-[minmax(0,1.22fr)_340px]">
        <article className="rounded-[1.05rem] border border-[#d1cebd]/75 bg-[linear-gradient(to_right,#f5f2e8_0%,#efebe0_52%,#f1e9d0_100%)] px-5 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#1a1a18] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8]">Pieza principal</span>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">{data.lead.dateLabel}</p>
          </div>
          <h3 className="mt-4 max-w-3xl font-serif text-[2rem] font-semibold leading-[1.04] text-[#201c18] md:text-[2.4rem]">{data.lead.title}</h3>
          <p className="mt-4 max-w-3xl text-[1rem] leading-relaxed text-[#6b5a44]">{data.lead.summary}</p>
          <div className="mt-5 rounded-[1rem] border border-[#d1cebd]/75 bg-white/55 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8f7b53]">Evidencia</p>
            <p className="mt-2 text-sm italic leading-relaxed text-[#2c2c2a]">"{data.lead.quote}"</p>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#d1cebd]/75 pt-4">
            <p className="text-sm leading-relaxed text-[#6b5a44]">{data.editorNote}</p>
            <Link
              href={data.lead.href}
              className="rounded-full border border-[#d1cebd] bg-white/75 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
            >
              {data.lead.letterLabel}
            </Link>
          </div>
        </article>

        <div className="grid gap-4">
          <article className="rounded-[1rem] border border-[#d1cebd]/75 bg-white/60 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">En esta edicion</p>
            <div className="mt-3 grid gap-3">
              {data.secondary.map((item) => (
                <div key={item.id} className="rounded-[0.95rem] border border-[#d1cebd]/70 bg-[#f7f2e6]/75 px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a7a3d]">{item.dateLabel}</p>
                  <h4 className="mt-2 font-serif text-[1.15rem] font-semibold leading-tight text-[#2c2c2a]">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#6b5a44]">{item.summary}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1rem] border border-[#d1cebd]/75 bg-white/60 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Rutas y figuras en tension</p>
            <div className="mt-3 grid gap-2">
              {data.routeSignals.map((route) => (
                <div key={route} className="rounded-[0.9rem] bg-[#ede9de] px-3 py-2 text-sm leading-relaxed text-[#2c2c2a]">
                  {route}
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              {data.peopleSignals.map((person) => (
                <div key={person} className="rounded-[0.9rem] bg-[#f7f2e6] px-3 py-2 text-sm leading-relaxed text-[#6b5a44]">
                  {person}
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>

      <div className="border-t border-[#d1cebd]/80 bg-white/40 px-6 py-4 md:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Vinculo conceptual con el mapa</p>
        <p className="mt-2 text-sm leading-relaxed text-[#6b5a44]">{data.mapNote}</p>
      </div>
    </section>
  );
}
