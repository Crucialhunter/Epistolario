"use client";

import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react";

interface ManuscriptViewerProps {
  src: string;
  alt: string;
}

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute bottom-3 right-3 md:bottom-10 md:right-10 flex items-stretch bg-[#1b180d]/60 md:bg-[#1b180d] border border-white/10 md:border-[#5a5545] shadow-2xl z-50 opacity-40 md:opacity-100 hover:opacity-100 transition-opacity duration-300 rounded-lg md:rounded-none overflow-hidden backdrop-blur-md md:backdrop-blur-none scale-[0.8] md:scale-100 origin-bottom-right">
      <button 
        onClick={() => zoomOut(0.25)} 
        className="p-4 text-[#e7e1cf] hover:text-[#c5a028] hover:bg-black/40 transition-colors border-r border-white/10 md:border-[#5a5545]"
        title="Alejar"
      >
        <ZoomOut size={20} />
      </button>
      
      <button 
        onClick={() => resetTransform()} 
        className="px-6 py-4 text-[#e7e1cf] hover:text-[#c5a028] hover:bg-black/40 transition-colors border-r border-white/10 md:border-[#5a5545] font-bold text-xs md:text-[10px] uppercase tracking-[0.2em] flex items-center"
        title="Ajustar a pantalla"
      >
        Ajustar
      </button>
      
      <button 
        onClick={() => zoomIn(0.25)} 
        className="p-4 text-[#e7e1cf] hover:text-[#c5a028] hover:bg-black/40 transition-colors"
        title="Acercar"
      >
        <ZoomIn size={20} />
      </button>
    </div>
  );
};

export default function ManuscriptViewer({ src, alt }: ManuscriptViewerProps) {
  // If no source is provided, show a polite placeholder
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
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <>
            <div className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  draggable={false}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                  onError={(e) => {
                    // Fallback to a clear empty state if image load fails
                    (e.target as HTMLImageElement).src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    (e.target as HTMLImageElement).parentElement?.classList.add('broken-image-fallback');
                  }}
                />
              </TransformComponent>
            </div>
            {/* Controls are now always in DOM but change opacity on hover, placed bottom right */}
            <Controls />
          </>
        )}
      </TransformWrapper>
      
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
    </div>
  );
}
