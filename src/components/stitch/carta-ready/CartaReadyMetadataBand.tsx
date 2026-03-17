import { CartaReadyMetadataColumn } from '@/lib/stitch/cartaReadyAdapter';

export interface CartaReadyMetadataBandProps {
  readonly columns: readonly CartaReadyMetadataColumn[];
  readonly collapsible?: boolean;
}

function summaryValue(columns: readonly CartaReadyMetadataColumn[], title: string, label: string) {
  return columns.find((column) => column.title === title)?.items.find((item) => item.label === label)?.value;
}

function MetadataColumns({ columns }: { readonly columns: readonly CartaReadyMetadataColumn[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {columns.map((column) => (
        <article
          key={column.title}
          className="rounded-[1rem] bg-[#f7f2e6]/92 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(216,204,183,0.55)]"
        >
          <h3 className="mb-2 border-b border-[#d1cebd]/55 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c5a059]">
            {column.title}
          </h3>
          <div className="space-y-2">
            {column.items.map((item) => (
              <div key={`${column.title}-${item.label}`} className="grid gap-0.5 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{item.label}</p>
                <p className="text-[0.92rem] font-semibold leading-snug text-[#2c2c2a]">{item.value}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function CartaReadyMetadataBand({
  columns,
  collapsible = true,
}: Readonly<CartaReadyMetadataBandProps>) {
  const fecha = summaryValue(columns, 'Identificación documental', 'Fecha de emisión');
  const remitente = summaryValue(columns, 'Correspondencia', 'Remitente');
  const lugar = summaryValue(columns, 'Localización y contexto archivístico', 'Lugar de origen');
  const summaryItems = [fecha, remitente, lugar].filter(Boolean);

  if (!collapsible) {
    return <MetadataColumns columns={columns} />;
  }

  return (
    <section className="rounded-[1.1rem] border border-[#d9ccb4]/70 bg-white/30 p-3 sm:p-4">
      <details className="group">
        <summary className="flex cursor-pointer list-none flex-col gap-2 rounded-[0.9rem] border border-[#d1cebd]/70 bg-[#fbf7ef]/86 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8f7b53]">Ficha documental</p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6b5d49]">
              {summaryItems.map((item) => (
                <span key={item} className="truncate">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53] group-open:hidden">
            Ver ficha
            <span aria-hidden="true">+</span>
          </span>
          <span className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53] group-open:inline-flex">
            Ocultar ficha
            <span aria-hidden="true">-</span>
          </span>
        </summary>

        <div className="mt-3">
          <MetadataColumns columns={columns} />
        </div>
      </details>
    </section>
  );
}
