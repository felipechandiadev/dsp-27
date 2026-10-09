'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Button,
  Dialog,
  TextField,
} from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import { userRoleLabel } from '@/shared/auth/user-roles';

type MeResponse = {
  id: string;
  username: string;
  role: string;
  status: string;
  personaId: string;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    documentType: string;
    documentNumber: string;
  } | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function UserAccountDialog({ open, onClose }: Props) {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open || !token) return;
    let cancelled = false;
    setLoadError(null);
    setFormError(null);
    setFormOk(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    void (async () => {
      try {
        const res = await fetch(`${apiBase()}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}`);
        }
        const data = (await res.json()) as MeResponse;
        if (!cancelled) setMe(data);
      } catch {
        if (!cancelled) {
          setLoadError('No se pudo cargar el perfil');
          setMe(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setFormOk(null);
    if (newPassword.length < 8) {
      setFormError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('La confirmación no coincide');
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`${apiBase()}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = Array.isArray(body?.message)
          ? body.message.join(', ')
          : (body?.message ?? `Error ${res.status}`);
        throw new Error(msg);
      }
      setFormOk('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'No se pudo cambiar la contraseña',
      );
    } finally {
      setPending(false);
    }
  }

  const fullName = me?.person
    ? `${me.person.firstName} ${me.person.lastName}`
    : (session?.user?.name ?? '—');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Mi cuenta"
      size="lg"
      scroll="paper"
      alertArea={
        loadError ? <Alert variant="error">{loadError}</Alert> : null
      }
    >
      <div className="dsp-user-dialog">
        <section className="dsp-user-dialog__info" aria-label="Datos del usuario">
          <h3 className="dsp-user-dialog__heading">Información</h3>
          <dl className="dsp-user-dialog__dl">
            <dt>Nombre</dt>
            <dd>{fullName}</dd>
            <dt>Usuario</dt>
            <dd>{me?.username ?? session?.user?.username ?? '—'}</dd>
            <dt>Perfil</dt>
            <dd>{userRoleLabel(me?.role ?? session?.user?.role)}</dd>
            <dt>Estado</dt>
            <dd>{me?.status ?? '—'}</dd>
            <dt>Documento</dt>
            <dd>
              {me?.person
                ? `${me.person.documentType} ${me.person.documentNumber}`
                : '—'}
            </dd>
            <dt>Email</dt>
            <dd>{me?.person?.email ?? '—'}</dd>
          </dl>
        </section>

        <section
          className="dsp-user-dialog__password"
          aria-label="Cambiar contraseña"
        >
          <h3 className="dsp-user-dialog__heading">Cambiar contraseña</h3>
          <form className="dsp-user-dialog__form" onSubmit={onSubmit} noValidate>
            <TextField
              label="Contraseña actual"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={pending}
            />
            <TextField
              label="Nueva contraseña"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={pending}
            />
            <TextField
              label="Confirmar nueva"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={pending}
            />
            {formError ? <Alert variant="error">{formError}</Alert> : null}
            {formOk ? <Alert variant="success">{formOk}</Alert> : null}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={pending}
              disabled={pending || !token}
            >
              Guardar contraseña
            </Button>
          </form>
        </section>
      </div>
    </Dialog>
  );
}
