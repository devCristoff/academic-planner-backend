import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { DtUser } from '@/src/modules/auth/entities/dt-user.entity';
import { DefRole } from '@/src/modules/auth/entities/def-role.entity';

@Entity({ name: 'dt_user_has_def_role' })
export class DtUserHasDefRole {
  @PrimaryColumn({ type: 'int', unsigned: true, name: 'dt_user_id' })
  dtUserId!: number;

  @PrimaryColumn({ type: 'varchar', length: 50, name: 'def_role_id' })
  defRoleId!: string;

  @ManyToOne(() => DtUser, (u) => u.roleLinks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dt_user_id' })
  user!: Relation<DtUser>;

  @ManyToOne(() => DefRole, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'def_role_id' })
  role!: Relation<DefRole>;
}
