import { CartaDetail, CartaSummary } from '@/lib/types';
import { LegajoCorpusVM } from '@/lib/view-models';
import Breadcrumbs, { BreadcrumbItem } from '@/components/navigation/Breadcrumbs';
import ManuscriptViewer from '@/components/reader/ManuscriptViewer';
import ReaderMetaCard from '@/components/reader/ReaderMetaCard';
import ReaderModeToggle from '@/components/reader/ReaderModeToggle';
import ReaderContextSection from '@/components/reader/ReaderContextSection';
import RelatedDocumentsPanel from '@/components/reader/RelatedDocumentsPanel';
import EvidenceBlock from '@/components/reader/EvidenceBlock';

interface ReaderShellProps {
  legajo: LegajoCorpusVM;
  carta: CartaDetail;
  relatedDocuments: CartaSummary[];
  breadcrumbs: BreadcrumbItem[];
}

export default function ReaderShell({ legajo, carta, relatedDocuments, breadcrumbs }: ReaderShellProps) {
  const hasVisualLayer = legajo.availability.imageEnhanced && carta.hasImages && carta.primaryImage;
  const title = carta.nombre_carta || `Carta ${carta.id_carta}`;
  const subtitle = carta.resumen || 'Lectura documental preparada para integrar evidencias, conexiones y capas curatoriales futuras.';
  const themes = carta.temas.split(',').map((tema) => tema.trim()).filter(Boolean);

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-8 md:px-10 lg:px-16">
      <Breadcrumbs items={breadcrumbs} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <section className="overflow-hidden rounded-[1.75rem] border border-[#ddd1b6] bg-[#221c13] min-h-[320px] xl:min-h-[720px]">
          <ManuscriptViewer
            src={hasVisualLayer ? carta.primaryImage ?? '' : ''}
            alt={`Manuscrito asociado a ${title}`}
          />
        </section>

        <section className="reader-panel overflow-hidden rounded-[1.75rem] border border-[#e2d6bf]">
          <div className="reader-header-surface border-b border-[#e7dcc6] px-6 py-6 md:px-8 lg:px-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a38420]">Lector documental</p>
            <h1 className="reader-display mt-3 text-3xl font-semibold text-[#221c13] md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#6a5d47] md:text-base">{subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#6a5d47]">
              <span>{carta.remitente || 'Remitente no identificado'}</span>
              <span className="text-[#c9b996]">/</span>
              <span>{carta.destinatario || 'Destinatario no identificado'}</span>
              <span className="text-[#c9b996]">/</span>
              <span>{carta.fecha || 'Fecha no especificada'}</span>
              {carta.lugar ? (
                <>
                  <span className="text-[#c9b996]">/</span>
                  <span>{carta.lugar}</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:px-8 lg:px-10">
            <ReaderMetaCard legajo={legajo} carta={carta} themes={themes} hasVisualLayer={Boolean(hasVisualLayer)} />
            <ReaderModeToggle carta={carta} />
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ReaderContextSection carta={carta} legajo={legajo} />
        <div className="grid gap-6">
          <RelatedDocumentsPanel relatedDocuments={relatedDocuments} legajoId={legajo.id} />
          <EvidenceBlock carta={carta} />
        </div>
      </div>
    </div>
  );
}
