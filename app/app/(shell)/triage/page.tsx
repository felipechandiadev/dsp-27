import { getServerSession } from 'next-auth';
import { BasicPageLayout } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { OperationalTriageBoard } from '@/features/operational-cases/ui/OperationalTriageBoard';
import type {
  CatalogType,
  FieldOperationRow,
  IncidenciaRow,
  RequerimientoRow,
} from '@/features/operational-cases/ui/ops-types';

export default async function TriagePage() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;

  const [incTypes, opTypes, incidencias, requerimientos, operations] =
    await Promise.all([
      coreFetch<CatalogType[]>(
        '/api/operational-cases/incident-types',
        token,
      ),
      coreFetch<CatalogType[]>(
        '/api/operational-cases/operation-types',
        token,
      ),
      coreFetch<IncidenciaRow[]>(
        '/api/operational-cases/incidencias?limit=50',
        token,
      ),
      coreFetch<RequerimientoRow[]>(
        '/api/operational-cases/requerimientos?limit=50',
        token,
      ),
      coreFetch<FieldOperationRow[]>(
        '/api/operational-cases/operations?active=true&limit=50',
        token,
      ),
    ]);

  return (
    <BasicPageLayout
      title="Triage"
      subtitle="Incidencias, requerimientos y operaciones de campo"
    >
      <OperationalTriageBoard
        initialIncidencias={
          incidencias.ok && Array.isArray(incidencias.data)
            ? incidencias.data
            : []
        }
        initialRequerimientos={
          requerimientos.ok && Array.isArray(requerimientos.data)
            ? requerimientos.data
            : []
        }
        initialOperations={
          operations.ok && Array.isArray(operations.data)
            ? operations.data
            : []
        }
        incidentTypes={
          incTypes.ok && Array.isArray(incTypes.data) ? incTypes.data : []
        }
        operationTypes={
          opTypes.ok && Array.isArray(opTypes.data) ? opTypes.data : []
        }
      />
    </BasicPageLayout>
  );
}
