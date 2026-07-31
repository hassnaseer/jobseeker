import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AddScreenshotDto } from '@/modules/timesheets/dto/add-screenshot.dto';
import { CreateCheckInDto } from '@/modules/timesheets/dto/create-checkin.dto';
import { LogManualTimeDto } from '@/modules/timesheets/dto/log-manual-time.dto';
import { TimesheetsService } from '@/modules/timesheets/timesheets.service';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('timesheets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts/:contractId')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Post('time-logs/manual')
  logManual(
    @CurrentUser() seeker: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Body() dto: LogManualTimeDto,
  ) {
    return this.timesheetsService.logManualTime(seeker, contractId, dto);
  }

  @Post('time-logs/timer/start')
  startTimer(@CurrentUser() seeker: User, @Param('contractId', ParseUUIDPipe) contractId: string) {
    return this.timesheetsService.startTimer(seeker, contractId);
  }

  @Post('time-logs/timer/stop')
  stopTimer(@CurrentUser() seeker: User, @Param('contractId', ParseUUIDPipe) contractId: string) {
    return this.timesheetsService.stopTimer(seeker, contractId);
  }

  @Post('time-logs/:entryId/screenshots')
  addScreenshot(
    @CurrentUser() seeker: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('entryId', ParseUUIDPipe) entryId: string,
    @Body() dto: AddScreenshotDto,
  ) {
    return this.timesheetsService.addScreenshot(seeker, contractId, entryId, dto);
  }

  @Get('time-logs')
  listEntries(
    @CurrentUser() user: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Query('periodId') periodId?: string,
  ) {
    return this.timesheetsService.listEntries(user, contractId, periodId);
  }

  @Post('time-logs/:entryId/approve')
  approveEntry(
    @CurrentUser() client: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('entryId', ParseUUIDPipe) entryId: string,
  ) {
    return this.timesheetsService.approveEntry(client, contractId, entryId);
  }

  @Post('time-logs/:entryId/dispute')
  disputeEntry(
    @CurrentUser() client: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('entryId', ParseUUIDPipe) entryId: string,
  ) {
    return this.timesheetsService.disputeEntry(client, contractId, entryId);
  }

  @Get('timesheet-periods')
  listPeriods(@CurrentUser() user: User, @Param('contractId', ParseUUIDPipe) contractId: string) {
    return this.timesheetsService.listPeriods(user, contractId);
  }

  @Post('timesheet-periods/:periodId/close')
  closePeriod(
    @CurrentUser() seeker: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ) {
    return this.timesheetsService.closePeriod(seeker, contractId, periodId);
  }

  @Post('timesheet-periods/:periodId/approve')
  approvePeriod(
    @CurrentUser() client: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ) {
    return this.timesheetsService.approvePeriod(client, contractId, periodId);
  }

  @Post('timesheet-periods/:periodId/dispute')
  disputePeriod(
    @CurrentUser() client: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ) {
    return this.timesheetsService.disputePeriod(client, contractId, periodId);
  }

  @Post('check-ins')
  checkIn(
    @CurrentUser() seeker: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Body() dto: CreateCheckInDto,
  ) {
    return this.timesheetsService.checkIn(seeker, contractId, dto);
  }

  @Get('check-ins')
  listCheckIns(@CurrentUser() user: User, @Param('contractId', ParseUUIDPipe) contractId: string) {
    return this.timesheetsService.listCheckIns(user, contractId);
  }
}
