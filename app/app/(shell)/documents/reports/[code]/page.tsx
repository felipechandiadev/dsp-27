import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { Alert, BasicPageLayout } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { ReportDetailView } from '@/features/documents/ui/ReportDetailView';
import type { ManagedDocumentDetail } from '@/features/documents/ui/report-types';
import type { DocumentTypeRow } from '@/features/documents/ui/document-types';

export default async function DocumentReportDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw);
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;

  const [reportRes, typesRes] = await Promise.all([
    coreFetch<ManagedDocumentDetail>(
      `/api/documents/reports/${encodeURIComponent(code)}`,
      token,
    ),
    coreFetch<DocumentTypeRow[]>('/api/document-types', token),
  ]);

  if (reportRes.status === 404) notFound();
  if (!reportRes.ok || !reportRes.data) {
    return (
      <BasicPageLayout title="Informe" subtitle={code}>
        <Alert variant="error">No se pudo cargar el informe.</Alert>
        <p className="mt-3">
          <Link href="/documents/library" className="underline">
            Volver a Biblioteca
          </Link>
        </p>
      </BasicPageLayout>
    );
  }

  const types =
    typesRes.ok && Array.isArray(typesRes.data) ? typesRes.data : [];

  return (
    <ReportDetailView
      report={reportRes.data}
      documentTypes={types}
      role={session?.user?.role}
    />
  );
}
