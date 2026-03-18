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
      {/* Main content area with premium background */}
      <div className="relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 -mx-6 -mt-4 bg-gradient-to-b from-[#fdfbf7] via-[#f8f5ef] to-[#f5efe3] opacity-50" />

        <div className="relative grid gap-8 px-4 md:px-0">
          <SectionHeader
            eyebrow="CorpusBase"
            title="Archivo navegable del legajo"
            description="Explora el contenido documental completo. Filtra por lugar, remitente o tema. Selecciona una carta para previsualizar su contenido."
          />
          <LegajoArchiveWorkspace legajo={archive.legajo} letters={archive.letters} initialPreview={archive.initialPreview} />
        </div>
      </div>
    </LegajoShell>
  );
}
