import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { Badge, BasicPageLayout, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';

async function fetchProject(code: string, accessToken?: string) {
  if (!accessToken) return null;
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:5080';
  try {
    const res = await fetch(`${base}/api/projects/${encodeURIComponent(code)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as {
      code: string;
      title: string;
      status: string;
      problem: string | null;
      scope: string | null;
      summary: string | null;
      objectiveCodes: string[];
      tasks: Array<{
        code: string | null;
        title: string;
        status: string;
        objectiveText: string | null;
        notes: Array<{ body: string }>;
      }>;
    };
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await getServerSession(authOptions);
  const project = await fetchProject(code, session?.user?.accessToken);
  if (!project) notFound();

  return (
    <BasicPageLayout
      title={`${project.code} — ${project.title}`}
      subtitle={
        <>
          <Badge variant="secondary">{project.status}</Badge>{' '}
          {project.objectiveCodes?.join(', ')}
        </>
      }
    >
      <div className="flex flex-col gap-3 max-w-3xl">
        <Card title="Problema">
          <p className="text-sm text-[var(--color-muted-foreground)] m-0 leading-relaxed">
            {project.problem ?? project.summary ?? '—'}
          </p>
        </Card>
        <Card title="Alcance">
          <p className="text-sm text-[var(--color-muted-foreground)] m-0 leading-relaxed">
            {project.scope ?? '—'}
          </p>
        </Card>
        <Card title="Tareas" subtitle={`${project.tasks?.length ?? 0}`}>
          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {(project.tasks ?? []).map((t) => (
              <li key={t.code ?? t.title} className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <strong>{t.code ?? '—'}</strong> {t.title}
                  <Badge variant="info">{t.status}</Badge>
                </div>
                {t.objectiveText ? (
                  <p className="m-0 text-[var(--color-muted-foreground)]">
                    {t.objectiveText}
                  </p>
                ) : null}
                {(t.notes ?? []).map((n, i) => (
                  <p
                    key={i}
                    className="m-1 mt-2 text-xs text-[var(--color-muted-foreground)] border-l-2 border-[var(--color-border)] pl-2"
                  >
                    {n.body}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </BasicPageLayout>
  );
}
