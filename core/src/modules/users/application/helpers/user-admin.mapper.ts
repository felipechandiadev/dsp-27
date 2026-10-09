import { User } from '@modules/users/domain/user.entity';

export function mapUserAdminDto(user: User) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    person: user.person
      ? {
          id: user.person.id,
          code: user.person.code,
          firstName: user.person.firstName,
          lastName: user.person.lastName,
          documentType: user.person.documentType,
          documentNumber: user.person.documentNumber,
          email: user.person.email,
        }
      : null,
  };
}
