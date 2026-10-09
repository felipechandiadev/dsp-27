import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Compass,
  Scale,
  FolderKanban,
  Bell,
  Users,
  MapPinned,
  CalendarDays,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

/** Menú inicial — módulos del producto (placeholders hasta completar pantallas). */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'work',
    label: 'Trabajo',
    items: [
      { href: '/board', label: 'Tablero', icon: LayoutDashboard },
      { href: '/plan', label: 'Plan / Estrategia', icon: Compass },
      { href: '/projects', label: 'Cartera', icon: FolderKanban },
      { href: '/legal', label: 'Normas', icon: Scale },
      { href: '/alerts', label: 'Alertas', icon: Bell },
    ],
  },
  {
    id: 'ops',
    label: 'Operación',
    items: [
      { href: '/calendar', label: 'Calendario', icon: CalendarDays },
      { href: '/staff', label: 'Personal y nómina', icon: Users },
      { href: '/prevention', label: 'Prevención', icon: MapPinned },
    ],
  },
];
