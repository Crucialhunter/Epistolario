interface AvailabilityBadgeProps {
  corpusBase: boolean;
  imageEnhanced: boolean;
  curatorial: boolean;
}

export default function AvailabilityBadge({ corpusBase, imageEnhanced, curatorial }: AvailabilityBadgeProps) {
  const items = [
    { label: 'CorpusBase', active: corpusBase },
    { label: 'ImageEnhanced', active: imageEnhanced },
    { label: 'Curatorial', active: curatorial },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${item.active ? 'border-[#d8c89e] bg-[#f7f1e6] text-[#8f7742]' : 'border-[#ece4d5] bg-[#fcfbf8] text-[#b6aa94]'}`}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}
