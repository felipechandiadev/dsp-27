import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { BasicPageLayout } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import {
  TasksDataGrid,
  type TaskRow,
} from '@/features/tasks/ui/TasksDataGrid';

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

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  const tasks = await fetchTasks(session?.user?.accessToken);

  return (
    <BasicPageLayout
      title="Tareas"
      subtitle="Trabajo de ejecución bajo los proyectos"
    >
      <Suspense fallback={<p className="text-sm">Cargando…</p>}>
        <TasksDataGrid rows={tasks} />
      </Suspense>
    </BasicPageLayout>
  );
}
