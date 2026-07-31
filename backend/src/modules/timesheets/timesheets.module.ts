import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { CheckIn } from '@/modules/timesheets/entities/check-in.entity';
import { TimeLogEntry } from '@/modules/timesheets/entities/time-log-entry.entity';
import { TimesheetPeriod } from '@/modules/timesheets/entities/timesheet-period.entity';
import { TimesheetsController } from '@/modules/timesheets/timesheets.controller';
import { TimesheetsService } from '@/modules/timesheets/timesheets.service';

@Module({
  imports: [TypeOrmModule.forFeature([TimesheetPeriod, TimeLogEntry, CheckIn, Contract])],
  controllers: [TimesheetsController],
  providers: [TimesheetsService],
  exports: [TimesheetsService],
})
export class TimesheetsModule {}
