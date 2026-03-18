import type { ReactNode } from 'react';
import AppHeader, {
  type AppHeaderNavItem,
  type AppHeaderProps,
  type AppHeaderSection,
} from '@/components/navigation/AppHeader';
import { buildAppHeaderNav } from '@/components/navigation/appHeaderNav';
import ArchiveFooter from '@/components/navigation/ArchiveFooter';

interface ArchiveShellProps {
  children: ReactNode;
  headerProps?: Partial<AppHeaderProps> & {
    activeSection?: AppHeaderSection;
    navItems?: readonly AppHeaderNavItem[];
  };
}

export default function ArchiveShell({ children, headerProps }: ArchiveShellProps) {
  const {
    activeSection = 'legajos',
    navItems,
    brand = 'ARCA',
    badge = 'Archivo digital',
    contextEyebrow,
    contextTitle,
    contextMeta,
    contextMode = 'none',
  } = headerProps ?? {};

  return (
    <div className="app-page">
      <AppHeader
        brand={brand}
        navItems={navItems ?? buildAppHeaderNav(activeSection)}
        badge={badge}
        contextEyebrow={contextEyebrow}
        contextTitle={contextTitle}
        contextMeta={contextMeta}
        contextMode={contextMode}
      />
      <main>{children}</main>
      <ArchiveFooter />
    </div>
  );
}
