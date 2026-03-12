"use client";

import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ManuscriptViewerProps {
  src: string;
  alt: string;
}

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute bottom-3 right-3 md:top-5 md:left-5 md:right-auto md:bottom-auto flex items-stretch bg-[#1b180d]/70 md:bg-[#1b180d]/92 border border-white/10 md:border-[#8c8571] shadow-2xl z-50 rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-md">
      <button
        onClick={() => zoomOut(0.25)}
        className="p-2.5 md:p-3.5 text-[#e7e1cf] hover:text-[#c5a028] hover:bg-black/40 transition-colors border-r border-white/10 md:border-[#5a5545]"
        title="Alejar"
        aria-label="Alejar manuscrito"
      >
        <ZoomOut size={18} className="md:w-5 md:h-5" />
      </button>

      <button
        onClick={() => resetTransform()}
        className="px-3 py-2.5 md:px-4 md:py-3.5 text-[#e7e1cf] hover:text-[#c5a028] hover:bg-black/40 transition-colors border-r border-white/10 md:border-[#5a5545] font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] flex items-center"
        title="Ajustar a pantalla"
        aria-label="Ajustar manuscrito a pantalla"
      >
        Ajustar
      </button>

      <button
        onClick={() => zoomIn(0.25)}
        className="p-2.5 md:p-3.5 text-[#e7e1cf] hover:text-[#c5a028] hover:bg-black/40 transition-colors"
        title="Acercar"
        aria-label="Acercar manuscrito"
      >
        <ZoomIn size={18} className="md:w-5 md:h-5" />
      </button>
    </div>
  );
};

export default function ManuscriptViewer({ src, alt }: ManuscriptViewerProps) {
  if (!src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-[#e7e1cf]/50 p-8 text-center bg-[#2d2a26]">
        <RotateCcw size={48} className="mb-4 opacity-20" />
        <p className="font-serif italic">Manuscrito no disponible u omitido</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#1b180d] overflow-hidden group">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
      >
        {() => (
          <>
            <div className="absolute left-3 top-3 md:hidden z-40 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#e7e1cf] backdrop-blur">
              Manuscrito
            </div>
            <div className="absolute left-5 top-5 hidden md:block z-40 rounded-full border border-[#8c8571] bg-[#1b180d]/92 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#e7e1cf] shadow-xl">
              Visor de manuscrito
            </div>
            <div className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  draggable={false}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    (e.target as HTMLImageElement).parentElement?.classList.add('broken-image-fallback');
                  }}
                />
              </TransformComponent>
            </div>
            <Controls />
          </>
        )}
      </TransformWrapper>

      <style dangerouslySetInnerHTML={{ __html: `
        .broken-image-fallback {
            background: #2d2a26;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255,255,255,0.3);
            font-family: serif;
        }
        .broken-image-fallback::after {
            content: "Imagen no encontrada";
        }
      ` }} />
    </div>
  );
}

