import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  type Relation,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DtUser } from '@/src/modules/auth/entities/dt-user.entity';

@Entity({ name: 'dt_user_lms_token' })
export class DtUserLmsToken {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id!: number;

  @Column({ type: 'int', unsigned: true, name: 'dt_user_id' })
  dtUserId!: number;

  @Column({ type: 'int', unsigned: true, name: 'dt_academic_term_id' })
  dtAcademicTermId!: number;

  @Column({ type: 'text', name: 'token' })
  token!: string;

  @Column({ type: 'datetime', name: 'valid_from' })
  validFrom!: Date;

  @Column({ type: 'datetime', name: 'valid_to' })
  validTo!: Date;

  @Column({ type: 'varchar', length: 50, name: 'status' })
  status!: string;

  @ManyToOne(() => DtUser, { nullable: false })
  @JoinColumn({ name: 'dt_user_id' })
  user!: Relation<DtUser>;
}
