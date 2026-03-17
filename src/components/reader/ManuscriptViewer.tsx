"use client";

import type { ReactNode, WheelEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";
import { Eye, Maximize2, Minimize2, Search, SlidersHorizontal, Sparkles, ZoomIn, ZoomOut } from "lucide-react";

interface ManuscriptViewerProps {
  src: string;
  alt: string;
  transcriptHidden?: boolean;
  onToggleTranscript?: () => void;
}

function Controls() {
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
        className="px-3 py-3 text-[#e7e1cf] transition-colors hover:bg-black/30 hover:text-[#c5a028]"
        title="Acercar"
        aria-label="Acercar manuscrito"
      >
        <ZoomIn size={17} />
      </button>
    </div>
  );
}

function UtilityButton({
  active = false,
  onClick,
  children,
}: {
  readonly active?: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
        active ? "bg-[#ead4a0] text-[#5b4213]" : "bg-white/8 text-[#e7e1cf] hover:bg-white/14"
      }`}
    >
      {children}
    </button>
  );
}

export default function ManuscriptViewer({
  src,
  alt,
  transcriptHidden = false,
  onToggleTranscript,
}: ManuscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [magnifierEnabled, setMagnifierEnabled] = useState(false);
  const [activeUtilityPanel, setActiveUtilityPanel] = useState<"magnifier" | "contrast" | null>(null);
  const [contrastValue, setContrastValue] = useState(108);
  const [invertEnabled, setInvertEnabled] = useState(false);
  const [showLens, setShowLens] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [backgroundPosition, setBackgroundPosition] = useState("50% 50%");
  const [magnifierZoom, setMagnifierZoom] = useState(3);

  const imageFilter = useMemo(() => {
    const invertFilter = invertEnabled ? " invert(1) hue-rotate(180deg)" : "";
    return `contrast(${contrastValue / 100}) brightness(1.03) saturate(0.96) sepia(0.08)${invertFilter}`;
  }, [contrastValue, invertEnabled]);

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

  const updateLens = (clientX: number, clientY: number) => {
    if (!imageRef.current || !containerRef.current) {
      return;
    }

    const imageRect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    if (
      clientX < imageRect.left ||
      clientX > imageRect.right ||
      clientY < imageRect.top ||
      clientY > imageRect.bottom
    ) {
      setShowLens(false);
      return;
    }

    const offsetX = clientX - imageRect.left;
    const offsetY = clientY - imageRect.top;
    const percentX = (offsetX / imageRect.width) * 100;
    const percentY = (offsetY / imageRect.height) * 100;

    setLensPosition({
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
    });
    setBackgroundPosition(`${percentX}% ${percentY}%`);
    setShowLens(magnifierEnabled);
  };

  const handleMagnifierWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!magnifierEnabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setMagnifierZoom((current) => {
      const delta = event.deltaY < 0 ? 0.28 : -0.28;
      return Math.min(6, Math.max(1.8, Number((current + delta).toFixed(2))));
    });
  };

  const toggleMagnifier = () => {
    setMagnifierEnabled((current) => {
      const next = !current;
      setActiveUtilityPanel(next ? "magnifier" : null);
      if (!next) {
        setShowLens(false);
      }
      return next;
    });
  };

  const toggleContrastPanel = () => {
    setActiveUtilityPanel((current) => (current === "contrast" ? null : "contrast"));
  };

  if (!src) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#2d2a26] p-8 text-center text-[#e7e1cf]/55">
        <Sparkles size={48} className="mb-4 opacity-20" />
        <p className="font-serif italic">Manuscrito no disponible u omitido</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative h-full w-full overflow-hidden bg-[#181510]"
      onMouseMove={(event) => updateLens(event.clientX, event.clientY)}
      onMouseLeave={() => setShowLens(false)}
      onWheelCapture={handleMagnifierWheel}
    >
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
            <div className="flex h-full w-full items-center justify-center cursor-grab active:cursor-grabbing">
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center p-2 sm:p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={src}
                  alt={alt}
                  draggable={false}
                  style={{ filter: imageFilter }}
                  className="max-h-full max-w-full rounded-[0.3rem] object-contain shadow-[0_14px_30px_rgba(0,0,0,0.34)] transition-[filter] duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                    (e.target as HTMLImageElement).parentElement?.classList.add("broken-image-fallback");
                  }}
                />
              </TransformComponent>
            </div>
            <Controls />
          </>
        )}
      </TransformWrapper>

      {magnifierEnabled && showLens ? (
        <div
          className="pointer-events-none absolute z-[60] h-40 w-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-[#e6d8b7]/90 shadow-[0_18px_40px_rgba(0,0,0,0.38)]"
          style={{
            left: lensPosition.x,
            top: lensPosition.y,
            backgroundImage: `url("${src}")`,
            backgroundPosition,
            backgroundSize: `${magnifierZoom * 100}%`,
            backgroundRepeat: "no-repeat",
            filter: imageFilter,
          }}
        >
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(24,17,10,0.35)]" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[55] flex justify-end">
        <div className="pointer-events-auto flex max-w-[min(100%,640px)] flex-col gap-2">
          {activeUtilityPanel ? (
            <div className="ml-auto w-full max-w-[420px] rounded-[1rem] border border-[#8c7a56]/46 bg-[rgba(20,16,12,0.92)] p-3 shadow-[0_16px_32px_rgba(0,0,0,0.28)] backdrop-blur-md">
              {activeUtilityPanel === "magnifier" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e4d6b8]">Lupa activa</p>
                      <p className="mt-1 text-sm text-[#f0e6d1]">Rueda del raton para cambiar la ampliacion sobre la imagen.</p>
                    </div>
                    <span className="rounded-full bg-[#ead4a0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5b4213]">
                      {magnifierZoom.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1.8}
                    max={6}
                    step={0.1}
                    value={magnifierZoom}
                    onChange={(event) => setMagnifierZoom(Number(event.target.value))}
                    className="w-full accent-[#c5a028]"
                  />
                </div>
              ) : null}

              {activeUtilityPanel === "contrast" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e4d6b8]">Contraste de manuscrito</p>
                      <p className="mt-1 text-sm text-[#f0e6d1]">Ajusta intensidad e invierte los tonos para inspeccion detallada.</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#efe4cf]">
                      {contrastValue}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setContrastValue((current) => Math.max(70, current - 8))}
                      className="rounded-full bg-white/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e7e1cf] hover:bg-white/14"
                    >
                      Menos
                    </button>
                    <input
                      type="range"
                      min={70}
                      max={180}
                      step={2}
                      value={contrastValue}
                      onChange={(event) => setContrastValue(Number(event.target.value))}
                      className="w-full accent-[#c5a028]"
                    />
                    <button
                      type="button"
                      onClick={() => setContrastValue((current) => Math.min(180, current + 8))}
                      className="rounded-full bg-white/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e7e1cf] hover:bg-white/14"
                    >
                      Mas
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInvertEnabled((current) => !current)}
                      className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
                        invertEnabled ? "bg-[#ead4a0] text-[#5b4213]" : "bg-white/8 text-[#e7e1cf] hover:bg-white/14"
                      }`}
                    >
                      Invertir
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setContrastValue(108);
                        setInvertEnabled(false);
                      }}
                      className="rounded-full bg-white/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#e7e1cf] hover:bg-white/14"
                    >
                      Restablecer
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="ml-auto flex flex-wrap items-center gap-2 rounded-[1rem] border border-[#85795f]/45 bg-[rgba(18,14,11,0.82)] px-3 py-2 shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-md">
            <UtilityButton active={magnifierEnabled} onClick={toggleMagnifier}>
              <Search size={14} />
              Lupa
            </UtilityButton>

            <UtilityButton active={activeUtilityPanel === "contrast" || contrastValue !== 108 || invertEnabled} onClick={toggleContrastPanel}>
              <SlidersHorizontal size={14} />
              Contraste
            </UtilityButton>

            {onToggleTranscript ? (
              <UtilityButton active={transcriptHidden} onClick={onToggleTranscript}>
                <Eye size={14} />
                {transcriptHidden ? "Ver texto" : "Solo manuscrito"}
              </UtilityButton>
            ) : null}

            <UtilityButton active={false} onClick={() => void toggleFullscreen()}>
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {isFullscreen ? "Salir" : "Pantalla"}
            </UtilityButton>
          </div>
        </div>
      </div>

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
