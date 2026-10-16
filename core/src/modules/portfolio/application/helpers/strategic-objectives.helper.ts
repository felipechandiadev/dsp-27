import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { StrategicObjective } from '@modules/plan/domain/strategic-objective.entity';
import { PortfolioRepositoryPort } from '../ports/portfolio.repository.port';

export function assertDateRange(
  startsOn?: string | null,
  endsOn?: string | null,
): void {
  if (startsOn && endsOn && endsOn < startsOn) {
    throw new BadRequestException('endsOn debe ser >= startsOn');
  }
}

export async function resolveStrategicObjectives(
  portfolio: PortfolioRepositoryPort,
  ids: string[] | undefined,
): Promise<StrategicObjective[] | undefined> {
  if (ids === undefined) return undefined;
  const unique = [...new Set(ids)];
  const found = await portfolio.findStrategicObjectivesByIds(unique);
  if (found.length !== unique.length) {
    throw new NotFoundException(
      'Uno o más strategicObjectiveIds no existen',
    );
  }
  return found;
}

export function mapObjectiveCodes(objectives?: StrategicObjective[]) {
  return (objectives ?? []).map((o) => ({
    id: o.id,
    code: o.code,
    title: o.title,
  }));
}
