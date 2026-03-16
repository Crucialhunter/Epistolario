"use client";

import React from 'react';

export default function ScrollToTopButton() {
  return (
    <button 
      onClick={() => window.scrollTo({top:0, behavior: 'smooth'})} 
      className="text-[9px] font-bold uppercase tracking-widest text-[#5a5545] border border-[#e7e1cf] px-3 py-1.5 rounded bg-white flex items-center gap-1.5 hover:text-[#c5a028] transition-colors"
    >
      <span className="text-[#c5a028]">↑</span> Ver manuscrito
    </button>
  );
}
