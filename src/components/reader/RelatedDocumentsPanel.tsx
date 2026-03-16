import Link from 'next/link';
import { CartaSummary } from '@/lib/types';

export default function RelatedDocumentsPanel({ relatedDocuments, legajoId }: { relatedDocuments: CartaSummary[]; legajoId: string }) {
  return (
    <section className="rounded-[1.5rem] border border-[#e2d6bf] bg-white px-5 py-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7742]">Documentos relacionados</p>
      <div className="mt-4 grid gap-3">
        {relatedDocuments.length > 0 ? relatedDocuments.map((document) => (
          <Link key={document.id_carta} href={`/legajos/${legajoId}/cartas/${document.id_carta}`} className="rounded-[1.1rem] border border-[#efe5d3] bg-[#fcfbf8] px-4 py-4 text-sm text-[#6a5d47] transition-colors hover:border-[#d8c89e] hover:bg-white">
            <p className="reader-display text-lg font-semibold text-[#221c13]">Carta {document.id_carta}</p>
            <p className="mt-2 leading-relaxed">{document.remitente || 'Remitente no identificado'} / {document.destinatario || 'Destinatario no identificado'}</p>
          </Link>
        )) : (
          <div className="rounded-[1.1rem] border border-dashed border-[#d8c89e] bg-[#f7f1e6]/70 px-4 py-5 text-sm leading-relaxed text-[#6a5d47]">
            El panel queda preparado para documentos relacionados aunque aun no haya suficientes vinculos calculados.
          </div>
        )}
      </div>
    </section>
  );
}
