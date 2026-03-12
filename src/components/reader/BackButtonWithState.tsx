"use client";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackButtonWithState({ legajoId }: { legajoId: string }) {
  const router = useRouter();

  const handleBack = () => {
    // Rely on native browser history to pop state preserving whatever Query Params were active.
    // This gives the cleanest UX without keeping huge state stores.
    if (window.history.length > 2) {
      router.back();
    } else {
      // Fallback if accessed sequentially via direct link
      router.push(`/legajos/${legajoId}`);
    }
  };

  return (
    <button 
      onClick={handleBack}
      className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5a5545] hover:text-[#c5a028] transition-colors mb-6"
    >
      <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" /> Volver al Legajo {legajoId}
    </button>
  );
}
