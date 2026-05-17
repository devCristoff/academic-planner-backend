import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { HtSubject } from '@/src/modules/subjects/entities/ht-subject.entity';
import { HtAssignmentHasDefType } from '@/src/modules/assignments/entities/ht-assignment-has-def-type.entity';
import { DateTimeTransformer } from '@/src/common/transformers/datetime.transformer';

@Entity({ name: 'ht_assignment' })
export class HtAssignment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id!: number;

  @Column({ type: 'int', unsigned: true, name: 'ht_subject_id' })
  htSubjectId!: number;

  @Column({ type: 'int', name: 'canvas_id' })
  canvasId!: number;

  @Column({ type: 'text', name: 'title' })
  title!: string;

  @Column({ type: 'longtext', nullable: true, name: 'description' })
  description!: string | null;

  @Column({ type: 'datetime', name: 'date', transformer: new DateTimeTransformer() })
  date!: Date;

  @Column({ type: 'text', nullable: true, name: 'url' })
  url!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'status' })
  status!: string;

  @ManyToOne(() => HtSubject, (s) => s.assignments, { nullable: false })
  @JoinColumn({ name: 'ht_subject_id' })
  subject!: Relation<HtSubject>;

  @OneToMany(() => HtAssignmentHasDefType, (t) => t.assignment)
  typeLinks!: Relation<HtAssignmentHasDefType[]>;
}
