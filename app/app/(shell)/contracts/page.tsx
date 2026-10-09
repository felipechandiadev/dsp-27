import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import {
  BasicPageLayout,
  NextNavProvider,
} from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import {
  ContractsDataGrid,
  type ContractRow,
} from '@/features/contracts/ui/ContractsDataGrid';
import {
  filterBySearch,
  paginateRows,
  parseListQuery,
  searchParamsToQuery,
  type ListSearchParams,
} from '@/shared/ui/list-query';
import { ViewModeToggleConnected } from '@/shared/ui/view-mode-toggle';

async function fetchContracts(accessToken?: string): Promise<ContractRow[]> {
  const { ok, data } = await coreFetch<ContractRow[]>(
    '/api/contracts',
    accessToken,
  );
  if (!ok || !Array.isArray(data)) return [];
  return data;
}

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const params = await searchParams;
  const { page, limit, search } = parseListQuery(params);
  const session = await getServerSession(authOptions);
  const all = await fetchContracts(session?.user?.accessToken);
  const filtered = filterBySearch(all, search, (c) => [
    c.code,
    c.title,
    c.kind,
    c.status,
    c.contractor?.name ?? '',
    c.contractor?.rut ?? '',
  ]);
  const { pageRows, totalRows } = paginateRows(filtered, page, limit);
  const query = searchParamsToQuery(params);

  return (
    <BasicPageLayout
      title="Contratos"
      subtitle="Arriendos, guardias y servicios bajo ITS"
      headerActions={
        <Suspense fallback={null}>
          <ViewModeToggleConnected />
        </Suspense>
      }
      contentClassName="flex min-h-0 flex-1 flex-col"
      className="min-h-0 flex-1"
    >
      <NextNavProvider search={query}>
        <ContractsDataGrid
          rows={pageRows}
          totalRows={totalRows}
          limit={limit}
        />
      </NextNavProvider>
    </BasicPageLayout>
  );
}
