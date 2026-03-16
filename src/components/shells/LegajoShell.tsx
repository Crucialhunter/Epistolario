import type { ReactNode } from 'react';
import { LegajoCorpusVM } from '@/lib/view-models';
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

export default function LegajoShell({ legajo, currentTab, breadcrumbs, children, lowerModules }: LegajoShellProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10 lg:px-16">
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <LegajoHero legajo={legajo} />
        <LegajoTabNav legajoId={legajo.id} currentTab={currentTab} />
        <section>{children}</section>
        {lowerModules ? <section className="grid gap-6 lg:grid-cols-2">{lowerModules}</section> : null}
      </div>
    </div>
  );
}
