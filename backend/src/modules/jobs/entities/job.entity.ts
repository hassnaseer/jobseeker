import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { ExperienceLevel } from '@/common/enums/experience-level.enum';
import { Category } from '@/modules/categories/entities/category.entity';
import { JobDuration } from '@/modules/jobs/enums/job-duration.enum';
import { JobStatus } from '@/modules/jobs/enums/job-status.enum';
import { JobType } from '@/modules/jobs/enums/job-type.enum';
import { LocationType } from '@/modules/jobs/enums/location-type.enum';
import { PricingModel } from '@/modules/jobs/enums/pricing-model.enum';
import { TrackingMode } from '@/modules/jobs/enums/tracking-mode.enum';
import { User } from '@/modules/users/entities/user.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  @Index()
  clientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'category_id' })
  @Index()
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'skills_required', type: 'text', array: true, default: '{}' })
  skillsRequired: string[];

  @Column({ name: 'job_type', type: 'enum', enum: JobType })
  jobType: JobType;

  /** Fixed jobs only — client picks lump sum vs milestones (spec §5.1). */
  @Column({ name: 'pricing_model', type: 'enum', enum: PricingModel, nullable: true })
  pricingModel: PricingModel | null;

  /** Hourly jobs only — client picks the capture mode (spec §5.2/§7). */
  @Column({ name: 'tracking_mode', type: 'enum', enum: TrackingMode, nullable: true })
  trackingMode: TrackingMode | null;

  @Column({ name: 'location_type', type: 'enum', enum: LocationType })
  locationType: LocationType;

  /** Snapshotted from the posting client's profile country at creation time; lets seekers filter/browse by country regardless of locationType. */
  @Column({ type: 'varchar', length: 2, nullable: true })
  @Index()
  country: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 6,
    nullable: true,
    transformer: decimalTransformer,
  })
  latitude: number | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 6,
    nullable: true,
    transformer: decimalTransformer,
  })
  longitude: number | null;

  @Column({
    name: 'radius_km',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  radiusKm: number | null;

  /** Physical jobs only, client's choice per job (spec §5.3). */
  @Column({ name: 'checkin_required', default: false })
  checkinRequired: boolean;

  /** Fixed jobs only — total lump amount, or milestone budget envelope. */
  @Column({
    name: 'budget_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  budgetAmount: number | null;

  @Column({ default: 'USD' })
  currency: string;

  @Column({
    name: 'hourly_rate_min',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  hourlyRateMin: number | null;

  @Column({
    name: 'hourly_rate_max',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  hourlyRateMax: number | null;

  @Column({ name: 'estimated_hours', type: 'int', nullable: true })
  estimatedHours: number | null;

  @Column({ type: 'enum', enum: JobDuration, nullable: true })
  duration: JobDuration | null;

  @Column({ name: 'experience_level', type: 'enum', enum: ExperienceLevel, nullable: true })
  experienceLevel: ExperienceLevel | null;

  @Column({ type: 'text', array: true, default: '{}' })
  attachments: string[];

  @Column({ name: 'number_of_openings', type: 'int', default: 1 })
  numberOfOpenings: number;

  /** Openings filled so far (incremented on each hire()); job stays OPEN to new applicants until this reaches numberOfOpenings. */
  @Column({ name: 'hired_count', type: 'int', default: 0 })
  hiredCount: number;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  @Index()
  status: JobStatus;

  /** Hidden from public listings while true, without losing OPEN status; spec §5.4 "pause". */
  @Column({ name: 'is_paused', default: false })
  isPaused: boolean;

  @Column({ default: false })
  featured: boolean;

  @Column({ name: 'views_count', type: 'int', default: 0 })
  viewsCount: number;

  /** Written by the Applications module once it exists; stays 0 until then. */
  @Column({ name: 'applications_count', type: 'int', default: 0 })
  applicationsCount: number;

  @Column({ name: 'deadline', type: 'timestamptz', nullable: true })
  deadline: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
