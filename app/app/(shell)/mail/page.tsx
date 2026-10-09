import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Alert, BasicPageLayout, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch, type MicrosoftStatus } from '@/lib/api/core-fetch';
import { SendMailForm } from '@/features/mail/ui/send-mail-form';

type InboxResponse = {
  messages: Array<{
    id: string;
    subject: string | null;
    from: string | null;
    receivedDateTime: string | null;
    bodyPreview: string | null;
  }>;
};

export default async function MailPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const token = session?.user?.accessToken;

  const { data: status } = await coreFetch<MicrosoftStatus>(
    '/api/integrations/microsoft/status',
    token,
  );

  let inbox: InboxResponse['messages'] = [];
  let inboxError: string | null = null;

  if (status?.connected) {
    const res = await coreFetch<InboxResponse>(
      '/api/integrations/microsoft/mail/inbox?top=20',
      token,
    );
    if (res.ok && res.data?.messages) {
      inbox = res.data.messages;
    } else if (res.status === 401) {
      inboxError = 'Sesión de Outlook expirada. Vuelve a conectar en Ajustes.';
    } else {
      inboxError = 'No se pudo cargar la bandeja de entrada.';
    }
  }

  return (
    <BasicPageLayout
      title="Correo"
      subtitle="Bandeja y envío vía Outlook conectado"
    >
      {params.sent === '1' ? (
        <Alert variant="success">Correo enviado.</Alert>
      ) : null}
      {params.sent === '0' ? (
        <Alert variant="error">No se pudo enviar el correo.</Alert>
      ) : null}

      {!status?.configured ? (
        <Alert variant="warning">
          Microsoft Graph no está configurado en el servidor.
        </Alert>
      ) : !status?.connected ? (
        <Card>
          <Alert variant="info">
            Conecta Outlook en Ajustes para leer y enviar correo.
          </Alert>
          <p style={{ marginTop: '1rem' }}>
            <Link href="/settings">Ir a Ajustes</Link>
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <Card>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem' }}>
              Enviar correo
            </h2>
            <SendMailForm accountEmail={status.accountEmail} />
          </Card>

          <Card>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem' }}>
              Bandeja de entrada
            </h2>
            {inboxError ? <Alert variant="error">{inboxError}</Alert> : null}
            {!inboxError && inbox.length === 0 ? (
              <Alert variant="info">No hay mensajes recientes.</Alert>
            ) : null}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {inbox.map((m) => (
                <li
                  key={m.id}
                  style={{
                    padding: '0.75rem 0',
                    borderBottom:
                      '1px solid color-mix(in srgb, currentColor 12%, transparent)',
                  }}
                >
                  <strong style={{ display: 'block' }}>
                    {m.subject || '(sin asunto)'}
                  </strong>
                  <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    {m.from || '—'}
                    {m.receivedDateTime
                      ? ` · ${new Date(m.receivedDateTime).toLocaleString('es-CL')}`
                      : ''}
                  </span>
                  {m.bodyPreview ? (
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
                      {m.bodyPreview}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </BasicPageLayout>
  );
}
