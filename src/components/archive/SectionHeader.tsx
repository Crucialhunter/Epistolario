import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function SectionHeader({ eyebrow, title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#a38420]">{eyebrow}</p>}
        <h2 className="reader-display text-3xl font-semibold text-[#221c13] md:text-4xl">{title}</h2>
        {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6a5d47] md:text-base">{description}</p>}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
