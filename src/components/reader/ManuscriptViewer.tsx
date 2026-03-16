"use client";

import { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface ManuscriptViewerProps {
  src: string;
  alt: string;
}

function Controls({
  onToggleFullscreen,
  isFullscreen,
}: {
  readonly onToggleFullscreen: () => void;
  readonly isFullscreen: boolean;
}) {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute right-3 top-3 z-50 flex items-stretch overflow-hidden rounded-2xl border border-[#8c8571]/60 bg-[#181510]/88 shadow-2xl backdrop-blur-md">
      <button
        onClick={() => zoomOut(0.25)}
        className="border-r border-[#5a5545] px-3 py-3 text-[#e7e1cf] transition-colors hover:bg-black/30 hover:text-[#c5a028]"
        title="Alejar"
        aria-label="Alejar manuscrito"
      >
        <ZoomOut size={17} />
      </button>

      <button
        onClick={() => resetTransform()}
        className="border-r border-[#5a5545] px-3 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e7e1cf] transition-colors hover:bg-black/30 hover:text-[#c5a028]"
        title="Ajustar a pantalla"
        aria-label="Ajustar manuscrito a pantalla"
      >
        Ajustar
      </button>

      <button
        onClick={() => zoomIn(0.25)}
        className="border-r border-[#5a5545] px-3 py-3 text-[#e7e1cf] transition-colors hover:bg-black/30 hover:text-[#c5a028]"
        title="Acercar"
        aria-label="Acercar manuscrito"
      >
        <ZoomIn size={17} />
      </button>

      <button
        onClick={onToggleFullscreen}
        className="px-3 py-3 text-[#e7e1cf] transition-colors hover:bg-black/30 hover:text-[#c5a028]"
        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver manuscrito a pantalla completa'}
      >
        {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
      </button>
    </div>
  );
}

export default function ManuscriptViewer({ src, alt }: ManuscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await containerRef.current.requestFullscreen();
  };

  if (!src) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#2d2a26] p-8 text-center text-[#e7e1cf]/55">
        <RotateCcw size={48} className="mb-4 opacity-20" />
        <p className="font-serif italic">Manuscrito no disponible u omitido</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[#181510] group">
      <TransformWrapper
        initialScale={0.92}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        centerZoomedOut
        wheel={{ step: 0.1 }}
        alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
      >
        {() => (
          <>
            <div className="absolute left-3 top-3 z-40 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#e7e1cf] backdrop-blur">
              Manuscrito
            </div>
            <div className="absolute bottom-3 left-3 z-40 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#e7e1cf] backdrop-blur">
              {isFullscreen ? 'Pantalla completa' : 'Visor activo'}
            </div>
            <div className="flex h-full w-full items-center justify-center cursor-grab active:cursor-grabbing">
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center p-4 sm:p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  draggable={false}
                  className="max-h-full max-w-full rounded-[0.3rem] object-contain shadow-[0_14px_30px_rgba(0,0,0,0.34)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                    (e.target as HTMLImageElement).parentElement?.classList.add("broken-image-fallback");
                  }}
                />
              </TransformComponent>
            </div>
            <Controls onToggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen} />
          </>
        )}
      </TransformWrapper>

      <style
        dangerouslySetInnerHTML={{
          __html: `
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
          `,
        }}
      />
    </div>
  );
}
