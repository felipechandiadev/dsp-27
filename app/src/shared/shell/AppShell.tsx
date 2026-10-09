'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button, IconButton } from '@felipechandiadev/ui';
import { NAV_SECTIONS } from '@/shared/navigation/nav-items';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  function close() {
    setOpen(false);
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
      </header>

      <div
        className={`dsp-sidebar__overlay${open ? ' is-open' : ''}`}
        onClick={close}
        aria-hidden={!open}
      />

      <div className="dsp-body">
        <aside
          className={`dsp-sidebar${open ? ' is-open' : ''}`}
          aria-label="Navegación principal"
        >
          <div className="dsp-sidebar__head">
            <p className="dsp-sidebar__title">Menú</p>
            <span className="dsp-sidebar__close">
              <IconButton
                icon="X"
                ariaLabel="Cerrar menú"
                variant="neutral"
                size="sm"
                onClick={close}
              />
            </span>
          </div>

          <nav>
            {NAV_SECTIONS.map((section) => (
              <div key={section.id}>
                <p className="dsp-nav__section">{section.label}</p>
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
                        >
                          <Icon size={18} aria-hidden />
                          {item.label}
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
              {session?.user?.username ?? '—'} · {session?.user?.role ?? ''}
            </p>
            <Button
              type="button"
              variant="outlined"
              size="md"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Cerrar sesión
            </Button>
          </div>
        </aside>

        <div className="dsp-main">{children}</div>
      </div>
    </div>
  );
}
