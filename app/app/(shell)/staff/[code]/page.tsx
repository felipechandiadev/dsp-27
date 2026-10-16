import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { StaffDetailView } from '@/features/staff/ui/StaffDetailView';
import type { StaffDetail } from '@/features/staff/ui/staff-detail.types';

async function fetchStaff(
  code: string,
  accessToken?: string,
): Promise<StaffDetail | null> {
  const { ok, status, data } = await coreFetch<StaffDetail>(
    `/api/staff/${encodeURIComponent(code)}`,
    accessToken,
  );
  if (status === 404 || !ok || !data) return null;
  return data;
}

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await getServerSession(authOptions);
  const staff = await fetchStaff(code, session?.user?.accessToken);
  if (!staff) notFound();

  const role = session?.user?.role;
  const canEdit =
    role === 'direccion' ||
    role === 'administrativo' ||
    role === 'jefe_operaciones';

  return <StaffDetailView staff={staff} canEdit={canEdit} />;
}
