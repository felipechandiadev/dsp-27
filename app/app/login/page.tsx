import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { LoginForm } from '@/features/auth/ui/login-form';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect('/board');
  }

  return (
    <main className="dsp-shell">
      <p className="dsp-meta">Municipalidad de Parral</p>
      <h1 className="dsp-brand">DSP-27</h1>
      <p className="dsp-lede">
        Entrá con tu username. El correo vive en la persona, no es credencial.
      </p>
      <Card title="Acceso">
        <LoginForm />
      </Card>
      <p className="dsp-meta">
        Seed: <code>direccion</code> / <code>direccion123</code>
      </p>
    </main>
  );
}
