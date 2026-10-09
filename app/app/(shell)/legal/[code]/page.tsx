import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { Alert, BasicPageLayout } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { NormDetailClient } from '@/features/legal/ui/NormDetailClient';
import {
  canWriteLegal,
  type NormDetail,
} from '@/features/legal/ui/legal-types';

export default async function LegalNormDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw);
  const session = await getServerSession(authOptions);
  const { ok, status, data } = await coreFetch<NormDetail>(
    `/api/legal/norms/${encodeURIComponent(code)}`,
    session?.user?.accessToken,
  );

  if (status === 404 || (!ok && status === 404)) {
    notFound();
  }
  if (!ok || !data) {
    return (
      <BasicPageLayout title="Norma" subtitle={code}>
        <Alert variant="error">No se pudo cargar la norma.</Alert>
        <p className="mt-3">
          <Link href="/legal" className="underline">
            Volver a Normas
          </Link>
        </p>
      </BasicPageLayout>
    );
  }

  return (
    <BasicPageLayout
      title={data.numberLabel}
      subtitle={`${data.code} · ${data.shortTitle}`}
    >
      <NormDetailClient
        norm={data}
        canWrite={canWriteLegal(session?.user?.role)}
      />
    </BasicPageLayout>
  );
}
