import Link from 'next/link';
import { CartaDetail } from '@/lib/types';
import { LegajoCorpusVM } from '@/lib/view-models';

interface LetterPreviewPaneProps {
  legajo: LegajoCorpusVM;
  preview: CartaDetail | null;
}

export default function LetterPreviewPane({ legajo, preview }: LetterPreviewPaneProps) {
  if (!preview) {
    return (
      <aside className="rounded-[1.5rem] border border-dashed border-[#d8c89e] bg-[#f7f1e6]/70 p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Preview documental</p>
        <h3 className="reader-display mt-4 text-2xl font-semibold text-[#221c13]">Sin carta seleccionada</h3>
        <p className="mt-3 text-sm leading-relaxed text-[#6a5d47]">El panel lateral esta preparado para mostrar resumen, metadatos y manuscrito local cuando corresponda.</p>
      </aside>
    );
  }

  const hasVisualLayer = legajo.availability.imageEnhanced && preview.hasImages && preview.primaryImage;
  const teaserText = preview.transcripcion.modernizada.split('\n').filter(Boolean).slice(0, 1).join(' ');

  return (
    <aside className="overflow-hidden rounded-[1.5rem] border border-[#e2d6bf] bg-white shadow-sm">
      <div className="border-b border-[#efe5d3] px-6 py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Preview lateral</p>
        <h3 className="reader-display mt-3 text-2xl font-semibold text-[#221c13]">{preview.nombre_carta || `Carta ${preview.id_carta}`}</h3>
        <p className="mt-2 text-sm text-[#6a5d47]">{preview.remitente || 'Remitente no identificado'} / {preview.destinatario || 'Destinatario no identificado'}</p>
      </div>

      {hasVisualLayer ? (
        <div className="border-b border-[#efe5d3] bg-[#221c13] p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.primaryImage ?? ''} alt={`Preview de ${preview.id_carta}`} className="h-[280px] w-full rounded-[1.1rem] object-contain" />
        </div>
      ) : null}

      <div className="grid gap-4 px-6 py-5 text-sm text-[#6a5d47]">
        <div className="grid gap-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Fecha y lugar</span>
          <p>{preview.fecha || 'Sin fecha'}{preview.lugar ? ` / ${preview.lugar}` : ''}</p>
        </div>
        <div className="grid gap-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Lectura de entrada</span>
          <p className="line-clamp-5 leading-relaxed">{teaserText || 'El corpus base ya permite lectura textual completa y navegacion entre cartas.'}</p>
        </div>
        <Link href={`/legajos/${legajo.id}/cartas/${preview.id_carta}`} className="inline-flex w-fit rounded-full border border-[#d8c89e] bg-[#f7f1e6] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f7742] transition-colors hover:border-[#c5a028] hover:text-[#a38420]">
          Abrir lector completo
        </Link>
      </div>
    </aside>
  );
}
