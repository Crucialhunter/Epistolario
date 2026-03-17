import Link from 'next/link';
import { CuratorialLetterCard } from '@/lib/curatorial/legajoCuratorial';
import CuratorialPanel from '@/components/legajo/curatorial/CuratorialPanel';

export default function CuratorialKeyLettersModule({ letters }: { letters: CuratorialLetterCard[] }) {
  return (
    <CuratorialPanel
      eyebrow="Cartas clave"
      title="Piezas documentales de entrada"
      description="Cartas seleccionadas para fijar hitos, escenas y puntos de apoyo del trabajo curatorial."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {letters.map((letter) => (
          <article key={letter.id} className="rounded-[1.05rem] border border-[#d1cebd]/75 bg-[#f7f2e6]/92 px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">{letter.meta}</p>
            <h3 className="mt-3 font-serif text-[1.55rem] font-semibold leading-tight text-[#2c2c2a]">{letter.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6b5a44]">{letter.reason}</p>
            <p className="mt-4 rounded-r-[0.9rem] border-l-2 border-[#c5a059] bg-white/55 px-4 py-3 text-sm italic leading-relaxed text-[#2c2c2a]">"{letter.quote}"</p>
            <Link
              href={letter.href}
              className="mt-5 inline-flex rounded-full border border-[#d1cebd] bg-white/75 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
            >
              Abrir carta {letter.id}
            </Link>
          </article>
        ))}
      </div>
    </CuratorialPanel>
  );
}
