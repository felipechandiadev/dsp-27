export type CreateUserInput = {
  username: string;
  password: string;
  role: string;
  personaId?: string;
  documentType?: string;
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export class CreateUserCommand {
  constructor(public readonly input: CreateUserInput) {}
}
