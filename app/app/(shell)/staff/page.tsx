import Link from 'next/link';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import {
  BasicPageLayout,
  NextNavProvider,
} from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import {
  StaffDataGrid,
  type StaffRow,
} from '@/features/staff/ui/StaffDataGrid';
import {
  filterBySearch,
  paginateRows,
  parseListQuery,
  searchParamsToQuery,
  type ListSearchParams,
} from '@/shared/ui/list-query';
import { ViewModeToggleConnected } from '@/shared/ui/view-mode-toggle';

async function fetchStaff(
  accessToken: string | undefined,
  payroll: boolean,
): Promise<StaffRow[]> {
  const path = payroll ? '/api/staff/payroll' : '/api/staff';
  const { ok, data } = await coreFetch<StaffRow[]>(path, accessToken);
  if (!ok || !Array.isArray(data)) return [];
  return data;
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams & { payroll?: string }>;
}) {
  const params = await searchParams;
  const payroll = params.payroll === '1' || params.payroll === 'true';
  const { page, limit, search } = parseListQuery(params);
  const session = await getServerSession(authOptions);
  const all = await fetchStaff(session?.user?.accessToken, payroll);
  const filtered = filterBySearch(all, search, (s) => [
    s.code,
    s.unit,
    s.status,
    s.inspectorQualityStatus,
    s.ds97Profile ?? '',
    s.person?.firstName ?? '',
    s.person?.lastName ?? '',
    s.person?.documentNumber ?? '',
  ]);
  const { pageRows, totalRows } = paginateRows(filtered, page, limit);
  const query = searchParamsToQuery(params);

  return (
    <BasicPageLayout
      title={payroll ? 'Nómina de inspectores' : 'Personal'}
      subtitle={
        payroll
          ? 'Art. 15° — calidad granted y estado active'
          : (
            <>
              Personal afecto DSP ·{' '}
              <Link
                href="/staff?payroll=1"
                className="underline text-[var(--color-foreground)]"
              >
                Ver nómina
              </Link>
            </>
          )
      }
      headerActions={
        <Suspense fallback={null}>
          <ViewModeToggleConnected />
        </Suspense>
      }
      contentClassName="flex min-h-0 flex-1 flex-col"
      className="min-h-0 flex-1"
    >
      <NextNavProvider search={query}>
        <StaffDataGrid
          rows={pageRows}
          totalRows={totalRows}
          limit={limit}
        />
      </NextNavProvider>
    </BasicPageLayout>
  );
}
