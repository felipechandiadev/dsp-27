'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button, IconButton } from '@felipechandiadev/ui';
import { NAV_SECTIONS } from '@/shared/navigation/nav-items';
import { userRoleLabel } from '@/shared/auth/user-roles';
import { NotificationBell } from '@/features/notifications/ui/notification-bell';
import { UserAccountDialog } from '@/features/auth/ui/user-account-dialog';

const COLLAPSE_KEY = 'dsp-sidebar-collapsed';

function readCollapsedPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistCollapsedPreference(collapsed: boolean) {
  try {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    if (collapsed) {
      document.documentElement.dataset.sidebarCollapsed = '1';
    } else {
      delete document.documentElement.dataset.sidebarCollapsed;
    }
  } catch {
    /* ignore */
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  // Always start expanded on SSR + first client paint to match HTML; restore from
  // localStorage after mount (width already applied via html[data-sidebar-collapsed]).
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const saved = readCollapsedPreference();
    setCollapsed(saved);
    persistCollapsedPreference(saved);
    setSidebarReady(true);
  }, []);

  function close() {
    setOpen(false);
  }

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      persistCollapsedPreference(next);
      return next;
    });
  }

  return (
    <div className="dsp-app">
      <header className="dsp-topbar">
        <span className="dsp-topbar__menu">
          <IconButton
            icon="Menu"
            ariaLabel="Abrir menú"
            variant="neutral"
            size="md"
            onClick={() => setOpen(true)}
          />
        </span>
        <Link href="/board" className="dsp-topbar__brand">
          DSP-27
          <span>Plan 2027</span>
        </Link>
        <span className="dsp-topbar__actions">
          <NotificationBell />
          <IconButton
            icon="UserCircle"
            ariaLabel="Mi cuenta"
            variant="neutral"
            size="md"
            onClick={() => setAccountOpen(true)}
          />
        </span>
      </header>

      <UserAccountDialog
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
      />

      <div
        className={`dsp-sidebar__overlay${open ? ' is-open' : ''}`}
        onClick={close}
        aria-hidden={!open}
      />

      <div className="dsp-body">
        <aside
          className={`dsp-sidebar${open ? ' is-open' : ''}${collapsed ? ' is-collapsed' : ''}${sidebarReady ? ' is-sidebar-ready' : ''}`}
          aria-label="Navegación principal"
        >
          <div className="dsp-sidebar__head">
            <p className="dsp-sidebar__title">Menú</p>
            <span className="dsp-sidebar__head-actions">
              <span className="dsp-sidebar__collapse">
                <IconButton
                  icon={collapsed ? 'PanelLeftOpen' : 'PanelLeftClose'}
                  ariaLabel={
                    collapsed ? 'Expandir menú' : 'Colapsar menú'
                  }
                  variant="neutral"
                  size="sm"
                  onClick={toggleCollapsed}
                />
              </span>
              <span className="dsp-sidebar__close">
                <IconButton
                  icon="X"
                  ariaLabel="Cerrar menú"
                  variant="neutral"
                  size="sm"
                  onClick={close}
                />
              </span>
            </span>
          </div>

          <nav>
            {NAV_SECTIONS.map((section) => (
              <div key={section.id}>
                {section.label ? (
                  <p className="dsp-nav__section">{section.label}</p>
                ) : null}
                <ul className="dsp-nav">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`dsp-nav__link${active ? ' is-active' : ''}`}
                          onClick={close}
                          aria-label={item.label}
                          aria-current={active ? 'page' : undefined}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon size={18} aria-hidden className="dsp-nav__icon" />
                          <span className="dsp-nav__label">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="dsp-sidebar__foot">
            <p className="dsp-sidebar__user">
              {session?.user?.username ?? '—'} ·{' '}
              {userRoleLabel(session?.user?.role)}
            </p>
            <span className="dsp-sidebar__logout-full">
              <Button
                type="button"
                variant="outlined"
                size="md"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Cerrar sesión
              </Button>
            </span>
            <span
              className="dsp-sidebar__logout-icon"
              title={collapsed ? 'Cerrar sesión' : undefined}
            >
              <IconButton
                icon="LogOut"
                ariaLabel="Cerrar sesión"
                variant="outlined"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              />
            </span>
          </div>
        </aside>

        <div className="dsp-main">{children}</div>
      </div>
    </div>
  );
}
