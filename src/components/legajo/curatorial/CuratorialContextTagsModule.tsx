import { CuratorialTagItem } from '@/lib/curatorial/legajoCuratorial';
import CuratorialPanel from '@/components/legajo/curatorial/CuratorialPanel';

const TONE_CLASSES: Record<CuratorialTagItem['tone'], string> = {
  persona: 'border-[#d8ccb7]/75 bg-[#f7f2e6]/92 text-[#2c2c2a]',
  lugar: 'border-[#d1cebd]/75 bg-[#ede9de]/92 text-[#2c2c2a]',
  tema: 'border-[#d1cebd]/75 bg-white/60 text-[#2c2c2a]',
};

export default function CuratorialContextTagsModule({ items }: { items: CuratorialTagItem[] }) {
  return (
    <CuratorialPanel
      eyebrow="Nodos"
      title="Personas, lugares y temas dominantes"
      description="Capa de contexto para que el recorrido no dependa todavia del mapa ni de visualizaciones finales."
    >
      <div className="grid gap-3">
        {items.map((item) => (
          <article key={`${item.tone}-${item.label}`} className={`rounded-[1.1rem] border px-4 py-4 ${TONE_CLASSES[item.tone]}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif text-[1.2rem] font-semibold leading-tight">{item.label}</h3>
              <span className="rounded-full border border-current/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] opacity-75">{item.tone}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5a44]">{item.detail}</p>
          </article>
        ))}
      </div>
    </CuratorialPanel>
  );
}
