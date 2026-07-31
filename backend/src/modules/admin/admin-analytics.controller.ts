import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { DateRangeDto } from '@/modules/admin/dto/date-range.dto';
import { Job } from '@/modules/jobs/entities/job.entity';
import { Transaction } from '@/modules/payments/entities/transaction.entity';
import { TransactionStatus } from '@/modules/payments/enums/transaction-status.enum';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('admin-analytics')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(Contract) private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
  ) {}

  @Get('overview')
  async overview() {
    const [totalUsers, usersByActiveRole, jobsByStatus, contractsByStatus, gmv] = await Promise.all(
      [
        this.userRepository.count(),
        this.userRepository
          .createQueryBuilder('u')
          .select('u.activeRole', 'role')
          .addSelect('COUNT(*)', 'count')
          .groupBy('u.activeRole')
          .getRawMany(),
        this.jobRepository
          .createQueryBuilder('j')
          .select('j.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('j.status')
          .getRawMany(),
        this.contractRepository
          .createQueryBuilder('c')
          .select('c.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('c.status')
          .getRawMany(),
        this.transactionRepository
          .createQueryBuilder('t')
          .select('t.currency', 'currency')
          .addSelect('SUM(t.amount)', 'total')
          .where('t.type IN (:...types)', { types: ['ESCROW_FUND', 'HOURLY_CHARGE'] })
          .andWhere('t.status = :status', { status: TransactionStatus.COMPLETED })
          .groupBy('t.currency')
          .getRawMany(),
      ],
    );

    return {
      totalUsers,
      usersByActiveRole: usersByActiveRole.map((r) => ({ role: r.role, count: Number(r.count) })),
      jobsByStatus: jobsByStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
      contractsByStatus: contractsByStatus.map((r) => ({
        status: r.status,
        count: Number(r.count),
      })),
      grossMerchandiseVolume: gmv.map((r) => ({ currency: r.currency, total: Number(r.total) })),
    };
  }

  @Get('revenue')
  async revenue(@Query() query: DateRangeDto) {
    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .where('t.status = :status', { status: TransactionStatus.COMPLETED });

    if (query.from) {
      qb.andWhere('t.createdAt >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('t.createdAt <= :to', { to: query.to });
    }

    const byCurrency = await qb
      .clone()
      .select('t.currency', 'currency')
      .addSelect('SUM(t.clientFee)', 'clientFeeTotal')
      .addSelect('SUM(t.seekerFee)', 'seekerFeeTotal')
      .groupBy('t.currency')
      .getRawMany();

    const byType = await qb
      .clone()
      .select('t.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(t.amount)', 'total')
      .groupBy('t.type')
      .getRawMany();

    return {
      commissionByCurrency: byCurrency.map((r) => ({
        currency: r.currency,
        clientFeeTotal: Number(r.clientFeeTotal),
        seekerFeeTotal: Number(r.seekerFeeTotal),
        platformRevenue: Number(r.clientFeeTotal) + Number(r.seekerFeeTotal),
      })),
      transactionsByType: byType.map((r) => ({
        type: r.type,
        count: Number(r.count),
        total: Number(r.total),
      })),
    };
  }
}
