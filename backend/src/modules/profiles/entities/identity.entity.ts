import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProfileStatus } from '@/common/enums/profile-status.enum';
import { DocumentType } from '@/modules/profiles/enums/document-type.enum';
import { User } from '@/modules/users/entities/user.entity';

/**
 * One row per user (not per role): identity verification is about the
 * person, shared across whichever roles they hold. Spec §19.3/§3 step 2.
 */
@Entity('identities')
export class Identity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ name: 'document_number' })
  documentNumber: string;

  @Column({ name: 'front_url' })
  frontUrl: string;

  @Column({ name: 'back_url', type: 'varchar', nullable: true })
  backUrl: string | null;

  @Column({ name: 'selfie_url' })
  selfieUrl: string;

  @Column({ type: 'date' })
  dob: string;

  @Column({ name: 'address_line1' })
  addressLine1: string;

  @Column({ name: 'address_line2', type: 'varchar', nullable: true })
  addressLine2: string | null;

  @Column({ name: 'postal_code' })
  postalCode: string;

  @Column({
    name: 'kyc_status',
    type: 'enum',
    enum: ProfileStatus,
    default: ProfileStatus.INCOMPLETE,
  })
  kycStatus: ProfileStatus;

  @Column({ name: 'verified_by', type: 'varchar', nullable: true })
  verifiedBy: string | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
