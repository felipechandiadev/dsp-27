import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      username?: string;
      role?: string;
      personaId?: string;
      accessToken?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    username?: string;
    role?: string;
    personaId?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    role?: string;
    personaId?: string;
    username?: string;
  }
}
