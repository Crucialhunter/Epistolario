import type { ReactNode } from 'react';
import { LegajoCorpusVM } from '@/lib/view-models';
import AppHeader from '@/components/navigation/AppHeader';
import { buildAppHeaderNav } from '@/components/navigation/appHeaderNav';
import Breadcrumbs, { BreadcrumbItem } from '@/components/navigation/Breadcrumbs';
import LegajoHero from '@/components/legajo/LegajoHero';
import LegajoTabNav from '@/components/legajo/LegajoTabNav';

interface LegajoShellProps {
  legajo: LegajoCorpusVM;
  currentTab: 'archivo' | 'recorridos' | 'relatos';
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
  lowerModules?: ReactNode;
}

function toHeaderSection(tab: LegajoShellProps['currentTab']) {
  if (tab === 'recorridos') return 'recorridos';
  if (tab === 'relatos') return 'relatos';
  return 'legajos';
}

export default function LegajoShell({ legajo, currentTab, breadcrumbs, children, lowerModules }: LegajoShellProps) {
  return (
    <div className="app-page">
      <AppHeader
        brand="ARCA"
        navItems={buildAppHeaderNav(toHeaderSection(currentTab))}
        badge="Archivo digital"
        contextMode="none"
      />

      <div className="mx-auto max-w-[1440px] px-6 py-6 md:px-10 md:py-8 lg:px-16">
        <div className="space-y-5">
          <Breadcrumbs items={breadcrumbs} />
          <LegajoHero legajo={legajo} />
          <LegajoTabNav legajoId={legajo.id} currentTab={currentTab} />
          <section>{children}</section>
          {lowerModules ? <section className="grid gap-6 lg:grid-cols-2">{lowerModules}</section> : null}
        </div>
      </div>
    </div>
  );
}
