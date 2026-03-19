import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  centered?: boolean;
}

export default function SectionHeader({ eyebrow, title, description, actions, centered }: SectionHeaderProps) {
  return (
    <div className={centered ? 'text-center' : 'flex flex-col gap-4 md:flex-row md:items-end md:justify-between'}>
      <div className={centered ? 'mx-auto max-w-2xl' : 'max-w-3xl'}>
        {eyebrow && (
          <p className="app-label mb-3 text-[#a38420]">{eyebrow}</p>
        )}
        <h2 className="reader-display text-[1.75rem] font-semibold text-[#221c13] md:text-[2.1rem]">
          {title}
        </h2>
        {description && (
          <p className={`mt-3 text-[14.5px] leading-relaxed text-[#6a5d47] ${centered ? '' : 'max-w-2xl'}`}>
            {description}
          </p>
        )}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
