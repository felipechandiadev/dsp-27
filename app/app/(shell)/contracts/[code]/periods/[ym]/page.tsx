import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { Badge, BasicPageLayout, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { PeriodChecklist } from '@/features/contracts/ui/PeriodChecklist';

type PeriodDetail = {
  id: string;
  year: number;
  month: number;
  ym: string;
  status: string;
  docsDueOn: string | null;
  certifiedAt: string | null;
  certificationNotes: string | null;
  canCertify: boolean;
  contract: { code: string; title: string; kind: string };
  documents: Array<{
    id: string;
    docType: string;
    status: string;
    notes: string | null;
  }>;
};

async function fetchPeriod(
  code: string,
  ym: string,
  accessToken?: string,
): Promise<PeriodDetail | null> {
  const { ok, status, data } = await coreFetch<PeriodDetail>(
    `/api/contracts/${encodeURIComponent(code)}/periods/${encodeURIComponent(ym)}`,
    accessToken,
  );
  if (status === 404 || !ok || !data) return null;
  return data;
}

export default async function ContractPeriodPage({
  params,
}: {
  params: Promise<{ code: string; ym: string }>;
}) {
  const { code, ym } = await params;
  const session = await getServerSession(authOptions);
  const period = await fetchPeriod(code, ym, session?.user?.accessToken);
  if (!period) notFound();

  return (
    <BasicPageLayout
      title={`Período ${period.ym}`}
      subtitle={
        <>
          <Link
            href={`/contracts/${period.contract.code}`}
            className="hover:underline"
          >
            {period.contract.code}
          </Link>
          {' — '}
          {period.contract.title}{' '}
          <Badge variant="secondary">{period.status}</Badge>
        </>
      }
    >
      <div className="flex flex-col gap-3 max-w-2xl">
        <Card
          title="Checklist documental"
          subtitle={
            period.docsDueOn ? `Vence ${period.docsDueOn}` : period.contract.kind
          }
        >
          <PeriodChecklist
            periodId={period.id}
            status={period.status}
            canCertify={period.canCertify}
            documents={period.documents}
            certificationNotes={period.certificationNotes}
          />
        </Card>
      </div>
    </BasicPageLayout>
  );
}
