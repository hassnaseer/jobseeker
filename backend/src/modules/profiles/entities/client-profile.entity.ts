import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Spec §19.4. `categories[]` from the spec is intentionally not duplicated
 * here — it's represented by UserCategory rows (role=CLIENT), which the
 * Categories module already owns as the single source of truth.
 */
@Entity('client_profiles')
export class ClientProfile {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'company_type', type: 'varchar', nullable: true })
  companyType: string | null;

  @Column({ name: 'registration_number', type: 'varchar', nullable: true })
  registrationNumber: string | null;

  @Column({ name: 'tax_id', type: 'varchar', nullable: true })
  taxId: string | null;

  @Column({ type: 'varchar', nullable: true })
  website: string | null;

  @Column({ type: 'varchar', nullable: true })
  industry: string | null;

  @Column({ name: 'company_size', type: 'varchar', nullable: true })
  companySize: string | null;

  @Column({ name: 'company_address', type: 'varchar', nullable: true })
  companyAddress: string | null;

  @Column({ name: 'company_logo_url', type: 'varchar', nullable: true })
  companyLogoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  about: string | null;

  /** Aggregate fields — computed and written by the Reviews module, not client-editable. */
  @Column({
    name: 'avg_rating',
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  avgRating: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
