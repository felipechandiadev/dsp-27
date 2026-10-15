import { getServerSession } from 'next-auth';
import { Alert, BasicPageLayout } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { PreventivePatrolsWorkspace } from '@/features/preventive-patrols/ui/PreventivePatrolsWorkspace';
import type { PreventivePatrolRow } from '@/features/preventive-patrols/ui/ppv-form-types';

export default async function RondasPreventivasPage() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;
  const res = await coreFetch<PreventivePatrolRow[]>(
    '/api/preventive-patrols',
    token,
  );
  const rows = res.ok && Array.isArray(res.data) ? res.data : [];

  return (
    <BasicPageLayout
      title="Rondas preventivas"
      subtitle="Ficha de patrullaje preventivo vecinal (PPV-01)"
    >
      {!res.ok ? (
        <Alert variant="warning">
          No se pudo cargar el listado. Comprueba la sesión y el API.
        </Alert>
      ) : null}
      <PreventivePatrolsWorkspace initialRows={rows} />
    </BasicPageLayout>
  );
}
