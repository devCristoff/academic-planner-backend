import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { AssignmentType } from '@/src/common/enums/assignment.enum';
import { HtAssignment } from '@/src/modules/assignments/entities/ht-assignment.entity';

@Entity({ name: 'ht_assignment_has_def_type' })
export class HtAssignmentHasDefType {
  @PrimaryColumn({ type: 'int', unsigned: true, name: 'ht_assignment_id' })
  htAssignmentId!: number;

  @PrimaryColumn({ type: 'varchar', length: 50, name: 'def_type_id' })
  defTypeId!: AssignmentType;

  @ManyToOne(() => HtAssignment, (a) => a.typeLinks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ht_assignment_id' })
  assignment!: Relation<HtAssignment>;
}
