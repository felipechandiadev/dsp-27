'use client';

import { FormEvent, useState } from 'react';
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

type Props = {
  open: boolean;
  onClose: () => void;
};

const ROLE_OPTIONS = USER_ROLES.map((r) => ({
  id: r,
  label: USER_ROLE_LABELS[r],
}));

export function CreateUserDialog({ open, onClose }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.accessToken;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string | number | null>('inspector');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setUsername('');
    setPassword('');
    setRole('inspector');
    setFirstName('');
    setLastName('');
    setDocumentNumber('');
    setEmail('');
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError('Sesión no disponible');
      return;
    }
    if (!role) {
      setError('Seleccione un perfil');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          role: String(role),
          documentType: 'RUT',
          documentNumber: documentNumber.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
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
              : 'No se pudo crear el usuario',
        );
        return;
      }
      handleClose();
      router.refresh();
    } catch {
      setError('Error de red');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Nuevo usuario">
      <form onSubmit={onSubmit} className="grid gap-3">
        <p className="text-sm text-[var(--color-muted-foreground)] m-0">
          Cuenta de acceso a la app (persona + login).
        </p>
        {error ? <Alert variant="error">{error}</Alert> : null}
        <TextField
          label="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="off"
        />
        <TextField
          label="Contraseña temporal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Select
          label="Perfil"
          options={ROLE_OPTIONS}
          value={role}
          onChange={setRole}
          required
        />
        <TextField
          label="Nombres"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <TextField
          label="Apellidos"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <TextField
          label="RUT"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          required
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? 'Creando…' : 'Crear'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
