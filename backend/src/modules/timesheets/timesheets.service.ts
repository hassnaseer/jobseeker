import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { ContractStatus } from '@/modules/contracts/enums/contract-status.enum';
import { JobType } from '@/modules/jobs/enums/job-type.enum';
import { TrackingMode } from '@/modules/jobs/enums/tracking-mode.enum';
import { AddScreenshotDto } from '@/modules/timesheets/dto/add-screenshot.dto';
import { CreateCheckInDto } from '@/modules/timesheets/dto/create-checkin.dto';
import { LogManualTimeDto } from '@/modules/timesheets/dto/log-manual-time.dto';
import { CheckIn } from '@/modules/timesheets/entities/check-in.entity';
import { TimeLogEntry } from '@/modules/timesheets/entities/time-log-entry.entity';
import { TimesheetPeriod } from '@/modules/timesheets/entities/timesheet-period.entity';
import { TimeLogEntryStatus } from '@/modules/timesheets/enums/time-log-entry-status.enum';
import { TimeLogEntryType } from '@/modules/timesheets/enums/time-log-entry-type.enum';
import { TimesheetPeriodStatus } from '@/modules/timesheets/enums/timesheet-period-status.enum';
import { User } from '@/modules/users/entities/user.entity';

function getWeekBounds(date: Date): { start: string; end: string } {
  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) };
}

@Injectable()
export class TimesheetsService {
  constructor(
    @InjectRepository(TimesheetPeriod)
    private readonly periodRepository: Repository<TimesheetPeriod>,
    @InjectRepository(TimeLogEntry)
    private readonly entryRepository: Repository<TimeLogEntry>,
    @InjectRepository(CheckIn)
    private readonly checkInRepository: Repository<CheckIn>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
  ) {}

  private async findContractOrFail(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({ where: { id } });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }
    return contract;
  }

  private assertParty(contract: Contract, user: User): void {
    if (
      contract.clientId !== user.id &&
      contract.seekerId !== user.id &&
      !user.roles.includes(UserRole.SUPER_ADMIN)
    ) {
      throw new ForbiddenException('You are not a party to this contract');
    }
  }

  private assertSeeker(contract: Contract, user: User): void {
    if (contract.seekerId !== user.id && !user.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only the contracted seeker can do this');
    }
  }

  private assertClient(contract: Contract, user: User): void {
    if (contract.clientId !== user.id && !user.roles.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only the hiring client can do this');
    }
  }

  private assertHourlyActive(contract: Contract): void {
    if (contract.type !== JobType.HOURLY) {
      throw new BadRequestException('Timesheets only apply to HOURLY contracts');
    }
    if (contract.status !== ContractStatus.ACTIVE) {
      throw new ConflictException('This contract is not currently active');
    }
  }

  private async getOrCreateOpenPeriod(contract: Contract, forDate: Date): Promise<TimesheetPeriod> {
    const { start, end } = getWeekBounds(forDate);
    let period = await this.periodRepository.findOne({
      where: { contractId: contract.id, periodStart: start },
    });

    if (period && period.status !== TimesheetPeriodStatus.OPEN) {
      throw new ConflictException(
        'The timesheet period for this date has already been closed for review',
      );
    }

    if (!period) {
      period = await this.periodRepository.save(
        this.periodRepository.create({
          contractId: contract.id,
          periodStart: start,
          periodEnd: end,
          currency: contract.currency,
        }),
      );
    }

    return period;
  }

  /** Recomputes from a fresh sum rather than incremental math, to avoid drift. */
  private async recomputePeriodTotals(period: TimesheetPeriod, contract: Contract): Promise<void> {
    const result = await this.entryRepository
      .createQueryBuilder('entry')
      .select('COALESCE(SUM(entry.hours), 0)', 'sum')
      .where('entry.timesheetId = :periodId', { periodId: period.id })
      .andWhere('entry.status != :disputed', { disputed: TimeLogEntryStatus.DISPUTED })
      .getRawOne<{ sum: string }>();

    period.totalHours = parseFloat(result?.sum ?? '0');
    period.totalAmount = period.totalHours * (contract.agreedHourlyRate ?? 0);
    await this.periodRepository.save(period);
  }

  private assertWithinWeeklyLimit(
    contract: Contract,
    period: TimesheetPeriod,
    additionalHours: number,
  ): void {
    if (
      contract.weeklyHourLimit !== null &&
      period.totalHours + additionalHours > contract.weeklyHourLimit
    ) {
      throw new BadRequestException(
        `This would exceed the contract's weekly hour limit of ${contract.weeklyHourLimit}h`,
      );
    }
  }

  // ---- Manual entries ----

  async logManualTime(
    seeker: User,
    contractId: string,
    dto: LogManualTimeDto,
  ): Promise<TimeLogEntry> {
    const contract = await this.findContractOrFail(contractId);
    this.assertSeeker(contract, seeker);
    this.assertHourlyActive(contract);

    let hours: number;
    let startTime: Date | null = null;
    let endTime: Date | null = null;
    let referenceDate: Date;

    if (dto.startTime && dto.endTime) {
      startTime = new Date(dto.startTime);
      endTime = new Date(dto.endTime);
      if (endTime <= startTime) {
        throw new BadRequestException('endTime must be after startTime');
      }
      hours = (endTime.getTime() - startTime.getTime()) / 3_600_000;
      referenceDate = startTime;
    } else if (dto.hours !== undefined) {
      hours = dto.hours;
      referenceDate = dto.date ? new Date(dto.date) : new Date();
    } else {
      throw new BadRequestException('Provide either startTime+endTime, or hours directly');
    }

    const period = await this.getOrCreateOpenPeriod(contract, referenceDate);
    this.assertWithinWeeklyLimit(contract, period, hours);

    const entry = await this.entryRepository.save(
      this.entryRepository.create({
        timesheetId: period.id,
        contractId: contract.id,
        entryType: TimeLogEntryType.MANUAL,
        startTime,
        endTime,
        hours,
        description: dto.description,
        status: TimeLogEntryStatus.PENDING,
      }),
    );

    await this.recomputePeriodTotals(period, contract);
    return entry;
  }

  // ---- Timer entries ----

  async startTimer(seeker: User, contractId: string): Promise<TimeLogEntry> {
    const contract = await this.findContractOrFail(contractId);
    this.assertSeeker(contract, seeker);
    this.assertHourlyActive(contract);

    const running = await this.entryRepository.findOne({
      where: { contractId, entryType: TimeLogEntryType.TIMER, endTime: IsNull() },
    });
    if (running) {
      throw new ConflictException('A timer is already running for this contract — stop it first');
    }

    const now = new Date();
    const period = await this.getOrCreateOpenPeriod(contract, now);

    return this.entryRepository.save(
      this.entryRepository.create({
        timesheetId: period.id,
        contractId: contract.id,
        entryType: TimeLogEntryType.TIMER,
        startTime: now,
        endTime: null,
        hours: null,
        status: TimeLogEntryStatus.PENDING,
      }),
    );
  }

  async stopTimer(seeker: User, contractId: string): Promise<TimeLogEntry> {
    const contract = await this.findContractOrFail(contractId);
    this.assertSeeker(contract, seeker);

    const running = await this.entryRepository.findOne({
      where: { contractId, entryType: TimeLogEntryType.TIMER, endTime: IsNull() },
      order: { createdAt: 'DESC' },
    });
    if (!running) {
      throw new NotFoundException('No running timer found for this contract');
    }

    const endTime = new Date();
    const hours = (endTime.getTime() - running.startTime!.getTime()) / 3_600_000;
    const period = await this.periodRepository.findOneOrFail({
      where: { id: running.timesheetId },
    });
    this.assertWithinWeeklyLimit(contract, period, hours);

    running.endTime = endTime;
    running.hours = hours;
    await this.entryRepository.save(running);
    await this.recomputePeriodTotals(period, contract);

    return running;
  }

  async addScreenshot(
    seeker: User,
    contractId: string,
    entryId: string,
    dto: AddScreenshotDto,
  ): Promise<TimeLogEntry> {
    const contract = await this.findContractOrFail(contractId);
    this.assertSeeker(contract, seeker);
    if (contract.trackingMode !== TrackingMode.TIMER_WITH_SCREENSHOTS) {
      throw new BadRequestException('This contract does not use screenshot tracking');
    }

    const entry = await this.entryRepository.findOne({ where: { id: entryId, contractId } });
    if (!entry || entry.entryType !== TimeLogEntryType.TIMER) {
      throw new NotFoundException('Timer entry not found');
    }

    entry.screenshotUrls = [...entry.screenshotUrls, dto.url];
    return this.entryRepository.save(entry);
  }

  // ---- Listing ----

  async listEntries(user: User, contractId: string, periodId?: string): Promise<TimeLogEntry[]> {
    const contract = await this.findContractOrFail(contractId);
    this.assertParty(contract, user);
    return this.entryRepository.find({
      where: periodId ? { contractId, timesheetId: periodId } : { contractId },
      order: { createdAt: 'DESC' },
    });
  }

  async listPeriods(user: User, contractId: string): Promise<TimesheetPeriod[]> {
    const contract = await this.findContractOrFail(contractId);
    this.assertParty(contract, user);
    return this.periodRepository.find({ where: { contractId }, order: { periodStart: 'DESC' } });
  }

  // ---- Period lifecycle (spec §7) ----

  async closePeriod(seeker: User, contractId: string, periodId: string): Promise<TimesheetPeriod> {
    const contract = await this.findContractOrFail(contractId);
    this.assertSeeker(contract, seeker);

    const period = await this.periodRepository.findOne({ where: { id: periodId, contractId } });
    if (!period) {
      throw new NotFoundException('Timesheet period not found');
    }
    if (period.status !== TimesheetPeriodStatus.OPEN) {
      throw new ConflictException('This period is not open');
    }

    const runningTimer = await this.entryRepository.findOne({
      where: { timesheetId: period.id, entryType: TimeLogEntryType.TIMER, endTime: IsNull() },
    });
    if (runningTimer) {
      throw new ConflictException('Stop the running timer before closing this period');
    }

    period.status = TimesheetPeriodStatus.PENDING;
    return this.periodRepository.save(period);
  }

  async approveEntry(client: User, contractId: string, entryId: string): Promise<TimeLogEntry> {
    const contract = await this.findContractOrFail(contractId);
    this.assertClient(contract, client);

    const entry = await this.entryRepository.findOne({ where: { id: entryId, contractId } });
    if (!entry) {
      throw new NotFoundException('Time log entry not found');
    }
    const period = await this.periodRepository.findOneOrFail({ where: { id: entry.timesheetId } });
    if (period.status !== TimesheetPeriodStatus.PENDING) {
      throw new ConflictException('This entry is not currently under review');
    }

    entry.status = TimeLogEntryStatus.APPROVED;
    return this.entryRepository.save(entry);
  }

  async disputeEntry(client: User, contractId: string, entryId: string): Promise<TimeLogEntry> {
    const contract = await this.findContractOrFail(contractId);
    this.assertClient(contract, client);

    const entry = await this.entryRepository.findOne({ where: { id: entryId, contractId } });
    if (!entry) {
      throw new NotFoundException('Time log entry not found');
    }
    const period = await this.periodRepository.findOneOrFail({ where: { id: entry.timesheetId } });
    if (period.status !== TimesheetPeriodStatus.PENDING) {
      throw new ConflictException('This entry is not currently under review');
    }

    entry.status = TimeLogEntryStatus.DISPUTED;
    await this.entryRepository.save(entry);
    await this.recomputePeriodTotals(period, contract);
    return entry;
  }

  /**
   * Bulk-approves everything still pending and finalizes the period. Spec
   * §13.1 bills approved hours × rate — that charge is the Payments
   * module's job, wrapping this same transition once it exists.
   */
  async approvePeriod(
    client: User,
    contractId: string,
    periodId: string,
  ): Promise<TimesheetPeriod> {
    const contract = await this.findContractOrFail(contractId);
    this.assertClient(contract, client);

    const period = await this.periodRepository.findOne({ where: { id: periodId, contractId } });
    if (!period) {
      throw new NotFoundException('Timesheet period not found');
    }
    if (period.status !== TimesheetPeriodStatus.PENDING) {
      throw new ConflictException('This period is not awaiting review');
    }

    await this.entryRepository
      .createQueryBuilder()
      .update(TimeLogEntry)
      .set({ status: TimeLogEntryStatus.APPROVED })
      .where('timesheetId = :periodId AND status = :pending', {
        periodId,
        pending: TimeLogEntryStatus.PENDING,
      })
      .execute();

    await this.recomputePeriodTotals(period, contract);
    period.status = TimesheetPeriodStatus.APPROVED;
    period.approvedAt = new Date();
    return this.periodRepository.save(period);
  }

  async disputePeriod(
    client: User,
    contractId: string,
    periodId: string,
  ): Promise<TimesheetPeriod> {
    const contract = await this.findContractOrFail(contractId);
    this.assertClient(contract, client);

    const period = await this.periodRepository.findOne({ where: { id: periodId, contractId } });
    if (!period) {
      throw new NotFoundException('Timesheet period not found');
    }
    if (period.status !== TimesheetPeriodStatus.PENDING) {
      throw new ConflictException('This period is not awaiting review');
    }

    period.status = TimesheetPeriodStatus.DISPUTED;
    return this.periodRepository.save(period);
  }

  // ---- Check-ins (spec §19.15) ----

  async checkIn(seeker: User, contractId: string, dto: CreateCheckInDto): Promise<CheckIn> {
    const contract = await this.findContractOrFail(contractId);
    this.assertSeeker(contract, seeker);
    if (!contract.checkinRequired) {
      throw new BadRequestException('This contract does not require on-site check-in');
    }

    return this.checkInRepository.save(
      this.checkInRepository.create({
        contractId,
        seekerId: seeker.id,
        type: dto.type,
        latitude: dto.latitude,
        longitude: dto.longitude,
        note: dto.note ?? null,
      }),
    );
  }

  async listCheckIns(user: User, contractId: string): Promise<CheckIn[]> {
    const contract = await this.findContractOrFail(contractId);
    this.assertParty(contract, user);
    return this.checkInRepository.find({ where: { contractId }, order: { timestamp: 'DESC' } });
  }
}
