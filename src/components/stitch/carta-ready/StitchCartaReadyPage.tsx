import Link from 'next/link';
import CartaReadyReaderSplit from '@/components/stitch/carta-ready/CartaReadyReaderSplit';
import AppHeader from '@/components/navigation/AppHeader';
import { buildAppHeaderNav } from '@/components/navigation/appHeaderNav';
import { StitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';

export interface StitchCartaReadyPageProps {
  readonly data: Readonly<StitchCartaReadyViewData>;
  readonly alternateViewHref?: string;
  readonly alternateViewLabel?: string;
}

function findValue(
  columns: readonly StitchCartaReadyViewData['metadataColumns'][number][],
  title: string,
  label: string
) {
  return columns.find((column) => column.title === title)?.items.find((item) => item.label === label)?.value;
}

export default function StitchCartaReadyPage({
  data,
  alternateViewHref,
  alternateViewLabel = 'Ver UI Lab',
}: Readonly<StitchCartaReadyPageProps>) {
  const signatura = findValue(data.metadataColumns, 'Identificación documental', 'Signatura');
  const fecha = findValue(data.metadataColumns, 'Identificación documental', 'Fecha de emisión');
  const lugar = findValue(data.metadataColumns, 'Localización y contexto archivístico', 'Lugar de origen');
  const remitente = findValue(data.metadataColumns, 'Correspondencia', 'Remitente');
  const destinatario = findValue(data.metadataColumns, 'Correspondencia', 'Destinatario');
  const soporte = findValue(data.metadataColumns, 'Identificación documental', 'Soporte');
  const backHref = data.breadcrumbs[2] ? `../..` : '/legajos';
  const breadcrumbItems = data.breadcrumbs.slice(0, -1);
  const metaItems = [
    signatura ? { label: 'Signatura', value: signatura, tone: 'document' as const } : null,
    fecha ? { label: 'Fecha', value: fecha, tone: 'document' as const } : null,
    lugar ? { label: 'Origen', value: lugar, tone: 'document' as const } : null,
    remitente ? { label: 'Remite', value: remitente, tone: 'people' as const } : null,
    destinatario ? { label: 'Recibe', value: destinatario, tone: 'people' as const } : null,
  ].filter(Boolean) as { label: string; value: string; tone: 'document' | 'people' | 'status' }[];
  const accessBadge = soporte ? { label: 'Acceso', value: soporte } : null;

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#d8cfbc_0%,#cec4af_52%,#c4b9a3_100%)] font-sans text-[#333]">
      <div className="mx-auto flex h-screen max-w-[min(100vw-4px,1920px)] flex-col bg-[linear-gradient(180deg,#f4eee2_0%,#ece2ce_100%)] shadow-[0_24px_54px_rgba(47,34,14,0.14)]">
        <AppHeader brand="ARCA" navItems={buildAppHeaderNav('legajos')} badge="Archivo digital" contextMode="none" />

        <div className="min-h-0 flex-1 overflow-hidden px-0.5 pb-0.5 pt-0.5 sm:px-1 sm:pb-1 lg:px-1.5 lg:pb-1.5">
          <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[0.95rem] bg-[linear-gradient(180deg,#f7f1e6_0%,#ece1cc_100%)] shadow-[0_14px_30px_rgba(91,75,42,0.05)]">
            <div className="border-b border-[#d7c8ad]/72 bg-[linear-gradient(180deg,rgba(249,243,232,0.92),rgba(243,236,224,0.82))] px-4 py-2.5 sm:px-5 lg:px-6">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-[#8c806d]">
                    {breadcrumbItems.map((crumb, index) => (
                      <span key={`${crumb}-${index}`} className="inline-flex items-center gap-2">
                        <span>{crumb}</span>
                        {index < breadcrumbItems.length - 1 ? <span className="opacity-35">/</span> : null}
                      </span>
                    ))}
                    <span className="rounded-full bg-[#ebd9ae] px-2 py-0.5 font-bold text-[#8d6820] shadow-[inset_0_0_0_1px_rgba(181,136,52,0.2)]">Consulta</span>
                  </div>

                  <h1 className="mt-2 max-w-5xl font-serif text-[1.45rem] font-semibold leading-[0.95] tracking-[-0.035em] text-[#1d1711] sm:text-[1.75rem] lg:text-[2.05rem]">
                    {data.title}
                  </h1>
                  <div className="mt-2 h-px w-24 bg-[linear-gradient(90deg,#c5a059_0%,rgba(197,160,89,0.15)_100%)]" />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {metaItems.map((item) => (
                      <div
                        key={`${item.label}-${item.value}`}
                        className={`rounded-full px-3 py-1.5 shadow-[inset_0_0_0_1px_rgba(216,204,183,0.55)] ${
                          item.tone === 'document'
                            ? 'bg-[#f6efe1]'
                            : item.tone === 'people'
                              ? 'bg-[#fbf7ef]'
                              : 'bg-[#efe2c5] shadow-[inset_0_0_0_1px_rgba(197,160,89,0.32)]'
                        }`}
                      >
                        <span className={`mr-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${
                          item.tone === 'status' ? 'text-[#876114]' : 'text-[#97856b]'
                        }`}>{item.label}</span>
                        <span className={`text-[0.92rem] font-semibold leading-none ${
                          item.tone === 'status' ? 'text-[#594016]' : 'text-[#2d2923]'
                        }`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {accessBadge ? (
                    <div className="mt-2">
                      <span className="inline-flex rounded-full bg-[#efe2c5] px-3 py-1.5 shadow-[inset_0_0_0_1px_rgba(197,160,89,0.32)]">
                        <span className="mr-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#876114]">{accessBadge.label}</span>
                        <span className="text-[0.92rem] font-semibold leading-none text-[#594016]">{accessBadge.value}</span>
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Link
                    href={backHref}
                    className="rounded-full border border-[#d1cebd] bg-white/60 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
                  >
                    Volver al legajo
                  </Link>
                  {alternateViewHref ? (
                    <Link
                      href={alternateViewHref}
                      className="rounded-full border border-[#d1cebd] bg-[#f5f2e8] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
                    >
                      {alternateViewLabel}
                    </Link>
                  ) : null}
                  {data.sourceHref ? (
                    <a
                      href={data.sourceHref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[#d1cebd] bg-[#f5f2e8] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
                    >
                      Ver fuente
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden bg-[linear-gradient(to_right,#f4ecdf_0%,#ede3d0_46%,#e4d8c2_100%)]">
              <CartaReadyReaderSplit data={data} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
