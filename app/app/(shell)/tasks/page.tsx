import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import {
  BasicPageLayout,
  NextNavProvider,
} from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import {
  TasksDataGrid,
  type TaskRow,
} from '@/features/tasks/ui/TasksDataGrid';
import {
  filterBySearch,
  paginateRows,
  parseListQuery,
  searchParamsToQuery,
  type ListSearchParams,
} from '@/shared/ui/list-query';
import { ViewModeToggleConnected } from '@/shared/ui/view-mode-toggle';

async function fetchTasks(accessToken?: string): Promise<TaskRow[]> {
  if (!accessToken) return [];
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:5080';
  try {
    const res = await fetch(`${base}/api/projects/tasks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return (await res.json()) as TaskRow[];
  } catch {
    return [];
  }
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const params = await searchParams;
  const { page, limit, search } = parseListQuery(params);
  const session = await getServerSession(authOptions);
  const all = await fetchTasks(session?.user?.accessToken);
  const filtered = filterBySearch(all, search, (t) => [
    t.code,
    t.title,
    t.status,
    t.leadRole,
    t.projectCode,
    t.projectTitle,
  ]);
  const { pageRows, totalRows } = paginateRows(filtered, page, limit);
  const query = searchParamsToQuery(params);

  return (
    <BasicPageLayout
      title="Tareas"
      subtitle="Trabajo de ejecución bajo los proyectos"
      headerActions={
        <Suspense fallback={null}>
          <ViewModeToggleConnected />
        </Suspense>
      }
      contentClassName="flex min-h-0 flex-1 flex-col"
      className="min-h-0 flex-1"
    >
      <NextNavProvider search={query}>
        <TasksDataGrid rows={pageRows} totalRows={totalRows} limit={limit} />
      </NextNavProvider>
    </BasicPageLayout>
  );
}
