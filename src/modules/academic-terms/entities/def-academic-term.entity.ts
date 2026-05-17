import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'def_academic_term' })
export class DefAcademicTerm {
  @PrimaryColumn({ type: 'varchar', length: 50, name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 60, name: 'alias' })
  alias!: string;

  @Column({ type: 'tinyint', unsigned: true, name: 'since' })
  since!: number;

  @Column({ type: 'tinyint', unsigned: true, name: 'until' })
  until!: number;
}
