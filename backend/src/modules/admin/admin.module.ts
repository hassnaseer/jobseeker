import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAnalyticsController } from '@/modules/admin/admin-analytics.controller';
import { AdminModerationController } from '@/modules/admin/admin-moderation.controller';
import { AdminReportsController } from '@/modules/admin/admin-reports.controller';
import { AdminUsersController } from '@/modules/admin/admin-users.controller';
import { AuditLogService } from '@/modules/admin/audit-log.service';
import { AuditLog } from '@/modules/admin/entities/audit-log.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { CatalogsModule } from '@/modules/catalogs/catalogs.module';
import { Report } from '@/modules/chat/entities/report.entity';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { Job } from '@/modules/jobs/entities/job.entity';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { Transaction } from '@/modules/payments/entities/transaction.entity';
import { User } from '@/modules/users/entities/user.entity';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, Report, User, Job, Contract, Transaction]),
    UsersModule,
    AuthModule,
    JobsModule,
    CatalogsModule,
  ],
  controllers: [
    AdminUsersController,
    AdminModerationController,
    AdminReportsController,
    AdminAnalyticsController,
  ],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AdminModule {}
