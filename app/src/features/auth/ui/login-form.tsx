'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Alert, Button, TextField } from '@felipechandiadev/ui';

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('direccion');
  const [password, setPassword] = useState('direccion123');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await signIn('credentials', {
        username: username.trim(),
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Usuario o contraseña incorrectos');
        return;
      }
      router.replace('/board');
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="dsp-stack" onSubmit={onSubmit} noValidate>
      <TextField
        label="Usuario"
        name="username"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={pending}
      />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={pending}
      />
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Button type="submit" variant="primary" size="lg" loading={pending} disabled={pending}>
        Entrar
      </Button>
    </form>
  );
}
