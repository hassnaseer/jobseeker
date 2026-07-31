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
import { Application } from '@/modules/applications/entities/application.entity';
import { ContractStatus } from '@/modules/contracts/enums/contract-status.enum';
import { Job } from '@/modules/jobs/entities/job.entity';
import { JobType } from '@/modules/jobs/enums/job-type.enum';
import { PricingModel } from '@/modules/jobs/enums/pricing-model.enum';
import { TrackingMode } from '@/modules/jobs/enums/tracking-mode.enum';
import { User } from '@/modules/users/entities/user.entity';

/** Spec §19.10. */
@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_id' })
  @Index()
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'client_id' })
  @Index()
  clientId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ name: 'seeker_id' })
  @Index()
  seekerId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seeker_id' })
  seeker: User;

  @Column({ name: 'application_id', unique: true })
  applicationId: string;

  @ManyToOne(() => Application, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ type: 'enum', enum: JobType })
  type: JobType;

  @Column({ name: 'pricing_model', type: 'enum', enum: PricingModel, nullable: true })
  pricingModel: PricingModel | null;

  @Column({
    name: 'agreed_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  agreedAmount: number | null;

  @Column({
    name: 'agreed_hourly_rate',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  agreedHourlyRate: number | null;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'tracking_mode', type: 'enum', enum: TrackingMode, nullable: true })
  trackingMode: TrackingMode | null;

  @Column({ name: 'weekly_hour_limit', type: 'int', nullable: true })
  weeklyHourLimit: number | null;

  @Column({ name: 'checkin_required', default: false })
  checkinRequired: boolean;

  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.PENDING_FUNDING })
  @Index()
  status: ContractStatus;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
