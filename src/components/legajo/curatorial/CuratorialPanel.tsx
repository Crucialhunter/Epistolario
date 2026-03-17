import type { ReactNode } from 'react';

export default function CuratorialPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.35rem] border border-[#d1cebd]/75 bg-[rgba(255,255,255,0.46)] px-6 py-6 shadow-[0_14px_32px_rgba(44,44,42,0.06)] md:px-8 md:py-8">
      <div className="max-w-3xl border-b border-[#d1cebd]/80 pb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a7a3d]">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-[1.8rem] font-semibold leading-tight text-[#2c2c2a] md:text-[2.15rem]">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-relaxed text-[#6b5a44] md:text-base">{description}</p> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
