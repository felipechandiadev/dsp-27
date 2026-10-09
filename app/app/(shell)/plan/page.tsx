import { getServerSession } from 'next-auth';
import { BasicPageLayout, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';

async function fetchObjectives(accessToken?: string) {
  if (!accessToken) return [];
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:5080';
  try {
    const res = await fetch(`${base}/api/plan/objectives`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return (await res.json()) as Array<{
      code: string;
      title: string;
      rationale: string | null;
    }>;
  } catch {
    return [];
  }
}

export default async function PlanPage() {
  const session = await getServerSession(authOptions);
  const objectives = await fetchObjectives(session?.user?.accessToken);

  return (
    <BasicPageLayout
      title="Plan / Estrategia"
      subtitle="Misión, visión y objetivos O1–O4"
    >
      <div className="flex flex-col gap-3 max-w-3xl">
        {objectives.map((o) => (
          <Card key={o.code} title={`${o.code} — ${o.title}`}>
            <p className="text-sm text-[var(--color-muted-foreground)] m-0 leading-relaxed">
              {o.rationale ?? 'Sin justificación cargada.'}
            </p>
          </Card>
        ))}
      </div>
    </BasicPageLayout>
  );
}
