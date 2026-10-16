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
import { NormsCollection } from '@/features/legal/ui/NormsCollection';
import type { NormListItem } from '@/features/legal/ui/legal-types';

export default async function DocumentsNormsPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams & { kind?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const { search } = parseListQuery(params);
  const query = searchParamsToQuery(params);

  const qs = new URLSearchParams();
  if (typeof params.kind === 'string' && params.kind) {
    qs.set('kind', params.kind);
  }
  if (typeof params.status === 'string' && params.status) {
    qs.set('status', params.status);
  }
  const path = qs.toString()
    ? `/api/legal/norms?${qs.toString()}`
    : '/api/legal/norms';

  const { ok, data } = await coreFetch<NormListItem[]>(
    path,
    session?.user?.accessToken,
  );

  if (!ok) {
    return (
      <div className="p-4">
        <Alert variant="error">No se pudo cargar el marco normativo.</Alert>
      </div>
    );
  }

  const all = Array.isArray(data) ? data : [];
  const filtered = filterBySearch(all, search, (n) => [
    n.code,
    n.kind,
    n.numberLabel,
    n.shortTitle,
    n.status,
    n.summary,
  ]);

  return (
    <NextNavProvider search={query}>
      <NormsCollection rows={filtered} role={session?.user?.role} />
    </NextNavProvider>
  );
}
