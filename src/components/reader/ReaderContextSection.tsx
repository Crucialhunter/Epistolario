import { CartaDetail } from '@/lib/types';
import { LegajoCorpusVM } from '@/lib/view-models';

export default function ReaderContextSection({ carta, legajo }: { carta: CartaDetail; legajo: LegajoCorpusVM }) {
  return (
    <section className="grid gap-6 rounded-[1.75rem] border border-[#e2d6bf] bg-white px-6 py-6 shadow-sm md:px-8 md:py-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Contexto documental</p>
        <h2 className="reader-display mt-3 text-3xl font-semibold text-[#221c13]">Entrada interpretativa</h2>
        <p className="mt-4 text-sm leading-relaxed text-[#6a5d47]">
          {carta.resumen || 'Bloque preparado para ensamblar contexto, cronologia y significado documental a partir del CorpusBase y futuras capas curatoriales.'}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-[1.25rem] border border-[#efe5d3] bg-[#fcfbf8] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Personas y lugares</p>
          <p className="mt-3 text-sm leading-relaxed text-[#6a5d47]">
            Personas destacadas: {(legajo.keyPeople.slice(0, 4).join(', ') || 'Sin personas destacadas')}.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#6a5d47]">
            Lugares clave: {(legajo.keyPlaces.slice(0, 4).join(', ') || 'Sin lugares destacados')}.
          </p>
        </article>
        <article className="rounded-[1.25rem] border border-dashed border-[#d8c89e] bg-[#f7f1e6]/70 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Capa Curatorial</p>
          <p className="mt-3 text-sm leading-relaxed text-[#6a5d47]">
            Region reservada para relaciones, eventos, narrativas y puntos de interes cuando llegue la capa Curatorial.
          </p>
        </article>
      </div>
    </section>
  );
}
