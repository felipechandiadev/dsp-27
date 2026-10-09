import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateStaffCommand } from '../commands/create-staff.command';
import {
  STAFF_REPOSITORY,
  StaffRepositoryPort,
} from '../ports/staff.repository.port';
import { assertStaffWriteRole } from '../helpers/staff-access';
import {
  art12Checklist,
  isDs97Profile,
  isStaffStatus,
  isStaffUnit,
} from '@modules/staff/domain/staff-kinds';
import { RecordCodeService } from '@modules/record-codes/application/record-code.service';

@CommandHandler(CreateStaffCommand)
export class CreateStaffHandler
  implements ICommandHandler<CreateStaffCommand>
{
  constructor(
    @Inject(STAFF_REPOSITORY)
    private readonly repo: StaffRepositoryPort,
    private readonly recordCodes: RecordCodeService,
  ) {}

  async execute(cmd: CreateStaffCommand) {
    assertStaffWriteRole(cmd.actorRole);
    const { input } = cmd;

    if (!isStaffUnit(input.unit)) {
      throw new BadRequestException(`unit inválida: ${input.unit}`);
    }
    if (input.ds97Profile != null && !isDs97Profile(input.ds97Profile)) {
      throw new BadRequestException(`ds97Profile inválido`);
    }
    if (input.status != null && !isStaffStatus(input.status)) {
      throw new BadRequestException(`status inválido`);
    }

    let person =
      input.personaId != null
        ? await this.repo.findPersonById(input.personaId)
        : null;

    if (!person) {
      if (
        !input.documentType ||
        !input.documentNumber ||
        !input.firstName ||
        !input.lastName
      ) {
        throw new BadRequestException(
          'Indique personaId o datos de documento y nombre',
        );
      }
      person = await this.repo.findPersonByDocument(
        input.documentType,
        input.documentNumber,
      );
      if (!person) {
        person = this.repo.createPerson({
          documentType: input.documentType,
          documentNumber: input.documentNumber,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email ?? null,
          phone: input.phone ?? null,
        });
      } else {
        person.firstName = input.firstName;
        person.lastName = input.lastName;
        if (input.email !== undefined) person.email = input.email ?? null;
        if (input.phone !== undefined) person.phone = input.phone ?? null;
      }
      person = await this.repo.savePerson(person);
    }
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }

    const already = await this.repo.findByPersonaId(person.id);
    if (already) {
      throw new ConflictException(
        `La persona ya tiene expediente ${already.code}`,
      );
    }

    const code = await this.recordCodes.next('PER');

    const staff = this.repo.createStaff({
      code,
      personaId: person.id,
      unit: input.unit,
      ds97Profile: input.ds97Profile ?? null,
      inspectorQualityStatus: 'none',
      appointmentAt: input.appointmentAt ?? null,
      priorToLaw: input.priorToLaw ?? false,
      employeeNumber: input.employeeNumber ?? null,
      workEmail: input.workEmail ?? null,
      status: input.status ?? 'active',
    });
    const saved = await this.repo.saveStaff(staff);

    const checks = art12Checklist().map((requirementCode) =>
      this.repo.createCheck({
        staffId: saved.id,
        requirementCode,
        status: 'missing',
        notes: null,
      }),
    );
    await this.repo.saveChecks(checks);

    return { id: saved.id, code: saved.code };
  }
}
