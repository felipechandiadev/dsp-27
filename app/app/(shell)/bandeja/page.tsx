import { redirect } from 'next/navigation';

/** Ruta legacy → triage. */
export default function BandejaRedirectPage() {
  redirect('/triage');
}
