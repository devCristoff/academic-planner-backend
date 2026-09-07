import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'def_role' })
export class DefRole {
  @PrimaryColumn({ type: 'varchar', length: 50, name: 'id' })
  id!: string;
}
