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
import { SeekerAvailability } from '@/modules/profiles/enums/availability.enum';
import { ExperienceLevel } from '@/modules/profiles/enums/experience-level.enum';
import { User } from '@/modules/users/entities/user.entity';

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

export interface WorkHistoryItem {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface PortfolioItem {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

/** Spec §19.5. `categories[]` lives in UserCategory (role=SEEKER), not here. */
@Entity('seeker_profiles')
export class SeekerProfile {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  bio: string;

  @Column({ type: 'text', array: true, default: '{}' })
  skills: string[];

  @Column({
    name: 'hourly_rate',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  hourlyRate: number | null;

  @Column({ type: 'varchar', nullable: true, default: 'USD' })
  currency: string;

  @Column({ name: 'experience_level', type: 'enum', enum: ExperienceLevel, nullable: true })
  experienceLevel: ExperienceLevel | null;

  @Column({ type: 'text', array: true, default: '{}' })
  languages: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  education: EducationItem[];

  @Column({ name: 'work_history', type: 'jsonb', default: () => "'[]'" })
  workHistory: WorkHistoryItem[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  portfolio: PortfolioItem[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  certifications: CertificationItem[];

  @Column({ type: 'enum', enum: SeekerAvailability, nullable: true })
  availability: SeekerAvailability | null;

  @Column({ name: 'max_concurrent_contracts', type: 'int', nullable: true })
  maxConcurrentContracts: number | null;

  /** Aggregate fields — computed and written by Reviews/Contracts/Payments modules, not client-editable. */
  @Column({
    name: 'avg_rating',
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  avgRating: number;

  @Column({ name: 'total_jobs', type: 'int', default: 0 })
  totalJobs: number;

  @Column({
    name: 'total_earnings',
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  totalEarnings: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
