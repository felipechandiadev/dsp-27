import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth/auth-options';
import { apiBase } from '@/lib/api/core-fetch';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;
  if (!token) {
    return NextResponse.redirect(
      new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:5081'),
    );
  }

  const form = await request.formData();
  const to = String(form.get('to') || '').trim();
  const subject = String(form.get('subject') || '').trim();
  const body = String(form.get('body') || '').trim();
  const bodyHtml = body.includes('<') ? body : `<p>${body.replace(/\n/g, '<br/>')}</p>`;

  const res = await fetch(`${apiBase()}/api/integrations/microsoft/mail/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, subject, bodyHtml }),
    cache: 'no-store',
  });

  const dest = res.ok
    ? '/mail?sent=1'
    : `/mail?sent=0&err=${encodeURIComponent('No se pudo enviar')}`;

  return NextResponse.redirect(
    new URL(dest, process.env.NEXTAUTH_URL || 'http://localhost:5081'),
  );
}
