import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { MilestoneStatus } from '@/modules/contracts/enums/milestone-status.enum';

/** Spec §19.11 — fixed-price contracts using pricingModel=MILESTONE. */
@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contract_id' })
  @Index()
  contractId: string;

  @ManyToOne(() => Contract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'int' })
  sequence: number;

  @Column({ type: 'enum', enum: MilestoneStatus, default: MilestoneStatus.PENDING })
  @Index()
  status: MilestoneStatus;

  @Column({ name: 'funded_at', type: 'timestamptz', nullable: true })
  fundedAt: Date | null;

  @Column({ name: 'released_at', type: 'timestamptz', nullable: true })
  releasedAt: Date | null;
}
