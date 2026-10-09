import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'record_code_sequences' })
export class RecordCodeSequence {
  @PrimaryColumn({ type: 'varchar', length: 3 })
  prefix: string;

  @PrimaryColumn({ type: 'smallint' })
  year: number;

  @Column({ name: 'last_value', type: 'int', default: 0 })
  lastValue: number;
}
