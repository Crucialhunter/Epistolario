import Link from 'next/link';
import { CuratorialStory } from '@/lib/curatorial/legajoCuratorial';
import CuratorialPanel from '@/components/legajo/curatorial/CuratorialPanel';

export default function CuratorialStoriesModule({ stories }: { stories: CuratorialStory[] }) {
  return (
    <CuratorialPanel
      eyebrow="Relatos"
      title="Tesis, evidencia y cartas relacionadas"
      description="Primer sprint del modo relato: piezas editoriales breves, con anclaje documental y recorridos de lectura."
    >
      <div className="grid gap-5">
        {stories.map((story) => (
          <article key={story.id} className="rounded-[1.05rem] border border-[#d1cebd]/75 bg-[#f7f2e6]/92 px-5 py-5">
            <div className="border-b border-[#d1cebd]/75 pb-4">
              <h3 className="font-serif text-[1.8rem] font-semibold leading-tight text-[#2c2c2a]">{story.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6b5a44] md:text-base">{story.thesis}</p>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Evidencia</p>
                <p className="mt-2 text-sm leading-relaxed text-[#6b5a44]">{story.evidence}</p>
                <blockquote className="mt-4 rounded-r-[0.95rem] border-l-2 border-[#c5a059] bg-white/55 px-4 py-3 text-sm italic leading-relaxed text-[#2c2c2a]">
                  "{story.quote}"
                </blockquote>
                <p className="mt-2 text-xs text-[#7a6b4f]">{story.quoteMeta}</p>
              </div>
              <div className="space-y-3">
                <div className="rounded-[1rem] border border-[#d1cebd]/75 bg-white/60 px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Cartas relacionadas</p>
                  <div className="mt-3 grid gap-3">
                    {story.relatedLetters.map((letter) => (
                      <Link key={`${story.id}-${letter.label}`} href={letter.href} className="rounded-[0.95rem] border border-[#d1cebd]/75 bg-[#f7f2e6]/75 px-3 py-3 text-sm text-[#6b5a44] transition-colors hover:border-[#c5a059] hover:bg-white">
                        <span className="block font-semibold text-[#2c2c2a]">{letter.label}</span>
                        <span className="mt-1 block text-xs text-[#7a6b4f]">{letter.meta}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1rem] border border-[#d1cebd]/75 bg-white/60 px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Lineas de lectura</p>
                  <ul className="mt-3 grid gap-3 text-sm leading-relaxed text-[#6b5a44]">
                    {story.readingLine.map((line) => (
                      <li key={`${story.id}-${line}`} className="rounded-[0.95rem] border border-[#d1cebd]/70 bg-[#f7f2e6]/75 px-3 py-3">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </CuratorialPanel>
  );
}
