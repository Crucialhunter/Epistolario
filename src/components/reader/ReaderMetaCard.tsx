import { CartaDetail } from '@/lib/types';
import { LegajoCorpusVM } from '@/lib/view-models';

export default function ReaderMetaCard({ legajo, carta, themes, hasVisualLayer }: { legajo: LegajoCorpusVM; carta: CartaDetail; themes: string[]; hasVisualLayer: boolean }) {
  return (
    <section className="grid gap-4 rounded-[1.5rem] border border-[#e2d6bf] bg-white/75 p-5 text-sm text-[#6a5d47] shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Ficha documental</p>
          <p className="reader-display mt-3 text-2xl font-semibold text-[#221c13]">Legajo {legajo.id} / Carta {carta.id_carta}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${hasVisualLayer ? 'bg-[#f7f1e6] text-[#8f7742]' : 'bg-[#f1ece3] text-[#9b907c]'}`}>
          {hasVisualLayer ? 'ImageEnhanced activo' : 'CorpusBase activo'}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Correspondencia</p>
          <p className="mt-2 leading-relaxed">{carta.remitente || 'Remitente no identificado'} / {carta.destinatario || 'Destinatario no identificado'}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Fecha y lugar</p>
          <p className="mt-2 leading-relaxed">{carta.fecha || 'Sin fecha'}{carta.lugar ? ` / ${carta.lugar}` : ''}</p>
        </div>
      </div>
      {themes.length > 0 ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Temas</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {themes.map((theme) => (
              <span key={theme} className="rounded-full border border-[#e7dcc6] bg-[#fcfbf8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6a5d47]">{theme}</span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
