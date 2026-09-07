import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { DtUserHasDefRole } from '@/src/modules/auth/entities/dt-user-has-def-role.entity';

@Entity({ name: 'dt_user' })
export class DtUser {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'int', unsigned: true, name: 'canvas_id' })
  canvasId!: number;

  @Index({ unique: true })
  @Column({ type: 'nvarchar', length: 100, name: 'tuition_id' })
  tuitionId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, name: 'email' })
  email!: string;

  @Column({ type: 'varchar', length: 100, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 200, name: 'last_name' })
  lastName!: string;

  @Column({ type: 'text', nullable: true, name: 'avatar_url' })
  avatarUrl!: string | null;

  @OneToMany(() => DtUserHasDefRole, (r) => r.user)
  roleLinks!: Relation<DtUserHasDefRole[]>;
}
