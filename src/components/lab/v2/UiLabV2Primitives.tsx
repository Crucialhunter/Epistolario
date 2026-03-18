'use client';

export interface LabV2ButtonProps {
  label: string;
  tone?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function LabV2Button({ label, tone = 'secondary', className = '' }: Readonly<LabV2ButtonProps>) {
  const toneClass =
    tone === 'primary'
      ? 'border-[#d4b26b] bg-[linear-gradient(180deg,#e8d39f_0%,#dcc07f_100%)] text-[#24190f] shadow-[0_12px_24px_rgba(33,24,15,0.18)]'
      : tone === 'ghost'
        ? 'border-[#cfc4b1] bg-transparent text-[#695c48] hover:border-[#b89c6a] hover:text-[#8a6a2d]'
        : 'border-[#d8ccb8] bg-[linear-gradient(180deg,rgba(255,251,245,0.96),rgba(246,238,225,0.96))] text-[#5e5240] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]';

  return (
    <button
      type="button"
      className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]/45 ${toneClass} ${className}`}
    >
      {label}
    </button>
  );
}

export interface LabV2PillProps {
  leftLabel: string;
  rightLabel?: string;
  tone?: 'default' | 'accent' | 'muted';
  className?: string;
}

export function LabV2Pill({
  leftLabel,
  rightLabel,
  tone = 'default',
  className = '',
}: Readonly<LabV2PillProps>) {
  const toneClass =
    tone === 'accent'
      ? 'border-[#8a6c39] bg-[linear-gradient(180deg,#342920_0%,#251d18_100%)] text-[#f1deb4]'
      : tone === 'muted'
        ? 'border-[#4f4338] bg-[linear-gradient(180deg,#29231f_0%,#211c18_100%)] text-[#ddd2be]'
        : 'border-[#615142] bg-[linear-gradient(180deg,#221c18_0%,#171412_100%)] text-[#f2e8d6]';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] shadow-[0_10px_22px_rgba(16,13,10,0.16)] ${toneClass} ${className}`}
    >
      <span>{leftLabel}</span>
      {rightLabel ? <span className="h-3.5 w-px bg-white/14" /> : null}
      {rightLabel ? <span className="text-[#daccb4]">{rightLabel}</span> : null}
    </span>
  );
}

export interface LabV2TagClusterProps {
  eyebrow: string;
  title?: string;
  description?: string;
  items: readonly string[];
  tone?: 'paper' | 'ink';
  className?: string;
}

export function LabV2TagCluster({
  eyebrow,
  title,
  description,
  items,
  tone = 'paper',
  className = '',
}: Readonly<LabV2TagClusterProps>) {
  const containerClass =
    tone === 'ink'
      ? 'border-[#51453a] bg-[linear-gradient(180deg,rgba(34,29,24,0.98),rgba(27,23,19,0.98))] text-[#f1e8d8] shadow-[0_16px_28px_rgba(20,16,12,0.16),inset_0_1px_0_rgba(255,255,255,0.03)]'
      : 'border-[#d8cebd] bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(244,237,226,0.95))] text-[#2a241d] shadow-[0_10px_24px_rgba(46,34,22,0.06),inset_0_1px_0_rgba(255,255,255,0.68)]';
  const itemClass =
    tone === 'ink'
      ? 'border-[#6a5949] bg-[rgba(255,255,255,0.05)] text-[#efe2c5]'
      : 'border-[#d8cfbf] bg-[linear-gradient(180deg,rgba(255,250,244,0.94),rgba(243,236,224,0.94))] text-[#6a5d49]';
  const eyebrowClass = tone === 'ink' ? 'text-[#d7b76f]' : 'text-[#8f7742]';

  return (
    <section className={`rounded-[1.3rem] border px-4 py-4 ${containerClass} ${className}`}>
      <div className="max-w-2xl">
        <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${eyebrowClass}`}>{eyebrow}</p>
        {title ? <h3 className="reader-display mt-2 text-[1.25rem] font-semibold leading-tight">{title}</h3> : null}
        {description ? <p className="mt-2 text-sm leading-relaxed opacity-90">{description}</p> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${itemClass}`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export interface LabV2SegmentedTabItem {
  value: string;
  label: string;
}

export interface LabV2SegmentedTabsProps {
  items: readonly LabV2SegmentedTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function LabV2SegmentedTabs({
  items,
  value,
  onValueChange,
  className = '',
}: Readonly<LabV2SegmentedTabsProps>) {
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 rounded-[1.05rem] border border-[#cfc3af] bg-[linear-gradient(180deg,rgba(250,245,235,0.88),rgba(239,232,218,0.92))] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] ${className}`}
    >
      {items.map((item) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onValueChange(item.value)}
            className={`rounded-[0.9rem] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.17em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]/40 ${
              isActive
                ? 'bg-[linear-gradient(180deg,#28211c_0%,#1d1815_100%)] text-[#f6efdf] shadow-[0_10px_20px_rgba(24,18,14,0.16)]'
                : 'text-[#716452] hover:bg-white/44 hover:text-[#2d241b]'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export interface LabV2PanelProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  tone?: 'paper' | 'ink' | 'muted';
  className?: string;
  children: React.ReactNode;
}

export function LabV2Panel({
  eyebrow,
  title,
  description,
  tone = 'paper',
  className = '',
  children,
}: Readonly<LabV2PanelProps>) {
  const toneClass =
    tone === 'ink'
      ? 'border-[#463c32] bg-[linear-gradient(180deg,rgba(32,27,23,0.99),rgba(25,21,18,0.98))] text-[#f1e8d8] shadow-[0_18px_34px_rgba(17,14,11,0.18),inset_0_1px_0_rgba(255,255,255,0.03)]'
      : tone === 'muted'
        ? 'border-[#d8cfbf] bg-[linear-gradient(180deg,rgba(245,239,227,0.98),rgba(238,231,219,0.96))] text-[#2b241c] shadow-[0_10px_22px_rgba(44,34,22,0.05),inset_0_1px_0_rgba(255,255,255,0.62)]'
        : 'border-[#d7cdbc] bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(244,236,224,0.96))] text-[#2b241c] shadow-[0_12px_28px_rgba(44,34,22,0.07),inset_0_1px_0_rgba(255,255,255,0.72)]';

  const eyebrowClass = tone === 'ink' ? 'text-[#d8be66]' : 'text-[#8f7742]';
  const descriptionClass = tone === 'ink' ? 'text-[#e3dac9]' : 'text-[#6b5d46]';

  return (
    <section className={`rounded-[1.6rem] border px-5 py-5 ${toneClass} ${className}`}>
      {eyebrow || title || description ? (
        <div className="max-w-3xl">
          {eyebrow ? <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${eyebrowClass}`}>{eyebrow}</p> : null}
          {title ? <h3 className="reader-display mt-3 text-[1.9rem] font-semibold leading-[0.96]">{title}</h3> : null}
          {description ? <p className={`mt-3 text-sm leading-relaxed ${descriptionClass}`}>{description}</p> : null}
        </div>
      ) : null}
      <div className={eyebrow || title || description ? 'mt-5' : ''}>{children}</div>
    </section>
  );
}
