import { User } from '@modules/users/domain/user.entity';
import { Person } from '@modules/persons/domain/person.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type CreateUserInput = {
  personaId: string;
  username: string;
  passwordHash: string;
  role: string;
  status?: string;
};

export type CreatePersonInput = {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  code?: string | null;
};

export interface UserRepositoryPort {
  findByUsername(username: string): Promise<User | null>;
  findByUsernameAny(username: string): Promise<User | null>;
  findByIdWithPerson(id: string): Promise<User | null>;
  findByPersonaId(personaId: string): Promise<User | null>;
  findByPersonaIdAny(personaId: string): Promise<User | null>;
  listActiveWithPerson(): Promise<User[]>;
  listAllWithPerson(): Promise<User[]>;
  updateLastLogin(id: string, at: Date): Promise<void>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  save(user: User): Promise<User>;
  createUser(data: CreateUserInput): User;
  findPersonById(id: string): Promise<Person | null>;
  findPersonByDocument(
    documentType: string,
    documentNumber: string,
  ): Promise<Person | null>;
  createPerson(data: CreatePersonInput): Person;
  savePerson(person: Person): Promise<Person>;
}
