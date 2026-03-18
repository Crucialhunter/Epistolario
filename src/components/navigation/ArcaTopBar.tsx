'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { defaultArcaTopBarSections, type ArcaTopBarSection } from '@/components/navigation/arcaTopBarConfig';

export interface ArcaTopBarProps {
  readonly sections?: readonly ArcaTopBarSection[];
  readonly defaultOpenId?: string | null;
  readonly activeSectionId?: string | null;
  readonly className?: string;
  readonly surface?: 'flush' | 'card';
  readonly brand?: string;
  readonly brandHref?: string;
  readonly eyebrow?: string;
}

function getPopoverPosition(index: number, total: number) {
  if (index >= total - 2) {
    return 'right-0';
  }

  if (index === 0) {
    return 'left-0';
  }

  return 'left-1/2 -translate-x-1/2';
}

export default function ArcaTopBar({
  sections = defaultArcaTopBarSections,
  defaultOpenId = null,
  activeSectionId = null,
  className,
  surface = 'flush',
  brand = 'ARCA',
  brandHref = '/',
  eyebrow = 'Archivo digital',
}: Readonly<ArcaTopBarProps>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeTimeoutRef = useRef<number | null>(null);
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  const sectionsWithIndex = useMemo(() => sections.map((section, index) => ({ ...section, index })), [sections]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenId(null);
      }
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenId(null);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown as unknown as EventListener);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown as unknown as EventListener);
    };
  }, []);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    },
    [],
  );

  function clearCloseTimeout() {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpenId(null);
    }, 150);
  }

  function focusButton(index: number) {
    const count = sectionsWithIndex.length;
    const safeIndex = (index + count) % count;
    buttonRefs.current[safeIndex]?.focus();
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number, sectionId: string) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusButton(index + 1);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusButton(index - 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusButton(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusButton(sectionsWithIndex.length - 1);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      clearCloseTimeout();
      setOpenId(sectionId);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpenId(null);
    }
  }

  return (
    <div ref={rootRef} className={`relative z-20 ${className ?? ''}`}>
      <header
        className={`text-[#f7f0e2] ${
          surface === 'flush'
            ? 'overflow-visible border-b border-[#43382d]/85 bg-[radial-gradient(circle_at_top_left,rgba(120,88,41,0.12),transparent_28%),linear-gradient(180deg,#1b1815_0%,#13110f_100%)] shadow-[0_10px_24px_rgba(15,12,10,0.14)]'
            : 'overflow-visible rounded-[1.35rem] border border-[#43382d]/85 bg-[radial-gradient(circle_at_top_left,rgba(120,88,41,0.12),transparent_28%),linear-gradient(180deg,#1b1815_0%,#13110f_100%)] shadow-[0_22px_44px_rgba(15,12,10,0.2)]'
        }`}
      >
        <div className={surface === 'flush' ? 'px-4 py-3 sm:px-6 lg:px-8' : 'px-4 py-3 sm:px-5 lg:px-6'}>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <Link href={brandHref} className="min-w-0 shrink-0 outline-none focus:ring-2 focus:ring-[#c5a059]/45">
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#d8be66]">{eyebrow}</p>
              <p className="reader-display mt-1 text-[1.18rem] font-semibold leading-none text-[#fff8ea] sm:text-[1.22rem]">{brand}</p>
            </Link>

            <nav
              aria-label="Navegacion principal ARCA"
              onMouseEnter={clearCloseTimeout}
              onMouseLeave={scheduleClose}
              onBlurCapture={(event) => {
                const nextTarget = event.relatedTarget as Node | null;
                if (!nextTarget || !rootRef.current?.contains(nextTarget)) {
                  scheduleClose();
                }
              }}
              className="relative min-w-0"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 md:gap-x-5 lg:justify-end">
                {sectionsWithIndex.map((section) => {
                  const Icon = section.icon;
                  const isOpen = openId === section.id;
                  const isActive = activeSectionId === section.id;
                  const shouldDim = Boolean(openId) && !isOpen;
                  const popoverPosition = getPopoverPosition(section.index, sectionsWithIndex.length);

                  return (
                    <div
                      key={section.id}
                      className="relative"
                      onMouseEnter={() => {
                        clearCloseTimeout();
                        setOpenId(section.id);
                      }}
                      onMouseLeave={scheduleClose}
                      onFocusCapture={() => {
                        clearCloseTimeout();
                        setOpenId(section.id);
                      }}
                      onBlurCapture={(event) => {
                        const nextTarget = event.relatedTarget as Node | null;
                        if (!nextTarget || !(event.currentTarget as HTMLDivElement).contains(nextTarget)) {
                          scheduleClose();
                        }
                      }}
                    >
                      <button
                        ref={(element) => {
                          buttonRefs.current[section.index] = element;
                        }}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`arca-topbar-panel-${section.id}`}
                        onClick={() => {
                          clearCloseTimeout();
                          setOpenId((current) => (current === section.id ? null : section.id));
                        }}
                        onKeyDown={(event) => handleTriggerKeyDown(event, section.index, section.id)}
                        className={`group relative inline-flex items-center gap-1.5 px-0 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]/45 sm:text-[11px] ${
                          isOpen || isActive
                            ? 'text-[#fff7ea]'
                            : shouldDim
                              ? 'text-[#b9ac95] opacity-70 hover:text-[#efe6d3] hover:opacity-100'
                              : 'text-[#ded1bc] hover:text-[#fff8ea]'
                        }`}
                      >
                        {Icon ? (
                          <Icon
                            className={`h-3.5 w-3.5 transition-all duration-200 ${
                              isOpen || isActive
                                ? 'text-[#dcc07b]'
                                : shouldDim
                                  ? 'text-[#8f8065]'
                                  : 'text-[#bda57a] group-hover:text-[#dcc07b]'
                            }`}
                          />
                        ) : null}
                        <span className="whitespace-nowrap">{section.label}</span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#dcc07b]' : shouldDim ? 'text-[#87755d]' : 'text-[#aa9675]'
                          }`}
                        />
                        <span
                          className={`absolute inset-x-0 -bottom-[0.1rem] h-px origin-left bg-[linear-gradient(90deg,#c5a059,#e2cc96)] transition-transform duration-200 ${
                            isOpen || isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                          }`}
                        />
                      </button>

                      {isOpen ? (
                        <div className={`absolute top-full z-50 pt-3 ${popoverPosition}`}>
                          <div className="absolute inset-x-0 bottom-full h-4" />
                          <div
                            id={`arca-topbar-panel-${section.id}`}
                            className="w-[min(24rem,calc(100vw-2rem))] rounded-[0.8rem] border border-white/[0.08] bg-[linear-gradient(180deg,#1b1815_0%,#16130f_100%)] px-2 py-2 shadow-[0_24px_48px_rgba(0,0,0,0.6)] animate-[dropdownFadeIn_0.2s_ease-out] sm:w-[22rem] lg:w-[24rem]"
                          >
                            <div className="px-2.5 pb-2 pt-1">
                              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#d8be66]">{section.label}</p>
                              {section.description ? (
                                <p className="mt-1 text-[12px] leading-relaxed text-[#b7aa96]">{section.description}</p>
                              ) : null}
                            </div>
                            <div className="flex flex-col">
                              {section.links?.map((link) => {
                                const LinkIcon = link.icon;

                                return (
                                  <Link
                                    key={link.label}
                                    href={link.href}
                                    className="group rounded-[0.55rem] px-2.5 py-2.5 transition-colors duration-200 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]/45"
                                  >
                                    <div className="flex items-start gap-3">
                                      {LinkIcon ? <LinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#cfae68]" /> : null}
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#eee2c8]">{link.label}</p>
                                          <span className="text-[#8f7851] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">→</span>
                                        </div>
                                        <p className="mt-1 text-[12px] leading-relaxed text-[#b3a691]">{link.description}</p>
                                      </div>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <style jsx>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
