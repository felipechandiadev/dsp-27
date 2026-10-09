import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { Badge, BasicPageLayout, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';

type ContractDetail = {
  id: string;
  code: string;
  kind: string;
  title: string;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
  notes: string | null;
  itsUserId: string;
  contractor: {
    id: string;
    rut: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  periods: Array<{
    id: string;
    year: number;
    month: number;
    ym: string;
    status: string;
    docsDueOn: string | null;
    certifiedAt: string | null;
  }>;
};

async function fetchContract(
  code: string,
  accessToken?: string,
): Promise<ContractDetail | null> {
  const { ok, status, data } = await coreFetch<ContractDetail>(
    `/api/contracts/${encodeURIComponent(code)}`,
    accessToken,
  );
  if (status === 404 || !ok || !data) return null;
  return data;
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await getServerSession(authOptions);
  const contract = await fetchContract(code, session?.user?.accessToken);
  if (!contract) notFound();

  return (
    <BasicPageLayout
      title={`${contract.code} — ${contract.title}`}
      subtitle={
        <>
          <Badge variant="secondary">{contract.status}</Badge>{' '}
          <span className="text-[var(--color-muted-foreground)]">
            {contract.kind}
          </span>
        </>
      }
    >
      <div className="flex flex-col gap-3 max-w-3xl">
        <Card title="Privado">
          {contract.contractor ? (
            <div className="text-sm flex flex-col gap-1">
              <p className="m-0 font-medium">{contract.contractor.name}</p>
              <p className="m-0 text-[var(--color-muted-foreground)]">
                RUT {contract.contractor.rut}
              </p>
              {contract.contractor.email ? (
                <p className="m-0 text-[var(--color-muted-foreground)]">
                  {contract.contractor.email}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm m-0 text-[var(--color-muted-foreground)]">
              Sin contraparte
            </p>
          )}
        </Card>

        <Card title="Vigencia">
          <p className="text-sm m-0 text-[var(--color-muted-foreground)]">
            {contract.startsOn ?? '—'} → {contract.endsOn ?? 'abierto'}
          </p>
          {contract.notes ? (
            <p className="text-sm m-0 mt-2">{contract.notes}</p>
          ) : null}
        </Card>

        <Card title="Períodos mensuales" subtitle={`${contract.periods?.length ?? 0}`}>
          <ul className="m-0 p-0 list-none flex flex-col gap-2">
            {(contract.periods ?? []).map((p) => (
              <li key={p.id} className="text-sm flex items-center gap-2">
                <Link
                  href={`/contracts/${contract.code}/periods/${p.ym}`}
                  className="font-medium hover:underline"
                >
                  {p.ym}
                </Link>
                <Badge variant="secondary">{p.status}</Badge>
                {p.docsDueOn ? (
                  <span className="text-[var(--color-muted-foreground)] text-xs">
                    vence {p.docsDueOn}
                  </span>
                ) : null}
              </li>
            ))}
            {!contract.periods?.length ? (
              <li className="text-sm text-[var(--color-muted-foreground)]">
                Sin períodos abiertos.
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
    </BasicPageLayout>
  );
}
