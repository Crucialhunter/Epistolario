import Link from 'next/link';
import { CuratedSectionVM } from '@/lib/view-models';

export default function CuratedSection({ section, href }: { section: CuratedSectionVM; href?: string }) {
  const isPlanned = section.status === 'planned';

  const content = (
    <div className="flex h-full flex-col">
      <p className="app-label text-[#a38420]">{section.eyebrow}</p>
      <h3 className="reader-display mt-3 text-[1.35rem] font-semibold text-[#221c13]">
        {section.title}
      </h3>
      <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-[#6a5d47]">
        {section.description}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            isPlanned ? 'bg-[#c5a028]' : 'bg-[#d1cebd]'
          }`}
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a7d66]">
          {isPlanned ? 'Preparado para la siguiente capa' : 'Estructura reservada'}
        </p>
      </div>
    </div>
  );

  const classes =
    'app-surface-muted block h-full rounded-[1.55rem] px-6 py-6 transition-all duration-300';

  if (href) {
    return (
      <Link href={href} className={`${classes} hover:border-[#c5a028]/60`}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
