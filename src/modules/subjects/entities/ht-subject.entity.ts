import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';

@Entity({ name: 'ht_subject' })
export class HtSubject {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id!: number;

  @Column({ type: 'int', unsigned: true, name: 'dt_user_id' })
  dtUserId!: number;

  @Column({ type: 'int', unsigned: true, name: 'dt_academic_term_id' })
  dtAcademicTermId!: number;

  @Column({ type: 'int', unsigned: true, name: 'canvas_id' })
  canvasId!: number;

  @Column({ type: 'varchar', length: 150, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 20, name: 'icon', default: '📄' })
  icon!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'custom_name' })
  customName!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'status' })
  status!: string | null;

  @OneToMany(() => HtAssignment, (a) => a.subject)
  assignments!: Relation<HtAssignment[]>;
}
