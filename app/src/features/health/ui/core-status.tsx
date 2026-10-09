import { Badge } from '@felipechandiadev/ui';

async function fetchHealth(): Promise<{ ok: boolean; detail: string }> {
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:5080';
  try {
    const res = await fetch(`${base}/api/health`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return { ok: false, detail: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { status?: string; postgis?: string };
    return {
      ok: data.status === 'ok',
      detail: data.postgis ? `PostGIS ${data.postgis.split(' ')[0]}` : 'ok',
    };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : 'unreachable',
    };
  }
}

export async function CoreStatus() {
  const health = await fetchHealth();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant={health.ok ? 'success' : 'error'}>
        {health.ok ? 'Core en línea' : 'Core no responde'}
      </Badge>
      <span className="dsp-meta">{health.detail}</span>
    </div>
  );
}
