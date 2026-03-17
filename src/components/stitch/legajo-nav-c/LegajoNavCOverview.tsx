import Link from 'next/link';
import type { StitchLegajoNavCViewData } from '@/lib/stitch/legajoNavCAdapter';

export interface LegajoNavCOverviewProps {
  readonly data: Readonly<StitchLegajoNavCViewData>;
}

export default function LegajoNavCOverview({ data }: Readonly<LegajoNavCOverviewProps>) {
  return (
    <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_360px]">
        <article className="rounded-[1.5rem] border border-[#D9D3C6] bg-white p-6 shadow-[0_18px_36px_rgba(32,28,24,0.06)] lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B48E4B]">Overview documental</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#1A1A1A] sm:text-[2.4rem]">Promesa y contexto del legajo</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#4E463B] sm:text-base">{data.overviewIntro}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {data.overviewHighlights.map((item) => (
              <article key={item.title} className="rounded-[1.15rem] border border-[#E5E1D8] bg-[#FBF8F2] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B48E4B]">{item.eyebrow}</p>
                <h3 className="mt-3 font-serif text-[1.45rem] leading-tight text-[#1A1A1A]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5F5547]">{item.description}</p>
              </article>
            ))}
          </div>
        </article>

        <aside className="grid gap-4">
          <article className="rounded-[1.5rem] border border-[#D9D3C6] bg-[#F3EBD8] p-5 shadow-[0_18px_36px_rgba(32,28,24,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8F7642]">Siguiente paso</p>
            <h3 className="mt-3 font-serif text-2xl leading-tight text-[#1A1A1A]">Entrar al archivo de trabajo</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#5F5547]">
              Cuando ya tengas contexto, pasa al workspace documental para filtrar cartas, abrir previews y saltar al lector.
            </p>
            <Link
              href={`/legajos/${data.legajoId}/archivo`}
              className="mt-5 inline-flex rounded-full border border-[#B48E4B] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#7C6330] transition-colors hover:bg-[#FCFAF5]"
            >
              Abrir archivo
            </Link>
          </article>

          <article className="rounded-[1.5rem] border border-[#D9D3C6] bg-white p-5 shadow-[0_18px_36px_rgba(32,28,24,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B48E4B]">Accesos</p>
            <div className="mt-4 grid gap-3">
              {data.accessCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-[1rem] border border-[#E5E1D8] bg-[#FBF8F2] px-4 py-4 text-sm text-[#5F5547] transition-colors hover:border-[#B48E4B]"
                >
                  <p className="font-semibold text-[#1A1A1A]">{card.title}</p>
                  <p className="mt-2 leading-relaxed">{card.description}</p>
                </Link>
              ))}
            </div>
          </article>
        </aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article className="rounded-[1.5rem] border border-[#D9D3C6] bg-white p-6 shadow-[0_18px_36px_rgba(32,28,24,0.06)] lg:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B48E4B]">Cartas clave</p>
              <h3 className="mt-3 font-serif text-2xl leading-tight text-[#1A1A1A]">Puertas de entrada al legajo</h3>
            </div>
            <Link
              href={`/legajos/${data.legajoId}/archivo`}
              className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8F7642] transition-colors hover:text-[#6E5D37]"
            >
              Ver todas en archivo
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {data.featuredLetters.map((letter) => (
              <article key={letter.id} className="rounded-[1rem] border border-[#E5E1D8] bg-[#FBF8F2] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B48E4B]">Carta {letter.id}</p>
                    <h4 className="mt-2 font-serif text-xl leading-tight text-[#1A1A1A]">{letter.title}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {letter.badges.map((badge) => (
                      <span key={badge} className="rounded-full border border-[#DDD3BE] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#7A6A4A]">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#5F5547]">{letter.summary}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/legajos/${data.legajoId}/cartas/${letter.id}`}
                    className="rounded-full border border-[#B48E4B] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#7C6330] transition-colors hover:bg-[#FCFAF5]"
                  >
                    Abrir carta
                  </Link>
                  <Link
                    href={`/legajos/${data.legajoId}/archivo`}
                    className="rounded-full border border-[#D6C7A9] bg-[#F9F7F2] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#6E5D37] transition-colors hover:border-[#B48E4B]"
                  >
                    Ver en archivo
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[#D9D3C6] bg-white p-6 shadow-[0_18px_36px_rgba(32,28,24,0.06)]">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B48E4B]">Nodos</p>
          <h3 className="mt-3 font-serif text-2xl leading-tight text-[#1A1A1A]">Personas, lugares y temas</h3>

          <div className="mt-6 grid gap-5">
            {data.nodeGroups.map((group) => (
              <div key={group.title}>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8F7642]">{group.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={item} className="rounded-full border border-[#E5E1D8] bg-[#FBF8F2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#5F5547]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
