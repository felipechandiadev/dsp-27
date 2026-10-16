import { redirect } from 'next/navigation';

export default async function LegalNormDetailRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/documents/norms/${encodeURIComponent(code)}`);
}
