import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Compass,
  Scale,
  FolderKanban,
  ListTodo,
  Bell,
  Users,
  MapPinned,
  CalendarDays,
  Mail,
  FileText,
  Inbox,
  Columns3,
  Settings,
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

/** Menú lateral — sin títulos de sección. */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'main',
    label: '',
    items: [
      { href: '/board', label: 'Tablero', icon: LayoutDashboard },
      { href: '/plan', label: 'Plan / Estrategia', icon: Compass },
      { href: '/projects', label: 'Proyectos', icon: FolderKanban },
      { href: '/tasks', label: 'Tareas', icon: ListTodo },
      { href: '/legal', label: 'Normas', icon: Scale },
      { href: '/calendar', label: 'Calendario', icon: CalendarDays },
      { href: '/mail', label: 'Correo', icon: Mail },
      { href: '/contracts', label: 'Contratos', icon: FileText },
      { href: '/staff', label: 'Personal y nómina', icon: Users },
      { href: '/areas', label: 'Áreas de operación', icon: MapPinned },
      { href: '/triage', label: 'Triage', icon: Columns3 },
      { href: '/requests', label: 'Solicitudes', icon: Inbox },
      { href: '/notifications', label: 'Notificaciones', icon: Bell },
      { href: '/settings', label: 'Ajustes', icon: Settings },
    ],
  },
];
