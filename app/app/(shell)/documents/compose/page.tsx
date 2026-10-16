import { getServerSession } from 'next-auth';
import { Alert, BasicPageLayout } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { ComposeDocumentView } from '@/features/documents/ui/ComposeDocumentView';
import type { DocumentTypeRow } from '@/features/documents/ui/document-types';

export default async function DocumentsComposePage() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;

  const typesRes = await coreFetch<DocumentTypeRow[]>(
    '/api/document-types',
    token,
  );

  if (!typesRes.ok) {
    return (
      <BasicPageLayout title="Redactar" subtitle="Nuevo documento">
        <Alert variant="error">No se pudieron cargar los tipos de documento.</Alert>
      </BasicPageLayout>
    );
  }

  const types = Array.isArray(typesRes.data) ? typesRes.data : [];

  return (
    <ComposeDocumentView
      documentTypes={types}
      role={session?.user?.role}
    />
  );
}
