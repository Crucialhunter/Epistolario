import { CuratorialStat } from '@/lib/curatorial/legajoCuratorial';

export default function CuratorialHero({
  title,
  description,
  intro,
  highlight,
  sourceLabel,
  stats,
  fallbackNote,
}: {
  title: string;
  description: string;
  intro: string;
  highlight: string;
  sourceLabel: string;
  stats: CuratorialStat[];
  fallbackNote?: string;
}) {
  return (
    <section className="rounded-[1.4rem] border border-[#d1cebd]/80 bg-[#f5f2e8] px-6 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] md:px-8 md:py-7">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.24fr)_320px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a7a3d]">Curatorial</p>
            <span className="rounded-full border border-[#d1cebd] bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453]">
              {sourceLabel}
            </span>
          </div>
          <h1 className="mt-3 max-w-4xl font-serif text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.025em] text-[#201c18] md:text-[2.65rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-[1rem] leading-relaxed text-[#6b5a44]">{description}</p>
          <div className="mt-5 grid gap-4 border-t border-[#d1cebd]/75 pt-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <p className="text-sm leading-relaxed text-[#6b5a44]">{intro}</p>
            <div className="rounded-[1rem] border border-[#d1cebd]/75 bg-[linear-gradient(to_right,#f5f2e8_0%,#efebe0_52%,#f1e9d0_100%)] px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Lectura de entrada</p>
              <p className="mt-2 text-sm leading-relaxed text-[#2c2c2a]">{highlight}</p>
            </div>
          </div>
          {fallbackNote ? <p className="mt-4 text-xs leading-relaxed text-[#7a6b4f]">{fallbackNote}</p> : null}
        </div>

        <div className="grid gap-3 self-start lg:border-l lg:border-[#d1cebd]/70 lg:pl-6">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-[1rem] border border-[#d1cebd]/75 bg-white/65 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">{stat.label}</p>
              <p className="mt-2 font-serif text-[2rem] font-semibold leading-none text-[#201c18]">{stat.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#6b5a44]">{stat.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
