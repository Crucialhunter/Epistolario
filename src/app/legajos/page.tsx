import ArchiveShell from '@/components/shells/ArchiveShell';
import SectionHeader from '@/components/archive/SectionHeader';
import MetricPanel from '@/components/archive/MetricPanel';
import LegajoCard from '@/components/legajo/LegajoCard';
import { getArchiveOverviewVM, getLegajoCatalogVM } from '@/lib/view-models';

export default async function LegajosPage() {
  const [overview, legajos] = await Promise.all([getArchiveOverviewVM(), getLegajoCatalogVM()]);
  const visualLegajos = legajos.filter((legajo) => legajo.availability.imageEnhanced);
  const textualLegajos = legajos.filter((legajo) => !legajo.availability.imageEnhanced);
  const largestLegajos = [...legajos].sort((left, right) => right.letterCount - left.letterCount).slice(0, 6);

  return (
    <ArchiveShell>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 md:px-10 md:py-10 lg:px-16">
        <section className="grid gap-5 rounded-[2rem] border border-[#e7dcc6] bg-white px-6 py-7 shadow-sm lg:grid-cols-[minmax(0,1.15fr)_340px] lg:px-8">
          <div>
            <SectionHeader
              eyebrow="Catalogo"
              title="Indice de legajos"
              description="El índice ya no funciona como un listado plano: presenta un corpus textual completo de 41 legajos y deja visible, cuando existe, la capa visual reforzada."
            />
          </div>
          <div className="rounded-[1.5rem] border border-[#efe5d3] bg-[#fbf7ef] p-5 text-sm text-[#6a5d47]">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Lectura rápida</p>
            <div className="mt-4 grid gap-3">
              <p><span className="font-semibold text-[#221c13]">06, 10 y 19</span> ofrecen manuscrito local y preview visual enriquecido.</p>
              <p><span className="font-semibold text-[#221c13]">Los 41 legajos</span> ya pueden leerse como corpus textual navegable.</p>
              <p><span className="font-semibold text-[#221c13]">Las cards</span> muestran escala, actores, rango temporal y densidad para entrar con criterio.</p>
            </div>
          </div>
        </section>

        <MetricPanel metrics={overview.metrics} />

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
          <article className="rounded-[1.6rem] border border-[#d8c89e] bg-[#fbf7ef] px-5 py-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Capa visual</p>
            <h3 className="reader-display mt-3 text-2xl font-semibold text-[#221c13]">Legajos reforzados</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6a5d47]">Entradas donde el manuscrito local ya acompaña la exploración del archivo y hace más inmediata la lectura documental.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {visualLegajos.map((legajo) => (
                <span key={legajo.id} className="rounded-full border border-[#d8c89e] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8f7742]">
                  Legajo {legajo.id}
                </span>
              ))}
            </div>
          </article>
          <article className="rounded-[1.6rem] border border-[#e7dcc6] bg-white px-5 py-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Escala</p>
            <h3 className="reader-display mt-3 text-2xl font-semibold text-[#221c13]">Mayor densidad documental</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6a5d47]">Una forma rápida de entrar al archivo por volumen de cartas, no solo por número de legajo.</p>
            <div className="mt-4 grid gap-2 text-sm text-[#6a5d47]">
              {largestLegajos.slice(0, 4).map((legajo) => (
                <p key={legajo.id}>Legajo {legajo.id} · {legajo.letterCount} cartas</p>
              ))}
            </div>
          </article>
          <article className="rounded-[1.6rem] border border-[#e7dcc6] bg-white px-5 py-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Sugerencia de uso</p>
            <h3 className="reader-display mt-3 text-2xl font-semibold text-[#221c13]">Cómo recorrer este índice</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6a5d47]">Usa primero las entradas reforzadas para una lectura más visual y después amplía la exploración por actores, temas, rango temporal o densidad narrativa en el resto del corpus.</p>
          </article>
        </section>

        <section className="grid gap-5">
          <SectionHeader
            eyebrow="Entradas reforzadas"
            title="Legajos con capa visual activa"
            description="Estas cards marcan las puertas de entrada más intensas de la demo actual: mismo CorpusBase, más presencia manuscrita y una señal más clara de disponibilidad visual."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visualLegajos.map((legajo) => (
              <LegajoCard key={legajo.id} legajo={legajo} />
            ))}
          </div>
        </section>

        <section className="grid gap-5">
          <SectionHeader
            eyebrow="Catalogo completo"
            title="Resto del archivo textual"
            description="El resto de legajos sigue siendo plenamente navegable: overview, lista de cartas, lector textual y filtros, aunque sin capa visual local reforzada."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {textualLegajos.map((legajo) => (
              <LegajoCard key={legajo.id} legajo={legajo} />
            ))}
          </div>
        </section>
      </div>
    </ArchiveShell>
  );
}
