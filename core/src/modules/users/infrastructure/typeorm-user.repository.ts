import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { Person } from '@modules/persons/domain/person.entity';
import {
  CreatePersonInput,
  CreateUserInput,
  UserRepositoryPort,
} from '../application/ports/user.repository.port';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(Person)
    private readonly persons: Repository<Person>,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({
      where: { username, status: 'active' },
      relations: ['person'],
    });
  }

  findByUsernameAny(username: string): Promise<User | null> {
    return this.repo.findOne({
      where: { username },
      relations: ['person'],
    });
  }

  findByIdWithPerson(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['person'],
    });
  }

  findByPersonaId(personaId: string): Promise<User | null> {
    return this.repo.findOne({
      where: { personaId, status: 'active' },
      relations: ['person'],
    });
  }

  findByPersonaIdAny(personaId: string): Promise<User | null> {
    return this.repo.findOne({
      where: { personaId },
      relations: ['person'],
    });
  }

  listActiveWithPerson(): Promise<User[]> {
    return this.repo.find({
      where: { status: 'active' },
      relations: ['person'],
      order: { username: 'ASC' },
    });
  }

  listAllWithPerson(): Promise<User[]> {
    return this.repo.find({
      relations: ['person'],
      order: { username: 'ASC' },
    });
  }

  async updateLastLogin(id: string, at: Date): Promise<void> {
    await this.repo.update({ id }, { lastLoginAt: at });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.repo.update({ id }, { passwordHash });
  }

  save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  createUser(data: CreateUserInput): User {
    return this.repo.create({
      personaId: data.personaId,
      username: data.username,
      passwordHash: data.passwordHash,
      role: data.role,
      status: data.status ?? 'active',
    });
  }

  findPersonById(id: string): Promise<Person | null> {
    return this.persons.findOne({ where: { id } });
  }

  findPersonByDocument(
    documentType: string,
    documentNumber: string,
  ): Promise<Person | null> {
    return this.persons.findOne({
      where: { documentType, documentNumber },
    });
  }

  createPerson(data: CreatePersonInput): Person {
    return this.persons.create({
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email ?? null,
      phone: data.phone ?? null,
      code: data.code ?? null,
    });
  }

  savePerson(person: Person): Promise<Person> {
    return this.persons.save(person);
  }
}
