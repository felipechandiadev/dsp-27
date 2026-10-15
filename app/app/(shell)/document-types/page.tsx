import { getServerSession } from 'next-auth';
import { Alert, BasicPageLayout } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { DocumentTypesAdmin } from '@/features/documents/ui/DocumentTypesAdmin';
import type { DocumentTypeRow } from '@/features/documents/ui/document-types';

export default async function DocumentTypesPage() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;
  const res = await coreFetch<DocumentTypeRow[]>('/api/document-types', token);
  const types = res.ok && Array.isArray(res.data) ? res.data : [];

  return (
    <BasicPageLayout
      title="Tipos de documentos"
      subtitle="Catálogo maestro de tipos documentales de la Dirección"
    >
      {!res.ok ? (
        <Alert variant="warning">
          No se pudo cargar el catálogo. Comprueba la sesión y el API.
        </Alert>
      ) : null}
      <DocumentTypesAdmin initialTypes={types} />
    </BasicPageLayout>
  );
}
