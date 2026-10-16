import { getServerSession } from 'next-auth';
import { Alert, NextNavProvider } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import {
  filterBySearch,
  parseListQuery,
  searchParamsToQuery,
  type ListSearchParams,
} from '@/shared/ui/list-query';
import { ReportsCollection } from '@/features/documents/ui/ReportsCollection';
import type { ManagedDocumentListItem } from '@/features/documents/ui/report-types';

export default async function DocumentsLibraryPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams & { status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const { search } = parseListQuery(params);
  const query = searchParamsToQuery(params);
  const token = session?.user?.accessToken;

  const qs = new URLSearchParams();
  if (typeof params.status === 'string' && params.status) {
    qs.set('status', params.status);
  }
  const reportsPath = qs.toString()
    ? `/api/documents/reports?${qs.toString()}`
    : '/api/documents/reports';

  const reportsRes = await coreFetch<ManagedDocumentListItem[]>(
    reportsPath,
    token,
  );

  if (!reportsRes.ok) {
    return (
      <div className="p-4">
        <Alert variant="error">No se pudieron cargar los documentos.</Alert>
      </div>
    );
  }

  const all = Array.isArray(reportsRes.data) ? reportsRes.data : [];
  const filtered = filterBySearch(all, search, (d) => [
    d.code,
    d.title,
    d.status,
    d.documentType?.name ?? '',
    d.documentType?.code ?? '',
  ]);

  return (
    <NextNavProvider search={query}>
      <ReportsCollection rows={filtered} role={session?.user?.role} />
    </NextNavProvider>
  );
}
