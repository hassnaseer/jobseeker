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
import { Milestone } from '@/modules/contracts/entities/milestone.entity';
import { TransactionMethod } from '@/modules/payments/enums/transaction-method.enum';
import { TransactionStatus } from '@/modules/payments/enums/transaction-status.enum';
import { TransactionType } from '@/modules/payments/enums/transaction-type.enum';
import { User } from '@/modules/users/entities/user.entity';

/** Spec §19.22. */
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contract_id', type: 'uuid', nullable: true })
  @Index()
  contractId: string | null;

  @ManyToOne(() => Contract, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract | null;

  @Column({ name: 'milestone_id', type: 'uuid', nullable: true })
  milestoneId: string | null;

  @ManyToOne(() => Milestone, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone | null;

  @Column({ name: 'payer_id', type: 'uuid', nullable: true })
  @Index()
  payerId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'payer_id' })
  payer: User | null;

  @Column({ name: 'payee_id', type: 'uuid', nullable: true })
  @Index()
  payeeId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'payee_id' })
  payee: User | null;

  @Column({ type: 'enum', enum: TransactionType })
  @Index()
  type: TransactionType;

  @Column({ type: 'numeric', precision: 14, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({
    name: 'client_fee',
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  clientFee: number;

  @Column({
    name: 'seeker_fee',
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  seekerFee: number;

  @Column({
    name: 'net_amount',
    type: 'numeric',
    precision: 14,
    scale: 2,
    transformer: decimalTransformer,
  })
  netAmount: number;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: TransactionMethod })
  method: TransactionMethod;

  @Column({ name: 'stripe_ref', type: 'varchar', nullable: true })
  stripeRef: string | null;

  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  @Index()
  status: TransactionStatus;

  @Column({ name: 'failure_reason', type: 'varchar', nullable: true })
  failureReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
