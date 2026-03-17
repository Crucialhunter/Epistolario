"use client";

import Link from 'next/link';
import CartaReadyMetadataBand from '@/components/stitch/carta-ready/CartaReadyMetadataBand';
import { StitchCartaReadyViewData } from '@/lib/stitch/cartaReadyAdapter';

export type CartaWorkbenchPanel = 'ficha' | 'contexto' | 'relacionados';

export interface CartaReadyWorkbenchDrawerProps {
  readonly data: Readonly<StitchCartaReadyViewData>;
  readonly activePanel: CartaWorkbenchPanel | null;
  readonly embedded?: boolean;
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
    <div className="max-w-3xl">
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
  embedded = false,
}: Readonly<CartaReadyWorkbenchDrawerProps>) {
  if (!activePanel) {
    return null;
  }

  return (
    <section
      className={`overflow-hidden ${
        embedded
          ? 'rounded-[0.95rem] bg-transparent'
          : 'rounded-[1.4rem] border border-[#d7c8ab]/85 bg-[linear-gradient(180deg,rgba(251,247,239,0.98),rgba(244,236,222,0.96))] shadow-[0_24px_60px_rgba(52,38,16,0.16)]'
      }`}
    >
      <div className={`${embedded ? 'px-2 pb-2' : 'border-b border-[#dccfb6]/70 px-5 py-4 sm:px-6'}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {activePanel === 'ficha' ? (
            <PanelIntro
              eyebrow="Ficha documental"
              title="Datos de identificacion y localizacion"
              description="Consulta la ficha archivistica completa sin sacar el manuscrito ni la transcripcion del centro de la pantalla."
            />
          ) : null}

          {activePanel === 'contexto' ? (
            <PanelIntro
              eyebrow="Contexto"
              title="Claves documentales de lectura"
              description="Resumen de apoyo para situar el documento, sus temas y las entidades principales sin repetir la informacion ya visible en la entrada."
            />
          ) : null}

          {activePanel === 'relacionados' ? (
            <PanelIntro
              eyebrow="Relacionados"
              title="Otros documentos del mismo entorno epistolar"
              description="Accesos rapidos a cartas cercanas o asociadas, sin abandonar el modo de consulta de esta pieza."
            />
          ) : null}

          {!embedded ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">
              Capa contextual sobre la consulta
            </p>
          ) : null}
        </div>
      </div>

      <div className={`${embedded ? 'px-2 pb-2' : 'max-h-[min(56vh,680px)] overflow-y-auto px-5 py-5 sm:px-6'}`}>
        {activePanel === 'ficha' ? (
          <CartaReadyMetadataBand columns={data.metadataColumns} collapsible={false} />
        ) : null}

        {activePanel === 'contexto' ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <article className="rounded-[1.1rem] bg-white/58 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Resumen de consulta</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {data.documentaryContext.map((item) => (
                  <div key={item.label} className="rounded-[0.9rem] bg-[#f6efde] px-3 py-3 shadow-[inset_0_0_0_1px_rgba(216,204,183,0.45)]">
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
                        className="rounded-full bg-[#efe5cf] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6a5736] shadow-[inset_0_0_0_1px_rgba(216,204,183,0.5)]"
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

            <article className="rounded-[1.1rem] bg-[#fffaf2]/88 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(216,204,183,0.45)]">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Personas y lugares</h4>
              <div className="grid gap-3">
                {data.peopleAndPlaces.map((entity) => (
                  <div key={entity.name} className="flex items-center gap-3 rounded-[0.9rem] bg-white/65 px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(225,213,191,0.52)]">
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

              <div className="mt-4 rounded-[1rem] bg-[#f4eddd] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(225,213,191,0.5)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f7b53]">Nota destacada</p>
                <p className="mt-2 font-serif text-[1rem] italic leading-relaxed text-[#2c2c2a]">
                  El panel contextual queda preparado para profundizar en lectura documental sin desplazar ni el manuscrito ni la transcripcion principal.
                </p>
              </div>
            </article>
          </div>
        ) : null}

        {activePanel === 'relacionados' ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.relatedDocuments.length > 0 ? (
              data.relatedDocuments.map((document) => (
                <Link
                  key={document.href}
                  href={document.href}
                  className="group rounded-[1rem] bg-[#fbf7ef]/92 p-3 shadow-[inset_0_0_0_1px_rgba(216,204,183,0.55)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_rgba(197,160,89,0.8),0_14px_26px_rgba(67,49,20,0.08)]"
                >
                  <div className="mb-3 aspect-[4/5] overflow-hidden rounded-[0.8rem] bg-[#2a241e] shadow-[inset_0_0_0_1px_rgba(223,210,188,0.8)]">
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
              <div className="rounded-[1rem] bg-white/45 px-5 py-6 text-sm text-[#6f6453] shadow-[inset_0_0_0_1px_rgba(216,204,183,0.7)] sm:col-span-2 xl:col-span-4">
                No hay documentos relacionados suficientes para esta carta en la capa actual.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
