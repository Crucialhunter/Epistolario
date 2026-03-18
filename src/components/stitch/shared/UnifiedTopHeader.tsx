import AppHeader, {
  type AppHeaderNavItem as UnifiedTopHeaderNavItem,
  type AppHeaderProps as UnifiedTopHeaderProps,
} from '@/components/navigation/AppHeader';

export type { UnifiedTopHeaderNavItem, UnifiedTopHeaderProps };

export default function UnifiedTopHeader(props: Readonly<UnifiedTopHeaderProps>) {
  return <AppHeader {...props} />;
}
