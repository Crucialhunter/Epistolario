import AppHeader from '@/components/navigation/AppHeader';
import { buildAppHeaderNav } from '@/components/navigation/appHeaderNav';

export default function TopNav() {
  return <AppHeader brand="ARCA" navItems={buildAppHeaderNav('archive')} badge="Archivo digital" contextMode="none" />;
}
