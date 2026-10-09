'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Button,
  Dialog,
  Select,
  TextField,
} from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import { USER_ROLES, USER_ROLE_LABELS } from '@/shared/auth/user-roles';
import type { AdminUserRow } from './users-types';

type Props = {
  user: AdminUserRow | null;
  open: boolean;
  onClose: () => void;
};

const ROLE_OPTIONS = USER_ROLES.map((r) => ({
  id: r,
  label: USER_ROLE_LABELS[r],
}));

const STATUS_OPTIONS = [
  { id: 'active', label: 'Activo' },
  { id: 'inactive', label: 'Inactivo' },
];

export function EditUserDialog({ user, open, onClose }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.accessToken;

  const [role, setRole] = useState<string | number | null>(null);
  const [status, setStatus] = useState<string | number | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    setRole(user.role);
    setStatus(user.status);
    setFirstName(user.person?.firstName ?? '');
    setLastName(user.person?.lastName ?? '');
    setEmail(user.person?.email ?? '');
    setNewPassword('');
    setError(null);
    setOk(null);
  }, [user]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!token || !user) return;
    setPending(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch(`${apiBase()}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: role != null ? String(role) : undefined,
          status: status != null ? String(status) : undefined,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          email: email.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        message?: string | string[];
      } | null;
      if (!res.ok) {
        const msg = data?.message;
        setError(
          Array.isArray(msg)
            ? msg.join(', ')
            : typeof msg === 'string'
              ? msg
              : 'No se pudo guardar',
        );
        return;
      }

      if (newPassword.trim()) {
        const resetRes = await fetch(
          `${apiBase()}/api/users/${user.id}/reset-password`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPassword: newPassword.trim() }),
          },
        );
        if (!resetRes.ok) {
          const resetData = (await resetRes.json().catch(() => null)) as {
            message?: string | string[];
          } | null;
          const msg = resetData?.message;
          setError(
            Array.isArray(msg)
              ? msg.join(', ')
              : typeof msg === 'string'
                ? msg
                : 'Guardado, pero no se pudo resetear la contraseña',
          );
          return;
        }
      }

      setOk('Guardado');
      setNewPassword('');
      router.refresh();
    } catch {
      setError('Error de red');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={user ? `Usuario · ${user.username}` : 'Usuario'}
    >
      {!user ? null : (
        <form onSubmit={onSave} className="grid gap-3">
          {user.person ? (
            <p className="text-sm text-[var(--color-muted-foreground)] m-0">
              {user.person.documentType} {user.person.documentNumber}
            </p>
          ) : null}
          {error ? <Alert variant="error">{error}</Alert> : null}
          {ok ? <Alert variant="success">{ok}</Alert> : null}
          <Select
            label="Perfil"
            options={ROLE_OPTIONS}
            value={role}
            onChange={setRole}
          />
          <Select
            label="Estado"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
          <TextField
            label="Nombres"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Apellidos"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Nueva contraseña (opcional)"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outlined" onClick={onClose}>
              Cerrar
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
