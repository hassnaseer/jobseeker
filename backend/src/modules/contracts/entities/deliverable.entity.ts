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
import { DeliverableStatus } from '@/modules/contracts/enums/deliverable-status.enum';

/** Spec §19.12. Each submission attempt is its own row (append-only history). */
@Entity('deliverables')
export class Deliverable {
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

  @ManyToOne(() => Milestone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', array: true, default: '{}' })
  attachments: string[];

  @Column({ type: 'enum', enum: DeliverableStatus, default: DeliverableStatus.SUBMITTED })
  status: DeliverableStatus;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @CreateDateColumn({ name: 'submitted_at', type: 'timestamptz' })
  submittedAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;
}
