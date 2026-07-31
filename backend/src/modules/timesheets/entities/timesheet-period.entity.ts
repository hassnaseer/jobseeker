import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { TimesheetPeriodStatus } from '@/modules/timesheets/enums/timesheet-period-status.enum';

/** Spec §19.13 — one row per (contract, calendar week). */
@Entity('timesheet_periods')
@Index(['contractId', 'periodStart'], { unique: true })
export class TimesheetPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contract_id' })
  @Index()
  contractId: string;

  @ManyToOne(() => Contract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({ name: 'period_start', type: 'date' })
  periodStart: string;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: string;

  @Column({
    name: 'total_hours',
    type: 'numeric',
    precision: 8,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  totalHours: number;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  totalAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: TimesheetPeriodStatus, default: TimesheetPeriodStatus.OPEN })
  status: TimesheetPeriodStatus;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;
}
