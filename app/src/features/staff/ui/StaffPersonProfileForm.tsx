'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, type FormEvent } from 'react';
import { Button, Select, TextField } from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import type { StaffDetail } from '@/features/staff/ui/staff-detail.types';
import {
  isChileRegion,
  listComunasByRegion,
  listRegionesChile,
} from '@/shared/geo/chile';

type PersonProfile = NonNullable<StaffDetail['person']>;

type Props = {
  code: string;
  person: PersonProfile;
};

const REGION_OPTIONS = listRegionesChile();

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function StaffPersonProfileForm({ code, person }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.accessToken;

  const [email, setEmail] = useState(person.email ?? '');
  const [phone, setPhone] = useState(person.phone ?? '');
  const [address, setAddress] = useState(person.address ?? '');
  const [city, setCity] = useState(person.city ?? '');
  const [state, setState] = useState(person.state ?? '');
  const [maritalStatus, setMaritalStatus] = useState(person.maritalStatus ?? '');
  const [gender, setGender] = useState(person.gender ?? '');
  const [nationality, setNationality] = useState(person.nationality ?? '');
  const [profession, setProfession] = useState(person.profession ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const comunaOptions = listComunasByRegion(state);

  useEffect(() => {
    setEmail(person.email ?? '');
    setPhone(person.phone ?? '');
    setAddress(person.address ?? '');
    setCity(person.city ?? '');
    setState(person.state ?? '');
    setMaritalStatus(person.maritalStatus ?? '');
    setGender(person.gender ?? '');
    setNationality(person.nationality ?? '');
    setProfession(person.profession ?? '');
  }, [person]);

  useEffect(() => {
    if (!state || !city) return;
    const allowed = listComunasByRegion(state).some((c) => c.id === city);
    if (!allowed) setCity('');
  }, [state, city]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(
        `${apiBase()}/api/staff/${encodeURIComponent(code)}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emptyToNull(email),
            phone: emptyToNull(phone),
            address: emptyToNull(address),
            city: emptyToNull(city),
            state: emptyToNull(state),
            maritalStatus: emptyToNull(maritalStatus),
            gender: emptyToNull(gender),
            nationality: emptyToNull(nationality),
            profession: emptyToNull(profession),
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          Array.isArray(body?.message)
            ? body.message.join(', ')
            : (body?.message ?? `Error ${res.status}`),
        );
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setBusy(false);
    }
  }

  const regionValue = isChileRegion(state) ? state : null;
  const comunaValue =
    city && comunaOptions.some((c) => c.id === city) ? city : null;

  return (
    <form
      onSubmit={onSubmit}
      className="flex min-w-0 flex-1 flex-col gap-3"
      data-test-id="staff-person-profile-form"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          label="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="sm:col-span-2"
        />
        <Select
          label="Región"
          options={REGION_OPTIONS}
          value={regionValue}
          onChange={(id) => {
            const next = id == null ? '' : String(id);
            setState(next);
            setCity('');
          }}
          allowClear
          placeholder="Seleccionar región…"
          data-test-id="staff-person-region"
        />
        <Select
          label="Comuna"
          options={comunaOptions}
          value={comunaValue}
          onChange={(id) => setCity(id == null ? '' : String(id))}
          allowClear
          disabled={!regionValue}
          placeholder={
            regionValue ? 'Seleccionar comuna…' : 'Selecciona primero la región'
          }
          data-test-id="staff-person-comuna"
        />
        {!regionValue && state ? (
          <p className="m-0 sm:col-span-2 text-xs text-[var(--color-muted-foreground)]">
            Valor guardado de región no está en el catálogo: “{state}”. Elige una
            región válida.
          </p>
        ) : null}
        <TextField
          label="Estado civil"
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
        />
        <TextField
          label="Género"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        />
        <TextField
          label="Nacionalidad"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
        />
        <TextField
          label="Profesión"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
        />
      </div>
      {error ? (
        <p className="m-0 text-sm text-[var(--color-destructive,#b91c1c)]">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="m-0 text-sm text-[var(--color-muted-foreground)]">
          Guardado.
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={busy || !token}>
          {busy ? 'Guardando…' : 'Guardar datos'}
        </Button>
      </div>
    </form>
  );
}
