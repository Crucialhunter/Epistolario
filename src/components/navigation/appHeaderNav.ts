export interface AppHeaderNavItem {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
}

export type AppHeaderSection = 'home' | 'archive' | 'legajos' | 'recorridos' | 'relatos' | 'proyecto';

export function buildAppHeaderNav(active: AppHeaderSection = 'archive'): AppHeaderNavItem[] {
  return [
    { label: 'Archivo', href: '/legajos', active: active === 'archive' },
    { label: 'Legajos', href: '/legajos', active: active === 'legajos' },
    { label: 'Recorridos', href: '/legajos/10/recorridos', active: active === 'recorridos' },
    { label: 'Relatos', href: '/legajos/10/relatos', active: active === 'relatos' },
    { label: 'Sobre el proyecto', href: '/ui-lab#que-es-arca', active: active === 'proyecto' },
  ];
}
