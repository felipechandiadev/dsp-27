import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Users } from 'lucide-react';
import { Alert, BasicPageLayout, Button, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch, type MicrosoftStatus } from '@/lib/api/core-fetch';
import { canAdminUsers } from '@/shared/auth/user-roles';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ outlook?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const showUsersAdmin = canAdminUsers(session?.user?.role);
  const { data: status } = await coreFetch<MicrosoftStatus>(
    '/api/integrations/microsoft/status',
    session?.user?.accessToken,
  );

  const outlook = params.outlook;
  const banner =
    outlook === 'connected'
      ? { variant: 'success' as const, text: 'Outlook conectado correctamente.' }
      : outlook === 'disconnected'
        ? { variant: 'info' as const, text: 'Outlook desconectado.' }
        : outlook === 'error'
          ? {
              variant: 'error' as const,
              text: 'No se pudo completar la conexión con Outlook.',
            }
          : null;

  return (
    <BasicPageLayout
      title="Ajustes"
      subtitle="Integraciones de tu cuenta DSP"
    >
      {banner ? <Alert variant={banner.variant}>{banner.text}</Alert> : null}

      {showUsersAdmin ? (
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <Users
              className="h-6 w-6 shrink-0 mt-0.5"
              aria-hidden
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
                Usuarios
              </h2>
              <p
                style={{
                  margin: '0 0 1rem',
                  opacity: 0.85,
                  fontSize: '0.95rem',
                }}
              >
                Crear y administrar cuentas de acceso a la app (perfiles,
                estado y contraseñas).
              </p>
              <Link href="/settings/users">
                <Button type="button" variant="primary">
                  Administrar usuarios
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Outlook</h2>
        <p style={{ margin: '0 0 1rem', opacity: 0.85, fontSize: '0.95rem' }}>
          Conecta tu cuenta de Microsoft para enviar correo y sincronizar el
          calendario desde DSP-27. El login de la app no cambia.
        </p>

        {!status?.configured ? (
          <Alert variant="warning">
            La integración Microsoft no está configurada en el servidor
            (faltan variables <code>MS_*</code>).
          </Alert>
        ) : status.connected ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <p style={{ margin: 0 }}>
              Conectado como{' '}
              <strong>{status.accountEmail || 'cuenta Microsoft'}</strong>
            </p>
            <form action="/api/integrations/microsoft/disconnect" method="post">
              <Button type="submit" variant="outlined">
                Desconectar Outlook
              </Button>
            </form>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <Link href="/mail">Ir a Correo</Link>
              {' · '}
              <Link href="/calendar">Ir a Calendario</Link>
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Alert variant="info">
              Aún no hay una cuenta Outlook vinculada a tu usuario.
            </Alert>
            <form action="/api/integrations/microsoft/connect" method="get">
              <Button type="submit" variant="primary">
                Conectar Outlook
              </Button>
            </form>
          </div>
        )}
      </Card>
    </BasicPageLayout>
  );
}
