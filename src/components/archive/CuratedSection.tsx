import Link from 'next/link';
import { CuratedSectionVM } from '@/lib/view-models';

export default function CuratedSection({ section, href }: { section: CuratedSectionVM; href?: string }) {
  const content = (
    <>
      <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8f7742]">{section.eyebrow}</p>
      <h3 className="reader-display mt-3 text-2xl font-semibold text-[#221c13]">{section.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#6a5d47]">{section.description}</p>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#a38420]">
        {section.status === 'planned' ? 'Preparado para la siguiente capa' : 'Placeholder estructural activo'}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-[1.6rem] border border-dashed border-[#d8c89e] bg-[#f7f1e6]/70 px-6 py-6 transition-colors hover:border-[#c5a028]">
        {content}
      </Link>
    );
  }

  return <div className="rounded-[1.6rem] border border-dashed border-[#d8c89e] bg-[#f7f1e6]/70 px-6 py-6">{content}</div>;
}
