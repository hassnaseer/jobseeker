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
import { PayoutMethod } from '@/modules/payments/entities/payout-method.entity';
import { Wallet } from '@/modules/payments/entities/wallet.entity';
import { WithdrawalStatus } from '@/modules/payments/enums/withdrawal-status.enum';
import { User } from '@/modules/users/entities/user.entity';

/** Spec §19.24/§13.3. */
@Entity('withdrawal_requests')
export class WithdrawalRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ type: 'numeric', precision: 14, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column()
  currency: string;

  @Column({ name: 'payout_method_id' })
  payoutMethodId: string;

  @ManyToOne(() => PayoutMethod, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payout_method_id' })
  payoutMethod: PayoutMethod;

  @Column({ type: 'enum', enum: WithdrawalStatus, default: WithdrawalStatus.REQUESTED })
  @Index()
  status: WithdrawalStatus;

  @Column({ name: 'failure_reason', type: 'varchar', nullable: true })
  failureReason: string | null;

  @CreateDateColumn({ name: 'requested_at', type: 'timestamptz' })
  requestedAt: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;
}
