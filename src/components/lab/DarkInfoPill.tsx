'use client';

export interface DarkInfoPillProps {
  leftLabel: string;
  rightLabel?: string;
  tone?: 'default' | 'accent' | 'muted';
  className?: string;
}

export default function DarkInfoPill({
  leftLabel,
  rightLabel,
  tone = 'default',
  className = '',
}: Readonly<DarkInfoPillProps>) {
  const toneClass =
    tone === 'accent'
      ? 'border-[#7a6238] bg-[linear-gradient(180deg,#30271f_0%,#241d18_100%)] text-[#f2dfb3]'
      : tone === 'muted'
        ? 'border-[#4e4338] bg-[linear-gradient(180deg,#28231f_0%,#211c18_100%)] text-[#dfd2be]'
        : 'border-[#5b4c3f] bg-[linear-gradient(180deg,#221d18_0%,#191613_100%)] text-[#f3e8d3]';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] shadow-[0_10px_24px_rgba(17,13,10,0.18)] ${toneClass} ${className}`}
    >
      <span>{leftLabel}</span>
      {rightLabel ? <span className="h-3.5 w-px bg-white/14" /> : null}
      {rightLabel ? <span className="text-[#d9ccb5]">{rightLabel}</span> : null}
    </span>
  );
}
