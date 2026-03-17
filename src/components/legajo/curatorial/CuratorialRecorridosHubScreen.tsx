import Link from 'next/link';
import LegajoShell from '@/components/shells/LegajoShell';
import { LegajoCorpusVM } from '@/lib/view-models';
import { LegajoCuratorialPageData } from '@/lib/curatorial/legajoCuratorial';
import CuratorialHero from '@/components/legajo/curatorial/CuratorialHero';
import CuratorialPanel from '@/components/legajo/curatorial/CuratorialPanel';

export default function CuratorialRecorridosHubScreen({
  legajo,
  content,
}: {
  legajo: LegajoCorpusVM;
  content: LegajoCuratorialPageData;
}) {
  return (
    <LegajoShell
      legajo={legajo}
      currentTab="recorridos"
      breadcrumbs={[
        { href: '/', label: 'Inicio' },
        { href: '/legajos', label: 'Legajos' },
        { href: `/legajos/${legajo.id}`, label: `Legajo ${legajo.id}` },
        { label: 'Recorridos' },
      ]}
    >
      <div className="grid gap-6">
        <CuratorialHero
          title={content.title}
          description={content.description}
          intro={content.intro}
          highlight={content.highlight}
          sourceLabel={content.sourceLabel}
          stats={content.stats}
          fallbackNote={content.fallbackNote}
        />

        <CuratorialPanel
          eyebrow="Modos de recorrido"
          title="Superficies separadas para leer el legajo"
          description="Timeline Viva sale a una ruta propia para reducir conflicto de integracion con la capa espacial. El hub de recorridos queda libre para coordinar despues los distintos modos."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
            <article className="rounded-[1.05rem] border border-[#c5a059]/42 bg-[linear-gradient(to_bottom,#f5f2e8_0%,#f1e9d0_100%)] p-5 shadow-[0_14px_28px_rgba(44,44,42,0.06)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Temporal</p>
              <h3 className="mt-2 font-serif text-[1.55rem] font-semibold leading-tight text-[#201c18]">Timeline Viva</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6b5a44]">
                Experiencia inmersiva full-screen para recorrer el legajo como secuencia de acontecimientos y cartas.
              </p>
              <div className="mt-5">
                <Link
                  href={`/legajos/${legajo.id}/recorridos/timeline`}
                  className="inline-flex rounded-full border border-[#c5a059]/42 bg-[#1a1a18] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8] transition-colors hover:border-[#c5a059] hover:bg-[#2a241e]"
                >
                  Abrir Timeline Viva
                </Link>
              </div>
            </article>

            <article className="rounded-[1.05rem] border border-[#d1cebd]/75 bg-white/62 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Espacial</p>
              <h3 className="mt-2 font-serif text-[1.55rem] font-semibold leading-tight text-[#201c18]">Mapa</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6b5a44]">
                Superficie cartografica reservada al otro hilo. Este hub ya deja clara la separacion entre lectura temporal y lectura espacial.
              </p>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a7a3d]">En integracion</p>
            </article>

            <article className="rounded-[1.05rem] border border-[#d1cebd]/75 bg-white/62 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Editorial</p>
              <h3 className="mt-2 font-serif text-[1.55rem] font-semibold leading-tight text-[#201c18]">Relatos</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6b5a44]">
                La capa de tesis, evidencia y cartas relacionadas queda consolidada aparte, sin mezclarse con la interfaz de recorrido.
              </p>
              <div className="mt-5">
                <Link
                  href={`/legajos/${legajo.id}/relatos`}
                  className="inline-flex rounded-full border border-[#d1cebd] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
                >
                  Abrir relatos
                </Link>
              </div>
            </article>
          </div>
        </CuratorialPanel>
      </div>
    </LegajoShell>
  );
}
