import { CartaDetail } from '@/lib/types';

export default function EvidenceBlock({ carta }: { carta: CartaDetail }) {
  const quote = carta.transcripcion.modernizada.split('\n').map((paragraph) => paragraph.trim()).find(Boolean) || 'Bloque preparado para resaltar evidencia documental o cita editorial en futuras iteraciones.';

  return (
    <section className="rounded-[1.5rem] border border-[#e2d6bf] bg-[#f7f1e6]/75 px-5 py-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Evidencia destacada</p>
      <blockquote className="reader-display mt-4 text-xl leading-relaxed text-[#221c13]">
        “{quote.slice(0, 220)}{quote.length > 220 ? '…' : ''}”
      </blockquote>
      <p className="mt-4 text-sm leading-relaxed text-[#6a5d47]">
        Region lista para evolucionar hacia citas curatoriales, evidencia enlazada y narrativa documental.
      </p>
    </section>
  );
}
