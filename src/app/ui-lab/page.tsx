import AppHeader from '@/components/navigation/AppHeader';
import { buildAppHeaderNav } from '@/components/navigation/appHeaderNav';
import ArchiveFooter from '@/components/navigation/ArchiveFooter';
import UiLabV2Showcase from '@/components/lab/v2/UiLabV2Showcase';

export default function UiLabPage() {
  return (
    <div className="app-page">
      <AppHeader brand="ARCA" navItems={buildAppHeaderNav('proyecto')} badge="Archivo digital" contextMode="none" />
      <main>
        <UiLabV2Showcase />
      </main>
      <ArchiveFooter />
    </div>
  );
}
