import { getServerSession } from 'next-auth';
import { Badge, BasicPageLayout, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';

async function fetchNorms(accessToken?: string) {
  if (!accessToken) return [];
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:5080';
  try {
    const res = await fetch(`${base}/api/legal/norms`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return (await res.json()) as Array<{
      code: string;
      numberLabel: string;
      shortTitle: string;
      status: string;
      summary: string | null;
    }>;
  } catch {
    return [];
  }
}

export default async function LegalPage() {
  const session = await getServerSession(authOptions);
  const norms = await fetchNorms(session?.user?.accessToken);

  return (
    <BasicPageLayout title="Normas" subtitle="Marco normativo Cap. 1">
      <div className="flex flex-col gap-3 max-w-3xl">
        {norms.map((n) => (
          <Card
            key={n.code}
            title={`${n.numberLabel} — ${n.shortTitle}`}
            headerEnd={<Badge variant="info">{n.status}</Badge>}
            subtitle={n.code}
          >
            <p className="text-sm text-[var(--color-muted-foreground)] m-0 leading-relaxed">
              {n.summary ?? 'Sin resumen.'}
            </p>
          </Card>
        ))}
      </div>
    </BasicPageLayout>
  );
}
