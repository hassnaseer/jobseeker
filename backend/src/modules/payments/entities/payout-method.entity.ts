import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConnectStatus } from '@/modules/payments/enums/connect-status.enum';
import { PayoutMethodType } from '@/modules/payments/enums/payout-method-type.enum';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Spec §19.25. Bank details would be encrypted at rest in a real
 * deployment (e.g. via a KMS-backed column encryption layer); flagged
 * here rather than hand-rolled, since getting encryption-at-rest wrong
 * is worse than deferring it to real infra.
 */
@Entity('payout_methods')
export class PayoutMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: PayoutMethodType })
  type: PayoutMethodType;

  @Column({ name: 'stripe_account_id', type: 'varchar', nullable: true })
  stripeAccountId: string | null;

  @Column({ name: 'connect_status', type: 'enum', enum: ConnectStatus, nullable: true })
  connectStatus: ConnectStatus | null;

  @Column({ name: 'bank_name', type: 'varchar', nullable: true })
  bankName: string | null;

  @Column({ name: 'account_holder', type: 'varchar', nullable: true })
  accountHolder: string | null;

  /** TODO: encrypt at rest before handling real bank data in production. */
  @Column({ name: 'account_number', type: 'varchar', nullable: true })
  accountNumber: string | null;

  @Column({ name: 'swift_or_routing', type: 'varchar', nullable: true })
  swiftOrRouting: string | null;

  @Column({ type: 'varchar', nullable: true })
  currency: string | null;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
