import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DtUser } from '@/src/modules/auth/entities/dt-user.entity';

@Entity({ name: 'dt_user_otp' })
export class DtUserOtp {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true, name: 'id' })
  id!: number;

  @Column({ type: 'int', unsigned: true, name: 'dt_user_id' })
  dtUserId!: number;

  @Column({ type: 'varchar', length: 64, name: 'code' })
  code!: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'datetime', nullable: true, name: 'used_at' })
  usedAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => DtUser)
  @JoinColumn({ name: 'dt_user_id' })
  user!: DtUser;
}
