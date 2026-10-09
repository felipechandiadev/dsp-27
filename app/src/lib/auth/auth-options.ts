import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

function apiBase(): string {
  const base =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    'http://localhost:5080';
  return base.replace(/\/$/, '');
}

const isProd = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  cookies: {
    sessionToken: {
      name: isProd
        ? '__Secure-next-auth.session.dsp-27'
        : 'next-auth.session.dsp-27',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProd,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password;
        if (!username || !password) {
          throw new Error('Usuario y contraseña son obligatorios');
        }

        const res = await fetch(`${apiBase()}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          accessToken?: string;
          user?: {
            id: string;
            username: string;
            role: string;
            personaId: string;
          };
          message?: string | string[];
        };

        if (!res.ok || !data.accessToken || !data.user) {
          const msg = Array.isArray(data.message)
            ? data.message[0]
            : data.message || 'Credenciales inválidas';
          throw new Error(String(msg));
        }

        return {
          id: data.user.id,
          name: data.user.username,
          accessToken: data.accessToken,
          role: data.user.role,
          personaId: data.user.personaId,
          username: data.user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.personaId = user.personaId;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.accessToken = token.accessToken;
        session.user.role = token.role;
        session.user.personaId = token.personaId;
        session.user.username = token.username;
        session.user.name = token.username ?? session.user.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
