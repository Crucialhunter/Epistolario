import LegajoShell from '@/components/shells/LegajoShell';
import { LegajoCorpusVM } from '@/lib/view-models';
import { LegajoCuratorialPageData } from '@/lib/curatorial/legajoCuratorial';
import CuratorialHero from '@/components/legajo/curatorial/CuratorialHero';
import CuratorialKeyLettersModule from '@/components/legajo/curatorial/CuratorialKeyLettersModule';
import CuratorialContextTagsModule from '@/components/legajo/curatorial/CuratorialContextTagsModule';
import CuratorialReadingLinesModule from '@/components/legajo/curatorial/CuratorialReadingLinesModule';
import CuratorialChronicleModule from '@/components/legajo/curatorial/CuratorialChronicleModule';
import CuratorialStoriesModule from '@/components/legajo/curatorial/CuratorialStoriesModule';

export default function LegajoCuratorialScreen({ legajo, content }: { legajo: LegajoCorpusVM; content: LegajoCuratorialPageData }) {
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

        {content.kind === 'relatos' ? <CuratorialStoriesModule stories={content.stories} /> : null}

        {content.kind === 'relatos' ? (
          <>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_360px]">
              <CuratorialKeyLettersModule letters={content.keyLetters} />
              <div className="grid gap-6">
                <CuratorialContextTagsModule items={content.contextTags} />
                <CuratorialReadingLinesModule lines={content.readingLines} />
              </div>
            </div>

            <CuratorialChronicleModule title={content.chronicle.title} description={content.chronicle.description} items={content.chronicle.items} />
          </>
        ) : null}
      </div>
    </LegajoShell>
  );
}
