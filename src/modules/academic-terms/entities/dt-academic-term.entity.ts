import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { DefAcademicTerm } from '@/src/modules/academic-terms/entities/def-academic-term.entity';
import { DateTimeTransformer } from '@/src/common/transformers/datetime.transformer';

@Entity({ name: 'dt_academic_term' })
export class DtAcademicTerm {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id!: number;

  @Column({ type: 'varchar', length: 50, name: 'def_academic_term_id' })
  defAcademicTermId!: string;

  @Column({ type: 'year', name: 'year' })
  year!: number;

  @Column({
    type: 'datetime',
    name: 'valid_from',
    transformer: new DateTimeTransformer(),
  })
  validFrom!: Date;

  @Column({
    type: 'datetime',
    name: 'valid_to',
    transformer: new DateTimeTransformer(),
  })
  validTo!: Date;

  @Column({ type: 'varchar', length: 50, name: 'status' })
  status!: string;

  @ManyToOne(() => DefAcademicTerm, { nullable: false })
  @JoinColumn({ name: 'def_academic_term_id' })
  definition!: Relation<DefAcademicTerm>;
}
