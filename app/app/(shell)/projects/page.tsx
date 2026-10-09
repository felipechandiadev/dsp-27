import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Badge, BasicPageLayout, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';

async function fetchProjects(accessToken?: string) {
  if (!accessToken) return [];
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:5080';
  try {
    const res = await fetch(`${base}/api/projects`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return (await res.json()) as Array<{
      code: string;
      title: string;
      kind: string;
      status: string;
      summary: string | null;
      objectiveCodes: string[];
    }>;
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const projects = await fetchProjects(session?.user?.accessToken);

  return (
    <BasicPageLayout title="Cartera" subtitle="Proyectos PRJ y tareas TAR del libro">
      <div className="flex flex-col gap-3 max-w-3xl">
        {projects.map((p) => (
          <Card
            key={p.code}
            title={
              <Link href={`/projects/${p.code}`} className="hover:underline">
                {p.code} — {p.title}
              </Link>
            }
            headerEnd={<Badge variant="secondary">{p.status}</Badge>}
            subtitle={
              p.objectiveCodes?.length
                ? `Aporta a ${p.objectiveCodes.join(', ')}`
                : p.kind
            }
          >
            <p className="text-sm text-[var(--color-muted-foreground)] m-0">
              {p.summary ?? 'Sin resumen.'}
            </p>
          </Card>
        ))}
      </div>
    </BasicPageLayout>
  );
}
