'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  Card,
  CollectionPageLayout,
  IconButton,
} from '@felipechandiadev/ui';
import { userRoleLabel } from '@/shared/auth/user-roles';
import type { AdminUserRow } from './users-types';
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';

type Props = {
  rows: AdminUserRow[];
  canManage: boolean;
};

function fullName(u: AdminUserRow): string {
  if (!u.person) return u.username;
  return `${u.person.firstName} ${u.person.lastName}`.trim();
}

export function UsersAdminCollection({ rows, canManage }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUserRow | null>(null);

  const items = useMemo(
    () =>
      rows.map((u) => (
        <Card
          key={u.id}
          fillHeight
          className="cursor-pointer"
          onClick={() => canManage && setEditUser(u)}
          title={u.username}
          subtitle={fullName(u)}
          headerEnd={
            <Badge
              variant={u.status === 'active' ? 'success' : 'secondary'}
            >
              {u.status === 'active' ? 'Activo' : 'Inactivo'}
            </Badge>
          }
        >
          <p className="text-sm text-[var(--color-muted-foreground)] m-0">
            {userRoleLabel(u.role)}
          </p>
          {u.person?.email ? (
            <p className="text-xs text-[var(--color-muted-foreground)] m-0 mt-auto pt-2">
              {u.person.email}
            </p>
          ) : null}
        </Card>
      )),
    [rows, canManage],
  );

  return (
    <>
      <CollectionPageLayout
        title="Usuarios"
        subtitle="Cuentas de acceso a la app DSP"
        showSearch
        searchPlaceholder="Buscar usuario…"
        contentEmptyMessage="No hay usuarios."
        contentGridColumns={{ default: 1, sm: 2, lg: 3 }}
        contentGridGapClassName="gap-3"
        contentGridItemsAlign="stretch"
        data-test-id="users-admin-collection"
        addAction={
          canManage ? (
            <IconButton
              icon="Plus"
              variant="action"
              size="md"
              ariaLabel="Nuevo usuario"
              onClick={() => setCreateOpen(true)}
            />
          ) : undefined
        }
        contentItems={items}
      />
      {canManage ? (
        <>
          <CreateUserDialog
            open={createOpen}
            onClose={() => setCreateOpen(false)}
          />
          <EditUserDialog
            user={editUser}
            open={editUser != null}
            onClose={() => setEditUser(null)}
          />
        </>
      ) : null}
    </>
  );
}
