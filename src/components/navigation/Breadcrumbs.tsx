import Link from 'next/link';

export interface BreadcrumbItem {
  href?: string;
  label: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f7742]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const content = item.href && !isLast ? (
          <Link href={item.href} className="transition-colors hover:text-[#a38420]">
            {item.label}
          </Link>
        ) : (
          <span className={isLast ? 'text-[#221c13]' : ''}>{item.label}</span>
        );

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {content}
            {!isLast && <span className="text-[#c9b996]">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
