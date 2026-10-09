import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { BasicPageLayout } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import {
  ProjectsDataGrid,
  type ProjectRow,
} from '@/features/projects/ui/ProjectsDataGrid';

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

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const projects = await fetchProjects(session?.user?.accessToken);

  return (
    <BasicPageLayout
      title="Proyectos"
      subtitle="Cartera PRJ del Plan 2027 (sin tareas TAR)"
    >
      <Suspense fallback={<p className="text-sm">Cargando…</p>}>
        <ProjectsDataGrid rows={projects} />
      </Suspense>
    </BasicPageLayout>
  );
}
