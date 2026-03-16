import SectionHeader from '@/components/archive/SectionHeader';
import CuratedSection from '@/components/archive/CuratedSection';
import LegajoShell from '@/components/shells/LegajoShell';
import { LegajoCorpusVM, LegajoCuratorialVM } from '@/lib/view-models';

export default function LegajoCuratorialScreen({ legajo, content }: { legajo: LegajoCorpusVM; content: LegajoCuratorialVM }) {
  return (
    <LegajoShell
      legajo={legajo}
      currentTab={content.kind}
      breadcrumbs={[
        { href: '/', label: 'Inicio' },
        { href: '/legajos', label: 'Legajos' },
        { href: `/legajos/${legajo.id}`, label: `Legajo ${legajo.id}` },
        { label: content.kind === 'recorridos' ? 'Recorridos' : 'Relatos' },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
        <section className="rounded-[1.75rem] border border-[#e2d6bf] bg-white px-6 py-6 shadow-sm md:px-8 md:py-8">
          <SectionHeader eyebrow="Curatorial" title={content.title} description={content.description} />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {content.modules.map((module) => (
              <article key={module.title} className="rounded-[1.25rem] border border-dashed border-[#d8c89e] bg-[#f7f1e6]/70 p-5">
                <h3 className="reader-display text-2xl font-semibold text-[#221c13]">{module.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#6a5d47]">{module.description}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-5">
          <CuratedSection
            section={{
              id: `${legajo.id}-${content.kind}-status`,
              eyebrow: 'Estado',
              title: 'Capa preparada para narrativa futura',
              description: 'La estructura de pantalla ya existe y puede absorber Curatorial sin rehacer rutas, tabs ni composicion del legajo.',
              status: 'placeholder',
            }}
          />
        </div>
      </div>
    </LegajoShell>
  );
}
