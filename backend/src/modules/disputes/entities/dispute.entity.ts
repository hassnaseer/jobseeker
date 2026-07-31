import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { Milestone } from '@/modules/contracts/entities/milestone.entity';
import { DisputeResolutionType } from '@/modules/disputes/enums/dispute-resolution-type.enum';
import { DisputeStatus } from '@/modules/disputes/enums/dispute-status.enum';
import { User } from '@/modules/users/entities/user.entity';

/** Spec §19.30 and §14 — funds stay held (contract/milestone frozen) from raise until SA resolution. */
@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contract_id' })
  @Index()
  contractId: string;

  @ManyToOne(() => Contract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({ name: 'milestone_id', type: 'uuid', nullable: true })
  milestoneId: string | null;

  @ManyToOne(() => Milestone, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone | null;

  @Column({ name: 'raised_by' })
  raisedBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'raised_by' })
  raiser: User;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', array: true, default: '{}' })
  evidence: string[];

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPEN })
  @Index()
  status: DisputeStatus;

  @Column({ name: 'resolution_type', type: 'enum', enum: DisputeResolutionType, nullable: true })
  resolutionType: DisputeResolutionType | null;

  @Column({ name: 'resolution_note', type: 'text', nullable: true })
  resolutionNote: string | null;

  @Column({ name: 'resolved_by', type: 'uuid', nullable: true })
  resolvedBy: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
