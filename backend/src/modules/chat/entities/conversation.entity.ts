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
import { Job } from '@/modules/jobs/entities/job.entity';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Spec §19.16/§6.2. Always exactly two parties (client, seeker) — either
 * a pre-hire inquiry thread (jobId set, contractId null) or a per-contract
 * workroom (contractId set), per spec §6.2's "separate from pre-hire
 * inquiry chat" distinction.
 */
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_id', type: 'uuid', nullable: true })
  @Index()
  jobId: string | null;

  @ManyToOne(() => Job, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'job_id' })
  job: Job | null;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  @Index()
  contractId: string | null;

  @ManyToOne(() => Contract, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract | null;

  @Column({ name: 'client_id' })
  @Index()
  clientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ name: 'seeker_id' })
  @Index()
  seekerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seeker_id' })
  seeker: User;

  @Column({ name: 'initiated_by' })
  initiatedBy: string;

  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  @Column({ name: 'blocked_by', type: 'uuid', nullable: true })
  blockedBy: string | null;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
