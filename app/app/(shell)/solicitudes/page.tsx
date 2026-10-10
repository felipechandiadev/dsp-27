import { redirect } from 'next/navigation';

/** Ruta legacy en español → `/requests`. */
export default function SolicitudesRedirectPage() {
  redirect('/requests');
}
