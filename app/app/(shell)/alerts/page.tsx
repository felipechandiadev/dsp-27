import { redirect } from 'next/navigation';

/** Compat: la ruta canónica es /notifications. */
export default function AlertsRedirectPage() {
  redirect('/notifications');
}
