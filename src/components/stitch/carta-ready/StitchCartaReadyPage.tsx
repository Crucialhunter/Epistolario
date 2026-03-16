import Link from 'next/link';
import CartaReadyReaderSplit from '@/components/stitch/carta-ready/CartaReadyReaderSplit';
import UnifiedTopHeader from '@/components/stitch/shared/UnifiedTopHeader';
import { StitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';

export interface StitchCartaReadyPageProps {
  readonly data: Readonly<StitchCartaReadyViewData>;
}

function findValue(
  columns: readonly StitchCartaReadyViewData['metadataColumns'][number][],
  title: string,
  label: string
) {
  return columns.find((column) => column.title === title)?.items.find((item) => item.label === label)?.value;
}

export default function StitchCartaReadyPage({ data }: Readonly<StitchCartaReadyPageProps>) {
  const signatura = findValue(data.metadataColumns, 'Identificación documental', 'Signatura');
  const fecha = findValue(data.metadataColumns, 'Identificación documental', 'Fecha de emisión');
  const lugar = findValue(data.metadataColumns, 'Localización y contexto archivístico', 'Lugar de origen');
  const documentLabel = [data.breadcrumbs[2], data.breadcrumbs[3]].filter(Boolean).join(' · ');
  const titleMeta = [signatura, fecha, lugar].filter(Boolean).join(' · ');
  const backHref = data.breadcrumbs[2] ? `../..` : '/legajos';

  return (
    <div className="min-h-screen bg-[#e2ddd0] font-sans text-[#333]">
      <div className="mx-auto min-h-screen max-w-[1400px] bg-[#f5f2e8] shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <UnifiedTopHeader
          brand="ARCA"
          navItems={[
            { label: 'Archivo', href: '/legajos', active: true },
            { label: 'Legajos', href: '/legajos' },
            { label: 'Recorridos', href: '/legajos/10/recorridos' },
            { label: 'Relatos', href: '/legajos/10/relatos' },
            { label: 'Sobre el proyecto', href: '/' },
          ]}
          badge="Archivo digital"
          contextEyebrow=""
          contextTitle=""
          contextMode="none"
        />

        <nav className="flex flex-wrap items-center gap-2 border-b border-[#d1cebd]/40 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-gray-500 sm:px-6 lg:px-12">
          {data.breadcrumbs.map((crumb, index) => (
            <div key={crumb} className="flex items-center gap-3">
              <span className={index === data.breadcrumbs.length - 1 ? 'font-black text-[#c5a059]' : ''}>{crumb}</span>
              {index < data.breadcrumbs.length - 1 ? <span className="opacity-30">/</span> : null}
            </div>
          ))}
        </nav>

        <section className="mx-auto max-w-[1280px] px-4 pb-3 pt-3 sm:px-6 lg:px-12">
          <div className="grid gap-4 border-b border-[#d8cfbd]/70 pb-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a7a3d]">{documentLabel}</p>
              <h1 className="mt-2 max-w-4xl font-serif text-[1.82rem] font-semibold leading-[1.02] tracking-[-0.025em] text-[#201c18] sm:text-[2.08rem] lg:text-[2.4rem]">
                {data.title}
              </h1>
              {titleMeta ? <p className="mt-3 text-[1rem] leading-relaxed text-[#6b5a44]">{titleMeta}</p> : null}
            </div>

            <div className="flex flex-wrap items-start gap-3 lg:justify-end">
              <Link
                href={backHref}
                className="rounded-full border border-[#d1cebd] bg-white/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
              >
                Volver al legajo
              </Link>
              {data.sourceHref ? (
                <a
                  href={data.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#d1cebd] bg-[#f5f2e8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6f6453] transition-colors hover:border-[#c5a059] hover:text-[#a38420]"
                >
                  Ver fuente
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <div className="bg-[linear-gradient(to_right,#F5F2E8_0%,#EFEBE0_50%,#F1E9D0_100%)]">
          <CartaReadyReaderSplit data={data} />
        </div>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-[#d1cebd]/40 bg-white/20 px-6 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 md:flex-row md:px-12">
          <p>MMXXIV Archivo General de Indias · Digitalización de patrimonio nacional</p>
          <div className="flex flex-wrap gap-8">
            <span>Política de privacidad</span>
            <span>Términos de acceso</span>
            <span>Créditos de investigación</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
