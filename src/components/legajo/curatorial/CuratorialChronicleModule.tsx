import Link from 'next/link';
import { CuratorialChronicleItem } from '@/lib/curatorial/legajoCuratorial';
import CuratorialPanel from '@/components/legajo/curatorial/CuratorialPanel';

export default function CuratorialChronicleModule({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: CuratorialChronicleItem[];
}) {
  return (
    <CuratorialPanel eyebrow="Periodico / Cronica" title={title} description={description}>
      <div className="grid gap-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-[1.05rem] border border-[#d1cebd]/75 bg-[#f7f2e6]/92 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">{item.dateLabel}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a7a3d]">{item.meta}</p>
            </div>
            <h3 className="mt-3 font-serif text-[1.6rem] font-semibold leading-tight text-[#2c2c2a]">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6b5a44]">{item.summary}</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="rounded-[0.95rem] border border-[#d1cebd]/70 bg-white/55 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8f7b53]">Evidencia</p>
                <p className="mt-2 text-sm italic leading-relaxed text-[#2c2c2a]">"{item.quote}"</p>
              </div>
              <Link
                href={item.href}
                className="rounded-full border border-[#d1cebd] bg-white/75 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
              >
                {item.letterLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </CuratorialPanel>
  );
}
