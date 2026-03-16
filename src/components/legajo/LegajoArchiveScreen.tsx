import SectionHeader from '@/components/archive/SectionHeader';
import CuratedSection from '@/components/archive/CuratedSection';
import LegajoArchiveWorkspace from '@/components/legajo/LegajoArchiveWorkspace';
import LegajoShell from '@/components/shells/LegajoShell';
import { LegajoArchiveVM } from '@/lib/view-models';

export default function LegajoArchiveScreen({ archive }: { archive: LegajoArchiveVM }) {
  return (
    <LegajoShell
      legajo={archive.legajo}
      currentTab="archivo"
      breadcrumbs={[
        { href: '/', label: 'Inicio' },
        { href: '/legajos', label: 'Legajos' },
        { label: `Legajo ${archive.legajo.id}` },
      ]}
      lowerModules={archive.curatorialSections.map((section) => (
        <CuratedSection key={section.id} section={section} />
      ))}
    >
      <div className="grid gap-6">
        <SectionHeader
          eyebrow="CorpusBase"
          title="Archivo navegable del legajo"
          description="La vista de legajo queda preparada para exploracion textual completa, filtros, navegacion entre cartas y preview lateral con enriquecimiento visual opcional."
        />
        <LegajoArchiveWorkspace legajo={archive.legajo} letters={archive.letters} initialPreview={archive.initialPreview} />
      </div>
    </LegajoShell>
  );
}
