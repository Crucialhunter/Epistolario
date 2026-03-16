import Link from 'next/link';
import { StitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';

export interface CartaReadyResearchLayerProps {
  readonly data: Readonly<StitchCartaReadyViewData>;
}

export default function CartaReadyResearchLayer({ data }: Readonly<CartaReadyResearchLayerProps>) {
  return (
    <section className="mx-8 mb-20 rounded border border-[#d1cebd]/60 bg-white/40 p-12">
      <div className="mb-12 flex items-center justify-between border-b border-[#d1cebd] pb-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2c2c2a]">Contexto e investigacion</h2>
        <div className="flex gap-2">
          <span className="h-2 w-2 rounded-full bg-[#c5a059]" />
          <span className="h-2 w-2 rounded-full bg-[#c5a059]/40" />
          <span className="h-2 w-2 rounded-full bg-[#c5a059]/20" />
        </div>
      </div>

      <div className="grid gap-16 lg:grid-cols-3">
        <article>
          <h3 className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
            <span className="h-px w-4 bg-[#c5a059]" />
            Contexto documental
          </h3>
          <div className="space-y-6">
            {data.documentaryContext.map((item) => (
              <div key={item.label} className="border-b border-[#d1cebd]/50 pb-4 last:border-b-0">
                <p className="mb-1 text-[9px] font-bold uppercase text-gray-400">{item.label}</p>
                <p className="text-sm font-semibold text-[#2c2c2a]">{item.value}</p>
              </div>
            ))}
            <div>
              <p className="mb-3 text-[9px] font-bold uppercase text-gray-400">Descriptores tematicos</p>
              <div className="flex flex-wrap gap-2">
                {data.thematicTags.length > 0 ? (
                  data.thematicTags.map((tag) => (
                    <span
                      key={tag.label}
                      className="rounded-sm border border-[#d1cebd] bg-[#ece7d9] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#514a3f]"
                    >
                      {tag.label}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#6f6453]">Sin temas destacados en esta carta.</span>
                )}
              </div>
            </div>
          </div>
        </article>

        <article className="flex flex-col">
          <h3 className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
            <span className="h-px w-4 bg-[#c5a059]" />
            Personas y lugares
          </h3>
          <div className="mb-10 space-y-4">
            {data.peopleAndPlaces.map((entity) => (
              <div key={entity.name} className="flex items-center gap-4 rounded p-2 transition-colors hover:bg-[#c5a059]/5">
                {entity.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entity.imageUrl} alt={entity.name} className="h-10 w-10 rounded-full object-cover ring-1 ring-[#d1cebd]" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c5a059]/10 text-[#c5a059]">
                    {entity.type === 'place' ? '•' : entity.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-800">{entity.name}</p>
                  <p className="text-[10px] uppercase text-gray-500">{entity.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-auto overflow-hidden rounded border-t-4 border-[#c5a059] bg-zinc-900 p-8 text-[#f5f2e8]">
            <p className="mb-4 font-serif text-sm italic leading-relaxed">{data.featuredQuote}</p>
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#c5a059]">Cita destacada</p>
              <p className="text-[9px] text-zinc-500">{data.featuredQuoteMeta}</p>
            </div>
          </div>
        </article>

        <article>
          <h3 className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
            <span className="h-px w-4 bg-[#c5a059]" />
            Documentos relacionados
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {data.relatedDocuments.length > 0 ? (
              data.relatedDocuments.map((document) => (
                <Link key={document.href} href={document.href} className="group cursor-pointer">
                  <div className="mb-3 aspect-[3/4] bg-[#2a241e] p-1.5 shadow-md transition-transform group-hover:-translate-y-1">
                    {document.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={document.imageUrl} alt={document.title} className="h-full w-full object-cover sepia-[0.3] brightness-95" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#f5f2e8] p-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">
                        Sin imagen local
                      </div>
                    )}
                  </div>
                  <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-800 transition-colors group-hover:text-[#c5a059]">
                    {document.title}
                  </p>
                  <p className="text-[9px] font-medium uppercase text-gray-400">{document.meta}</p>
                </Link>
              ))
            ) : (
              <div className="col-span-2 rounded border border-dashed border-[#d1cebd] bg-white/40 px-5 py-5 text-sm text-[#6f6453]">
                No hay documentos relacionados suficientes para esta carta en la capa actual.
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
