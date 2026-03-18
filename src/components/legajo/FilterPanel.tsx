"use client";

import { useState } from 'react';

interface FilterPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  place: string;
  onPlaceChange: (value: string) => void;
  sender: string;
  onSenderChange: (value: string) => void;
  theme: string;
  onThemeChange: (value: string) => void;
  places: string[];
  senders: string[];
  themes: string[];
  resultsCount: number;
  onClear: () => void;
}

function FilterInput({
  value,
  onChange,
  placeholder,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
      <div className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-[#c9a030]' : 'text-[#a8956a]'}`}>
        {icon}
      </div>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full rounded-xl border-2 bg-[#fdfbf7] py-3.5 pl-11 pr-4 text-sm text-[#1a1610] outline-none transition-all duration-300 placeholder:text-[#a8956a]/60 ${isFocused ? 'border-[#c9a030] shadow-lg shadow-[#c9a030]/10' : 'border-[#e8dfd0] hover:border-[#d4c4a8]'}`}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full appearance-none rounded-xl border-2 bg-[#fdfbf7] py-3.5 pl-4 pr-10 text-sm text-[#1a1610] outline-none transition-all duration-300 ${isFocused ? 'border-[#c9a030] shadow-lg shadow-[#c9a030]/10' : 'border-[#e8dfd0] hover:border-[#d4c4a8]'}`}
      >
        <option value="">{label} (todos)</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {/* Custom arrow */}
      <div className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isFocused ? 'text-[#c9a030]' : 'text-[#a8956a]'}`}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export default function FilterPanel(props: FilterPanelProps) {
  const hasActiveFilters = Boolean(props.search || props.place || props.sender || props.theme);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#e8dfd0] bg-white p-5 shadow-xl shadow-[#1a1610]/5 md:p-6">
      {/* Decorative top bar */}
      <div className="absolute left-0 top-0 right-0 h-1 bg-gradient-to-r from-[#c9a030] via-[#d4b848] to-[#c9a030]" />

      {/* Corner decorations */}
      <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#c9a030]/20" />
      <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#c9a030]/20" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-l-2 border-b-2 border-[#c9a030]/20" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-r-2 border-b-2 border-[#c9a030]/20" />

      <div className="flex flex-col gap-5">
        {/* Header row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f5efe3] to-[#fdfbf7] shadow-inner">
              <svg className="h-6 w-6 text-[#c9a030]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a8956a]">Exploración textual</p>
              <h2 className="reader-display mt-1.5 text-2xl font-semibold text-[#1a1610]">Archivo del legajo</h2>
            </div>
          </div>

          {/* Results count - enhanced */}
          <div className={`flex items-center gap-3 rounded-xl px-4 py-2 transition-all duration-500 ${hasActiveFilters ? 'bg-[#f5efe3] ring-1 ring-[#c9a030]/20' : 'bg-[#fdfbf7]'}`}>
            <span className={`text-2xl font-bold tabular-nums transition-colors duration-300 ${hasActiveFilters ? 'text-[#c9a030]' : 'text-[#1a1610]'}`}>
              {props.resultsCount}
            </span>
            <span className="text-sm text-[#6b5d4d]">
              {props.resultsCount === 1 ? 'carta visible' : 'cartas visibles'}
            </span>
            {hasActiveFilters && (
              <span className="rounded-full bg-[#c9a030]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a6d20]">
                filtrado
              </span>
            )}
          </div>
        </div>

        {/* Filters grid */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FilterInput
            value={props.search}
            onChange={props.onSearchChange}
            placeholder="Buscar carta, remitente o lugar"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <FilterSelect
            value={props.place}
            onChange={props.onPlaceChange}
            options={props.places}
            label="Lugar"
          />
          <FilterSelect
            value={props.sender}
            onChange={props.onSenderChange}
            options={props.senders}
            label="Remitente"
          />
          <FilterSelect
            value={props.theme}
            onChange={props.onThemeChange}
            options={props.themes}
            label="Tema"
          />
        </div>

        {/* Clear filters button - enhanced */}
        {hasActiveFilters ? (
          <div className="flex items-center justify-between rounded-xl bg-[#f5efe3] p-3 ring-1 ring-[#c9a030]/20">
            <span className="text-sm text-[#6b5d4d]">
              Filtros activos: búsqueda, lugar, remitente o tema
            </span>
            <button
              type="button"
              onClick={props.onClear}
              className="group flex items-center gap-2 rounded-lg border border-[#d4c4a8] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6b5d4d] transition-all duration-300 hover:border-[#c9a030] hover:bg-[#fdfbf7] hover:text-[#1a1610]"
            >
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
