"use client";

import Link from 'next/link';
import CartaReadyMetadataBand from '@/components/stitch/carta-ready/CartaReadyMetadataBand';
import { StitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';

export type CartaWorkbenchPanel = 'ficha' | 'contexto' | 'relacionados';

export interface CartaReadyWorkbenchDrawerProps {
  readonly data: Readonly<StitchCartaReadyViewData>;
  readonly activePanel: CartaWorkbenchPanel | null;
}

function PanelIntro({
  eyebrow,
  title,
  description,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className="mb-4 max-w-3xl">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a7a3d]">{eyebrow}</p>
      <h3 className="mt-2 font-serif text-[1.35rem] font-semibold leading-tight text-[#201c18] sm:text-[1.55rem]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6b5a44]">{description}</p>
    </div>
  );
}

export default function CartaReadyWorkbenchDrawer({
  data,
  activePanel,
}: Readonly<CartaReadyWorkbenchDrawerProps>) {
  if (!activePanel) {
    return null;
  }

  return (
    <section className="rounded-[1.15rem] border border-[#dccfb6]/70 bg-[#f7f2e8] p-4 shadow-[0_16px_34px_rgba(91,75,42,0.08)] sm:p-5">
      {activePanel === 'ficha' ? (
        <>
          <PanelIntro
            eyebrow="Ficha documental"
            title="Datos de identificación y localización"
            description="Consulta los metadatos archivísticos completos sin sacar el manuscrito ni la transcripción del centro de la pantalla."
          />
          <CartaReadyMetadataBand columns={data.metadataColumns} collapsible={false} />
        </>
      ) : null}

      {activePanel === 'contexto' ? (
        <>
          <PanelIntro
            eyebrow="Contexto"
            title="Claves documentales de lectura"
            description="Resumen de apoyo para situar el documento, sus temas y las entidades principales sin repetir la información ya visible en la entrada."
          />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <article className="rounded-[1rem] border border-[#d8ccb7]/75 bg-[#f7f2e6]/92 px-4 py-4">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Resumen de consulta</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {data.documentaryContext.map((item) => (
                  <div key={item.label} className="rounded-[0.85rem] border border-[#dfd2bc]/70 bg-white/55 px-3 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-[#2c2c2a]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Temas asociados</p>
                <div className="flex flex-wrap gap-2">
                  {data.thematicTags.length > 0 ? (
                    data.thematicTags.map((tag) => (
                      <span
                        key={tag.label}
                        className="rounded-full border border-[#d8ccb7]/75 bg-[#efe5cf] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6a5736]"
                      >
                        {tag.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#6f6453]">Sin temas destacados en esta capa.</span>
                  )}
                </div>
              </div>
            </article>

            <article className="rounded-[1rem] border border-[#d8ccb7]/75 bg-[#fffaf2]/90 px-4 py-4">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Personas y lugares</h4>
              <div className="grid gap-3">
                {data.peopleAndPlaces.map((entity) => (
                  <div key={entity.name} className="flex items-center gap-3 rounded-[0.9rem] border border-[#e1d5bf]/70 bg-white/55 px-3 py-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c5a059]/12 text-sm font-bold text-[#a38420]">
                      {entity.type === 'place' ? '•' : entity.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2c2c2a]">{entity.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f7b53]">{entity.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[0.9rem] border border-[#e1d5bf]/75 bg-[#f4eddd] px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Nota destacada</p>
                <p className="mt-2 font-serif text-[1rem] italic leading-relaxed text-[#2c2c2a]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.
                </p>
              </div>
            </article>
          </div>
        </>
      ) : null}

      {activePanel === 'relacionados' ? (
        <>
          <PanelIntro
            eyebrow="Relacionados"
            title="Otros documentos del mismo entorno epistolar"
            description="Accesos rápidos a cartas cercanas o asociadas, sin abandonar el modo de consulta de esta pieza."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.relatedDocuments.length > 0 ? (
              data.relatedDocuments.map((document) => (
                <Link
                  key={document.href}
                  href={document.href}
                  className="group rounded-[1rem] border border-[#d8ccb7]/75 bg-[#fbf7ef]/92 p-3 transition-colors hover:border-[#c5a059]"
                >
                  <div className="mb-3 aspect-[4/5] overflow-hidden rounded-[0.8rem] border border-[#dfd2bc]/80 bg-[#2a241e]">
                    {document.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={document.imageUrl} alt={document.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#f5f2e8] p-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">
                        Sin imagen local
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#2c2c2a] group-hover:text-[#a38420]">{document.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#8f7b53]">{document.meta}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-[1rem] border border-dashed border-[#d8ccb7]/85 bg-white/45 px-5 py-6 text-sm text-[#6f6453] sm:col-span-2 xl:col-span-4">
                No hay documentos relacionados suficientes para esta carta en la capa actual.
              </div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
