import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Alert } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { canAdminUsers } from '@/shared/auth/user-roles';
import {
  filterBySearch,
  parseListQuery,
  type ListSearchParams,
} from '@/shared/ui/list-query';
import { UsersAdminCollection } from '@/features/users/ui/UsersAdminCollection';
import type { AdminUserRow } from '@/features/users/ui/users-types';

export default async function SettingsUsersPage({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }
  if (!canAdminUsers(session.user.role)) {
    redirect('/settings');
  }

  const params = await searchParams;
  const { search } = parseListQuery(params);
  const { ok, status, data } = await coreFetch<AdminUserRow[]>(
    '/api/users',
    session.user.accessToken,
  );

  if (!ok) {
    return (
      <div className="p-4">
        <Alert variant="error">
          {status === 403
            ? 'No tiene permiso para administrar usuarios.'
            : 'No se pudo cargar el listado de usuarios.'}
        </Alert>
      </div>
    );
  }

  const all = Array.isArray(data) ? data : [];
  const filtered = filterBySearch(all, search, (u) => [
    u.username,
    u.role,
    u.status,
    u.person?.firstName,
    u.person?.lastName,
    u.person?.documentNumber,
    u.person?.email,
  ]);

  return (
    <UsersAdminCollection rows={filtered} canManage />
  );
}
