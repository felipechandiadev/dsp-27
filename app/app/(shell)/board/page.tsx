import { getServerSession } from 'next-auth';
import { Badge, BasicPageLayout, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { userRoleLabel } from '@/shared/auth/user-roles';

async function fetchPlan(accessToken?: string) {
  if (!accessToken) return null;
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:5080';
  try {
    const res = await fetch(`${base}/api/plan`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      year: number;
      title: string;
      missionText: string;
    };
  } catch {
    return null;
  }
}

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
      status: string;
    }>;
  } catch {
    return [];
  }
}

export default async function BoardPage() {
  const session = await getServerSession(authOptions);
  const plan = await fetchPlan(session?.user?.accessToken);
  const projects = await fetchProjects(session?.user?.accessToken);

  return (
    <BasicPageLayout
      title="Tablero"
      subtitle={
        <>
          {session?.user?.username}{' '}
          <Badge variant="info">{userRoleLabel(session?.user?.role)}</Badge>
        </>
      }
    >
      <div className="flex flex-col gap-4 max-w-3xl">
        <Card title="Plan activo" subtitle={plan ? `${plan.year}` : undefined}>
          {plan ? (
            <p className="text-[var(--color-muted-foreground)] text-sm m-0 leading-relaxed">
              {plan.missionText.slice(0, 280)}…
            </p>
          ) : (
            <p className="text-[var(--color-muted-foreground)] text-sm m-0">
              No se pudo cargar el plan.
            </p>
          )}
        </Card>

        <Card title="Cartera seed" subtitle={`${projects.length} ítems`}>
          <ul className="m-0 p-0 list-none flex flex-col gap-2">
            {projects.map((p) => (
              <li
                key={p.code}
                className="flex items-center justify-between gap-2 text-sm border-b border-[var(--color-border)] pb-2 last:border-0"
              >
                <span>
                  <strong className="text-[var(--color-foreground)]">{p.code}</strong>{' '}
                  <span className="text-[var(--color-muted-foreground)]">
                    {p.title}
                  </span>
                </span>
                <Badge variant="secondary">{p.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </BasicPageLayout>
  );
}
