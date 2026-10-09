import { getServerSession } from 'next-auth';
import { Alert, BasicPageLayout, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import type { InboxItem } from '@/features/notifications/lib/types';
import { AlertsInboxClient } from '@/features/notifications/ui/alerts-inbox-client';

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  const { data, ok } = await coreFetch<{ items: InboxItem[] }>(
    '/api/notifications/inbox?limit=50',
    session?.user?.accessToken,
  );

  return (
    <BasicPageLayout
      title="Notificaciones"
      subtitle="Bandeja de notificaciones del sistema"
    >
      {!ok ? (
        <Alert variant="warning">
          No se pudo cargar la bandeja. ¿Está el core levantado?
        </Alert>
      ) : (
        <Card>
          <AlertsInboxClient initialItems={data?.items ?? []} />
        </Card>
      )}
    </BasicPageLayout>
  );
}
