export type JwtPayload = {
  sub: string;
  personaId: string;
  username: string;
  role: string;
};

export type AuthUser = {
  id: string;
  personaId: string;
  username: string;
  role: string;
};
