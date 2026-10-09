import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  formatRecordCode,
  isRecordCodePrefix,
  type RecordCodePrefix,
} from '../domain/record-code-prefix';

@Injectable()
export class RecordCodeService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Genera el siguiente folio: TTT + AA + NNNNNN (p. ej. PRY26000001).
   * Seguro bajo concurrencia vía UPSERT atómico en Postgres.
   */
  async next(prefix: RecordCodePrefix | string, year?: number): Promise<string> {
    const p = prefix.toUpperCase();
    if (!isRecordCodePrefix(p)) {
      throw new BadRequestException(`Prefijo de código inválido: ${prefix}`);
    }
    const y = year ?? new Date().getFullYear();
    if (!Number.isInteger(y) || y < 2000 || y > 2100) {
      throw new BadRequestException(`Año inválido: ${y}`);
    }

    const rows = await this.dataSource.query(
      `
      INSERT INTO record_code_sequences (prefix, year, last_value)
      VALUES ($1, $2, 1)
      ON CONFLICT (prefix, year)
      DO UPDATE SET last_value = record_code_sequences.last_value + 1
      RETURNING last_value
      `,
      [p, y],
    ) as Array<{ last_value: number }>;

    const seq = Number(rows[0]?.last_value);
    if (!Number.isFinite(seq) || seq < 1) {
      throw new BadRequestException('No se pudo generar el código');
    }
    return formatRecordCode(p, y, seq);
  }

  /**
   * Asegura que la secuencia quede al menos en `minValue`
   * (útil tras seed con códigos legados del mismo año/prefijo).
   */
  async ensureAtLeast(
    prefix: RecordCodePrefix | string,
    year: number,
    minValue: number,
  ): Promise<void> {
    const p = prefix.toUpperCase();
    if (!isRecordCodePrefix(p)) return;
    if (minValue < 0) return;
    await this.dataSource.query(
      `
      INSERT INTO record_code_sequences (prefix, year, last_value)
      VALUES ($1, $2, $3)
      ON CONFLICT (prefix, year)
      DO UPDATE SET last_value = GREATEST(record_code_sequences.last_value, EXCLUDED.last_value)
      `,
      [p, year, minValue],
    );
  }
}
