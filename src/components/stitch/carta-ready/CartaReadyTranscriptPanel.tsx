"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { StitchCartaReadyViewData } from "@/lib/stitch/cartaReadyAdapter";

export interface CartaReadyTranscriptPanelProps {
  readonly data: Readonly<StitchCartaReadyViewData>;
  readonly maxHeightClass?: string;
  readonly utilityDock?: ReactNode;
}

function splitIdentityLine(identityLine: string) {
  return identityLine
    .split("·")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CartaReadyTranscriptPanel({
  data,
  maxHeightClass = "lg:max-h-[calc(100vh-20rem)]",
  utilityDock,
}: Readonly<CartaReadyTranscriptPanelProps>) {
  const [mode, setMode] = useState<"modernizada" | "literal">("modernizada");

  const paragraphs = useMemo(() => {
    return mode === "modernizada" ? data.modernizadaParagraphs : data.literalParagraphs;
  }, [data.literalParagraphs, data.modernizadaParagraphs, mode]);

  const identityItems = splitIdentityLine(data.documentIdentityLine);

  return (
    <article className="order-1 min-h-0 lg:order-2 lg:pl-5 xl:pl-6">
      <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-serif text-[1.9rem] font-semibold leading-[0.95] tracking-[-0.03em] text-[#221912] sm:text-[2.08rem]">
            Transcripcion
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.92rem] text-[#6b5a44]">
            <span className="rounded-full bg-[#ead4a0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#805c18] shadow-[inset_0_0_0_1px_rgba(181,136,52,0.18)]">
              {mode}
            </span>
            {identityItems.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? <span className="hidden opacity-35 sm:inline">•</span> : null}
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex w-full items-center rounded-full border border-[#d6cab2]/80 bg-white/78 p-1 text-[10px] font-bold uppercase tracking-[0.16em] shadow-[0_8px_18px_rgba(70,52,21,0.05)] sm:w-auto">
          {(["modernizada", "literal"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`flex-1 rounded-full px-4 py-2 transition-colors sm:flex-none ${
                mode === option ? "bg-[#c5a059] text-white shadow-sm" : "text-[#6f6453]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 rounded-[1rem] bg-[linear-gradient(180deg,#fbf7ee_0%,#f7f0e1_100%)] shadow-[inset_0_0_0_1px_rgba(214,194,157,0.65),0_18px_30px_rgba(88,64,21,0.04)]">
        <div className={`min-h-0 px-6 py-5 sm:px-7 sm:py-6 lg:h-full lg:overflow-y-auto lg:px-8 lg:py-7 ${maxHeightClass}`}>
          <div className="flex min-h-full flex-col font-serif text-[1.05rem] leading-[2.02rem] text-[#2c2c2a] sm:text-[1.1rem] sm:leading-[2.18rem] lg:text-[1.16rem] lg:leading-[2.3rem]">
            {paragraphs.length > 0 ? (
              <>
                <div>
                  {paragraphs.map((paragraph, index) => (
                    <p
                      key={`${mode}-${index}`}
                      className={`text-left ${index === 0 ? "mb-8 text-[1.12em] leading-[1.8] text-[#3a3127]" : "mb-7"}`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                {utilityDock ? <div className="mt-auto pt-8">{utilityDock}</div> : null}
              </>
            ) : (
              <div className="rounded border border-dashed border-[#d1cebd] bg-white/40 px-5 py-5 text-sm text-[#6f6453]">
                No hay contenido disponible en este modo de lectura para esta carta.
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
