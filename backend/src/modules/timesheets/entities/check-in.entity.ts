import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { CheckInType } from '@/modules/timesheets/enums/checkin-type.enum';
import { User } from '@/modules/users/entities/user.entity';

/** Spec §19.15 — physical jobs with checkin_required. */
@Entity('check_ins')
export class CheckIn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contract_id' })
  @Index()
  contractId: string;

  @ManyToOne(() => Contract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({ name: 'seeker_id' })
  @Index()
  seekerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seeker_id' })
  seeker: User;

  @Column({ type: 'enum', enum: CheckInType })
  type: CheckInType;

  @Column({ type: 'numeric', precision: 10, scale: 6, transformer: decimalTransformer })
  latitude: number;

  @Column({ type: 'numeric', precision: 10, scale: 6, transformer: decimalTransformer })
  longitude: number;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'varchar', nullable: true })
  note: string | null;
}
