export type AdminUserRow = {
  id: string;
  username: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  person: {
    id: string;
    code: string | null;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    email: string | null;
  } | null;
};
