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
import { TimesheetPeriod } from '@/modules/timesheets/entities/timesheet-period.entity';
import { TimeLogEntryStatus } from '@/modules/timesheets/enums/time-log-entry-status.enum';
import { TimeLogEntryType } from '@/modules/timesheets/enums/time-log-entry-type.enum';

/** Spec §19.14. */
@Entity('time_log_entries')
export class TimeLogEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'timesheet_id' })
  @Index()
  timesheetId: string;

  @ManyToOne(() => TimesheetPeriod, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timesheet_id' })
  timesheet: TimesheetPeriod;

  @Column({ name: 'contract_id' })
  @Index()
  contractId: string;

  @ManyToOne(() => Contract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({ name: 'entry_type', type: 'enum', enum: TimeLogEntryType })
  entryType: TimeLogEntryType;

  @Column({ name: 'start_time', type: 'timestamptz', nullable: true })
  startTime: Date | null;

  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime: Date | null;

  @Column({
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  hours: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'screenshot_urls', type: 'text', array: true, default: '{}' })
  screenshotUrls: string[];

  @Column({ type: 'enum', enum: TimeLogEntryStatus, default: TimeLogEntryStatus.PENDING })
  status: TimeLogEntryStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
