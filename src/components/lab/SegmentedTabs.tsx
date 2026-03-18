'use client';

export interface SegmentedTabItem {
  value: string;
  label: string;
}

export interface SegmentedTabsProps {
  items: readonly SegmentedTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export default function SegmentedTabs({
  items,
  value,
  onValueChange,
  className = '',
}: Readonly<SegmentedTabsProps>) {
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 rounded-full border border-[#cabd9f] bg-[linear-gradient(180deg,rgba(249,245,236,0.94),rgba(239,230,213,0.92))] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_14px_30px_rgba(42,34,23,0.08)] ${className}`}
    >
      {items.map((item) => {
        const active = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onValueChange(item.value)}
            className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
              active
                ? 'bg-[linear-gradient(180deg,#2d251e_0%,#201a15_100%)] text-[#f3e8d3] shadow-[0_10px_24px_rgba(31,24,18,0.18)]'
                : 'text-[#746652] hover:text-[#2a241c]'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
