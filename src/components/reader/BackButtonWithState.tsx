"use client";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackButtonWithState({ legajoId }: { legajoId: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(`/legajos/${legajoId}`);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="group inline-flex items-center gap-2 rounded-full border border-[#e7dec9] bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6a5d47] hover:text-[#a38420] hover:border-[#d8c89e] transition-colors"
    >
      <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
      Volver al legajo {legajoId}
    </button>
  );
}
