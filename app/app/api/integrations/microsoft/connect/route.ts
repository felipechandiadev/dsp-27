import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth/auth-options';
import { apiBase } from '@/lib/api/core-fetch';

export async function GET() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;
  if (!token) {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:5081'));
  }

  const res = await fetch(`${apiBase()}/api/integrations/microsoft/authorize-url`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const settings = new URL(
      '/settings?outlook=error',
      process.env.NEXTAUTH_URL || 'http://localhost:5081',
    );
    return NextResponse.redirect(settings);
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) {
    const settings = new URL(
      '/settings?outlook=error',
      process.env.NEXTAUTH_URL || 'http://localhost:5081',
    );
    return NextResponse.redirect(settings);
  }

  return NextResponse.redirect(data.url);
}
