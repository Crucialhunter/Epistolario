'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import ArcaTopBar from '@/components/navigation/ArcaTopBar';
import type { ArcaTopBarSection } from '@/components/navigation/arcaTopBarConfig';
import type { AppHeaderNavItem, AppHeaderSection } from '@/components/navigation/appHeaderNav';

export type { AppHeaderNavItem, AppHeaderSection } from '@/components/navigation/appHeaderNav';

export interface AppHeaderProps {
  readonly brand: string;
  readonly navItems: readonly AppHeaderNavItem[];
  readonly badge: string;
  readonly contextEyebrow?: string;
  readonly contextTitle?: string;
  readonly contextMeta?: string;
  readonly contextMode?: 'stacked' | 'compact' | 'none';
}

function resolveActiveFromNavItems(navItems: readonly AppHeaderNavItem[]): ArcaTopBarSection['id'] | null {
  const activeItem = navItems.find((item) => item.active);

  if (!activeItem) {
    return null;
  }

  const normalizedLabel = activeItem.label.trim().toLowerCase();

  if (normalizedLabel.includes('archivo')) return 'archivo';
  if (normalizedLabel.includes('legajo')) return 'legajos';
  if (normalizedLabel.includes('recorrido')) return 'recorridos';
  if (normalizedLabel.includes('relato')) return 'relatos';
  if (normalizedLabel.includes('proyecto')) return 'proyecto';
  return null;
}

function resolveActiveFromPathname(pathname: string | null): ArcaTopBarSection['id'] | null {
  if (!pathname || pathname === '/') {
    return null;
  }

  if (pathname.startsWith('/ui-lab')) {
    return 'proyecto';
  }

  if (pathname.includes('/recorridos')) {
    return 'recorridos';
  }

  if (pathname.includes('/relatos')) {
    return 'relatos';
  }

  if (pathname.startsWith('/legajos')) {
    return 'legajos';
  }

  return null;
}

export default function AppHeader({
  brand,
  navItems,
}: Readonly<AppHeaderProps>) {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const header = headerRef.current;

    if (!header || typeof window === 'undefined') {
      return undefined;
    }

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty('--app-header-height', `${header.offsetHeight}px`);
    };

    updateHeaderHeight();

    const observer = new ResizeObserver(() => updateHeaderHeight());
    observer.observe(header);
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  const activeSectionId = useMemo(
    () => resolveActiveFromNavItems(navItems) ?? resolveActiveFromPathname(pathname),
    [navItems, pathname],
  );

  return (
    <div ref={headerRef}>
      <ArcaTopBar brand={brand} brandHref="/" surface="flush" activeSectionId={activeSectionId} defaultOpenId={null} />
    </div>
  );
}
