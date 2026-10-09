import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import { AppShell } from '@/shared/shell/AppShell';

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}
