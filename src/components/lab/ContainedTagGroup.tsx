'use client';

export interface ContainedTagGroupProps {
  eyebrow: string;
  title?: string;
  description?: string;
  items: readonly string[];
  tone?: 'parchment' | 'ink';
  className?: string;
}

export default function ContainedTagGroup({
  eyebrow,
  title,
  description,
  items,
  tone = 'parchment',
  className = '',
}: Readonly<ContainedTagGroupProps>) {
  const containerClass =
    tone === 'ink'
      ? 'border-[#52463b] bg-[linear-gradient(180deg,rgba(35,30,25,0.96),rgba(28,24,20,0.98))] text-[#efe6d7]'
      : 'border-[#d7cebf] bg-[linear-gradient(180deg,rgba(255,252,246,0.94),rgba(246,239,227,0.92))] text-[#2a241c]';
  const itemClass =
    tone === 'ink'
      ? 'border-[#68594a] bg-[rgba(255,255,255,0.05)] text-[#efe6d7]'
      : 'border-[#d8d0c1] bg-white/76 text-[#6b5d46]';
  const eyebrowClass = tone === 'ink' ? 'text-[#d7b76f]' : 'text-[#8f7742]';

  return (
    <section className={`rounded-[1.25rem] border p-4 ${containerClass} ${className}`}>
      <div className="max-w-2xl">
        <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${eyebrowClass}`}>{eyebrow}</p>
        {title ? <h3 className="reader-display mt-2 text-[1.25rem] font-semibold leading-tight">{title}</h3> : null}
        {description ? <p className="mt-2 text-sm leading-relaxed opacity-90">{description}</p> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${itemClass}`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
