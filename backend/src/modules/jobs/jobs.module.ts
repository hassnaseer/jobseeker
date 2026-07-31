import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '@/modules/jobs/entities/job.entity';
import { JobCategoryRemovalGuard } from '@/modules/jobs/guards/job-category-removal.guard';
import { JobsController } from '@/modules/jobs/jobs.controller';
import { JobsService } from '@/modules/jobs/jobs.service';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), UsersModule],
  controllers: [JobsController],
  providers: [JobsService, JobCategoryRemovalGuard],
  exports: [JobsService],
})
export class JobsModule {}
