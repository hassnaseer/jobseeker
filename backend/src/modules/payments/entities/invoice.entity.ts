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
import { Transaction } from '@/modules/payments/entities/transaction.entity';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Spec §19.26. pdf_url is left null for now — rendering + uploading an
 * actual PDF needs the file-storage layer (S3), which isn't built yet
 * anywhere in this project; every other "*_url" field in the codebase
 * has the same placeholder-string boundary today.
 */
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contract_id' })
  @Index()
  contractId: string;

  @ManyToOne(() => Contract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @ManyToOne(() => Transaction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ name: 'party_id' })
  @Index()
  partyId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'party_id' })
  party: User;

  @Column({ unique: true })
  number: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, transformer: decimalTransformer })
  amount: number;

  @Column({
    name: 'tax_amount',
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  taxAmount: number;

  @Column()
  currency: string;

  @Column({ name: 'pdf_url', type: 'varchar', nullable: true })
  pdfUrl: string | null;

  @CreateDateColumn({ name: 'issued_at', type: 'timestamptz' })
  issuedAt: Date;
}
