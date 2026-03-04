import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string;
  filters: {
    brightness: number;
    contrast: number;
    invert: boolean;
  };
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export default function ImageViewer({ imageUrl, filters, canvasRef }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      setScale(s => Math.min(Math.max(0.1, s + delta), 5));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Draw to canvas for baking
  useEffect(() => {
    if (canvasRef && canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = imageRef.current.naturalWidth;
        canvas.height = imageRef.current.naturalHeight;

        ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) ${filters.invert ? 'invert(100%)' : ''}`;
        ctx.drawImage(imageRef.current, 0, 0);
      }
    }
  }, [imageUrl, filters, canvasRef]);

  const filterStyle = {
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) ${filters.invert ? 'invert(100%)' : ''}`,
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-stone/20 cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 bg-paper/80 backdrop-blur-sm p-1 rounded-md border border-ink/10 shadow-sm">
        <button onClick={() => setScale(s => Math.min(s + 0.2, 5))} className="p-1.5 text-ink/70 hover:text-ink hover:bg-stone rounded">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.1))} className="p-1.5 text-ink/70 hover:text-ink hover:bg-stone rounded">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={resetView} className="p-1.5 text-ink/70 hover:text-ink hover:bg-stone rounded">
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      <div
        className="absolute w-full h-full flex items-center justify-center origin-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Documento"
          className="max-w-[90%] max-h-[90%] object-contain shadow-md"
          style={filterStyle}
          draggable={false}
        />
      </div>

      {/* Hidden canvas for baking variants */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
