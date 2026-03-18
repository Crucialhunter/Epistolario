import Link from 'next/link';
import ArchiveShell from '@/components/shells/ArchiveShell';
import SectionHeader from '@/components/archive/SectionHeader';
import MetricPanel from '@/components/archive/MetricPanel';
import CuratedSection from '@/components/archive/CuratedSection';
import LegajoCard from '@/components/legajo/LegajoCard';
import { getArchiveOverviewVM } from '@/lib/view-models';

export default async function Home() {
  const overview = await getArchiveOverviewVM();

  return (
    <ArchiveShell headerProps={{ activeSection: 'home', contextMode: 'none' }}>
      <div className="mx-auto grid max-w-[1440px] gap-6 px-6 py-6 md:px-10 md:py-8 lg:px-16 lg:py-10">
        <section className="app-surface-dark grid gap-6 rounded-[2.1rem] px-6 py-7 text-[#fcfbf8] md:px-8 lg:grid-cols-[minmax(0,1.22fr)_360px] lg:px-10 lg:py-8">
          <div>
            <p className="app-label text-[#d8be66]">Archivo epistolar navegable</p>
            <h1 className="reader-display mt-3 max-w-4xl text-4xl font-semibold leading-[0.98] text-white md:text-[3.8rem]">{overview.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#ebe3d1]">{overview.intro}</p>
            <div className="mt-6 flex flex-wrap gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f0dfb4]">
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">41 legajos</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">6701 cartas navegables</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">Capa visual activa en 06, 10 y 19</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/legajos" className="rounded-full border border-[#f0dfb4] bg-[#f0dfb4] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#221c13] transition-colors hover:bg-[#f6e9c8]">
                Explorar el archivo completo
              </Link>
              <Link href="/legajos/10" className="rounded-full border border-white/15 bg-white/6 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#fcfbf8] transition-colors hover:border-white/30 hover:bg-white/10">
                Entrar por legajo 10
              </Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-[#1b180d]/48 p-6">
            <div>
              <p className="app-label text-[#b69a5f]">Como leer esta demo</p>
              <p className="mt-4 text-sm leading-relaxed text-[#ebe3d1]">
                La plataforma ya puede recorrerse por escala, actores, lugares y legajos concretos. La capa visual refuerza algunos fondos, pero la lectura documental del conjunto ya es plenamente navegable.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-black/10 px-4 py-4 text-sm text-[#ebe3d1]">
              <p className="app-label text-[#d8be66]">Ruta recomendada</p>
              <p className="mt-2 leading-relaxed">Empieza por el índice general para tomar escala, entra en 06, 10 o 19 si quieres apoyo manuscrito, y vuelve después al resto del catálogo para explorar el corpus textual completo.</p>
            </div>
          </div>
        </section>

        <MetricPanel metrics={overview.metrics} />

        <section className="grid gap-5">
          <SectionHeader
            eyebrow="Destacados"
            title="Tres puertas de entrada al archivo"
            description="Los legajos 06, 10 y 19 concentran hoy la capa visual local. Funcionan como puertas de entrada intensas, pero descansan sobre el mismo corpus textual completo que sostiene todo el archivo."
            actions={<Link href="/legajos" className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742] hover:text-[#a38420]">Ver los 41 legajos</Link>}
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {overview.featuredLegajos.map((legajo) => (
              <LegajoCard key={legajo.id} legajo={legajo} />
            ))}
          </div>
        </section>

        <section className="grid gap-5">
          <SectionHeader
            eyebrow="Descubrimiento"
            title="Claves para orientarse en el fondo"
            description="La Home deja de ser solo un acceso inicial y empieza a ofrecer criterios reales de exploración a partir de CorpusBase: personas, lugares, escala y densidad documental."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {overview.discoveryBlocks.map((block) => (
              <article key={block.id} className="app-surface rounded-[1.55rem] px-5 py-5">
                <p className="app-label">{block.eyebrow}</p>
                <h3 className="reader-display mt-3 text-2xl font-semibold text-[#221c13]">{block.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#6a5d47]">{block.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {block.items.map((item) => (
                    <span key={item} className="app-chip rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {overview.curatedSections.map((section) => (
            <CuratedSection key={section.id} section={section} />
          ))}
        </section>
      </div>
    </ArchiveShell>
  );
}
