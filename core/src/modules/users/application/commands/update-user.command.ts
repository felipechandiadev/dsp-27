export type UpdateUserInput = {
  role?: string;
  status?: string;
  email?: string | null;
  firstName?: string;
  lastName?: string;
};

export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly input: UpdateUserInput,
  ) {}
}
