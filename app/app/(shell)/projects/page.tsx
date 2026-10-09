import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import {
  BasicPageLayout,
  NextNavProvider,
} from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import {
  ProjectsDataGrid,
  type ProjectRow,
} from '@/features/projects/ui/ProjectsDataGrid';
import {
  filterBySearch,
  paginateRows,
  parseListQuery,
  searchParamsToQuery,
  type ListSearchParams,
} from '@/shared/ui/list-query';
import { ViewModeToggleConnected } from '@/shared/ui/view-mode-toggle';

async function fetchProjects(accessToken?: string): Promise<ProjectRow[]> {
  if (!accessToken) return [];
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:5080';
  try {
    const res = await fetch(`${base}/api/projects?kind=project`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return (await res.json()) as ProjectRow[];
  } catch {
    return [];
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const params = await searchParams;
  const { page, limit, search } = parseListQuery(params);
  const session = await getServerSession(authOptions);
  const all = await fetchProjects(session?.user?.accessToken);
  const filtered = filterBySearch(all, search, (p) => [
    p.code,
    p.title,
    p.status,
    p.leadRole,
    p.summary,
    ...(p.objectiveCodes ?? []),
  ]);
  const { pageRows, totalRows } = paginateRows(filtered, page, limit);
  const query = searchParamsToQuery(params);

  return (
    <BasicPageLayout
      title="Proyectos"
      subtitle="Cartera PRJ del Plan 2027"
      headerActions={
        <Suspense fallback={null}>
          <ViewModeToggleConnected />
        </Suspense>
      }
      contentClassName="flex min-h-0 flex-1 flex-col"
      className="min-h-0 flex-1"
    >
      <NextNavProvider search={query}>
        <ProjectsDataGrid
          rows={pageRows}
          totalRows={totalRows}
          limit={limit}
        />
      </NextNavProvider>
    </BasicPageLayout>
  );
}
