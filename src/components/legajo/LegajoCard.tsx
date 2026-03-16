import Link from 'next/link';
import AvailabilityBadge from '@/components/archive/AvailabilityBadge';
import { LegajoCorpusVM } from '@/lib/view-models';

export default function LegajoCard({ legajo }: { legajo: LegajoCorpusVM }) {
  const isVisual = legajo.emphasis === 'visual';

  return (
    <Link
      href={`/legajos/${legajo.id}`}
      className={`group flex h-full flex-col rounded-[1.75rem] border p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${isVisual ? 'border-[#d8c89e] bg-[#fbf7ef] hover:border-[#c5a028]' : 'border-[#e7dcc6] bg-white hover:border-[#c5a028]'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a38420]">Legajo {legajo.id}</p>
          <h3 className="reader-display mt-3 text-2xl font-semibold text-[#221c13]">{legajo.title}</h3>
          <p className="mt-2 text-sm text-[#6a5d47]">{legajo.dateRange}</p>
        </div>
        <div className="grid justify-items-end gap-2 text-right">
          <span className="rounded-full border border-[#ece4d5] bg-[#fcfbf8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8f7742]">
            {legajo.letterCount} cartas
          </span>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${isVisual ? 'bg-[#221c13] text-[#f0dfb4]' : 'bg-[#f3eee4] text-[#6a5d47]'}`}>
            {isVisual ? 'Capa visual activa' : 'Lectura textual completa'}
          </span>
        </div>
      </div>

      <p className="mt-5 flex-1 text-sm leading-relaxed text-[#6a5d47]">{legajo.teaserText}</p>

      {legajo.principalActors.length > 0 ? (
        <div className="mt-5 rounded-[1.1rem] border border-[#efe5d3] bg-[#fcfbf8] px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f7742]">Actores principales</p>
          <p className="mt-2 text-sm leading-relaxed text-[#6a5d47]">{legajo.principalActors.slice(0, 3).join(' · ')}</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 rounded-[1.1rem] border border-[#efe5d3] bg-[#fcfbf8] px-4 py-4 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8f7742]">Rango</p>
          <p className="mt-2 text-sm leading-relaxed text-[#6a5d47]">{legajo.dateRange}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8f7742]">Cartas</p>
          <p className="mt-2 text-sm leading-relaxed text-[#6a5d47]">{legajo.letterCount}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8f7742]">Modo</p>
          <p className="mt-2 text-sm leading-relaxed text-[#6a5d47]">{isVisual ? 'Textual + visual' : 'Textual completo'}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {legajo.keyPlaces.slice(0, 2).map((place) => (
          <span key={place} className="rounded-full bg-[#f7f1e6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6a5d47]">{place}</span>
        ))}
        {legajo.keyThemes.slice(0, 2).map((theme) => (
          <span key={theme} className="rounded-full bg-[#f3eee4] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6a5d47]">{theme}</span>
        ))}
        {legajo.narrativeDensity ? (
          <span className="rounded-full border border-[#e7dcc6] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8f7742]">
            Densidad {legajo.narrativeDensity}
          </span>
        ) : null}
      </div>

      <div className="mt-6 border-t border-[#efe5d3] pt-5">
        <AvailabilityBadge {...legajo.availability} />
      </div>
    </Link>
  );
}
