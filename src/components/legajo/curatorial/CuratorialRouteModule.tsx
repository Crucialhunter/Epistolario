import Link from 'next/link';
import { CuratorialStep } from '@/lib/curatorial/legajoCuratorial';
import CuratorialPanel from '@/components/legajo/curatorial/CuratorialPanel';

export default function CuratorialRouteModule({
  title,
  description,
  steps,
}: {
  title: string;
  description: string;
  steps: CuratorialStep[];
}) {
  return (
    <CuratorialPanel eyebrow="Recorrido guiado" title={title} description={description}>
      <div className="grid gap-4">
        {steps.map((step) => (
          <article key={step.id} className="rounded-[1.05rem] border border-[#d1cebd]/75 bg-[#f7f2e6]/92 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d1cebd]/70 pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#1a1a18] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f2e8]">{step.label}</span>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">{step.meta}</p>
              </div>
            </div>
            <h3 className="mt-4 font-serif text-[1.6rem] font-semibold leading-tight text-[#2c2c2a]">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6b5a44] md:text-base">{step.summary}</p>
            <blockquote className="mt-4 rounded-r-[0.9rem] border-l-2 border-[#c5a059] bg-white/55 px-4 py-3 text-sm italic leading-relaxed text-[#2c2c2a]">
              "{step.quote}"
            </blockquote>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#7a6b4f]">{step.quoteMeta}</p>
              <Link
                href={step.letterHref}
                className="rounded-full border border-[#d1cebd] bg-white/75 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
              >
                {step.letterLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </CuratorialPanel>
  );
}
