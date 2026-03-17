import CuratorialPanel from '@/components/legajo/curatorial/CuratorialPanel';

export default function CuratorialReadingLinesModule({ lines }: { lines: string[] }) {
  return (
    <CuratorialPanel
      eyebrow="Lineas de lectura"
      title="Como entrar en el legajo"
      description="Pistas editoriales para orientar la lectura antes de que llegue la capa final de curaduria."
    >
      <div className="grid gap-3">
        {lines.map((line, index) => (
          <div key={`${index}-${line}`} className="rounded-[1rem] border border-[#d1cebd]/75 bg-white/55 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8f7b53]">Linea {index + 1}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#2c2c2a]">{line}</p>
          </div>
        ))}
      </div>
    </CuratorialPanel>
  );
}
