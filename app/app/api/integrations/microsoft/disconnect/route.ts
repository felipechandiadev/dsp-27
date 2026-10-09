import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth/auth-options';
import { apiBase } from '@/lib/api/core-fetch';

export async function POST() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;
  if (!token) {
    return NextResponse.redirect(
      new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:5081'),
    );
  }

  await fetch(`${apiBase()}/api/integrations/microsoft`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  return NextResponse.redirect(
    new URL(
      '/settings?outlook=disconnected',
      process.env.NEXTAUTH_URL || 'http://localhost:5081',
    ),
  );
}
