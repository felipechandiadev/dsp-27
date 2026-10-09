import { Person } from '@modules/persons/domain/person.entity';
import { StaffMember } from '@modules/staff/domain/staff-member.entity';
import { StaffRequirementCheck } from '@modules/staff/domain/staff-requirement-check.entity';

export const STAFF_REPOSITORY = Symbol('STAFF_REPOSITORY');

export type StaffAssignedTaskRow = {
  taskId: string;
  taskCode: string | null;
  title: string;
  status: string;
  projectCode: string | null;
  projectTitle: string | null;
  assignmentRole: string;
  assignedAt: Date;
};

export type StaffActivityRow = {
  kind: 'note' | 'assignment';
  at: Date;
  summary: string;
  entityType: string | null;
  entityId: string | null;
  taskCode: string | null;
  projectCode: string | null;
};

export interface StaffRepositoryPort {
  listStaff(filters?: {
    unit?: string;
    status?: string;
    inspectorQuality?: string;
    ds97Profile?: string;
  }): Promise<StaffMember[]>;

  findByCode(code: string): Promise<StaffMember | null>;
  findByPersonaId(personaId: string): Promise<StaffMember | null>;

  findPersonById(id: string): Promise<Person | null>;
  findPersonByDocument(
    documentType: string,
    documentNumber: string,
  ): Promise<Person | null>;

  findUserIdByPersonaId(personaId: string): Promise<string | null>;

  listAssignedTasks(
    staffId: string,
    personaId: string,
  ): Promise<StaffAssignedTaskRow[]>;

  listActivity(
    staffId: string,
    personaId: string,
    userId: string | null,
    limit?: number,
  ): Promise<StaffActivityRow[]>;

  savePerson(person: Person): Promise<Person>;
  saveStaff(staff: StaffMember): Promise<StaffMember>;
  saveChecks(
    checks: StaffRequirementCheck[],
  ): Promise<StaffRequirementCheck[]>;
  saveCheck(check: StaffRequirementCheck): Promise<StaffRequirementCheck>;

  findCheck(
    staffId: string,
    requirementCode: string,
  ): Promise<StaffRequirementCheck | null>;

  createPerson(data: Partial<Person>): Person;
  createStaff(data: Partial<StaffMember>): StaffMember;
  createCheck(data: Partial<StaffRequirementCheck>): StaffRequirementCheck;
}
