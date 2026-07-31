import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from '@/modules/applications/applications.controller';
import { ApplicationsService } from '@/modules/applications/applications.service';
import { Application } from '@/modules/applications/entities/application.entity';
import { ApplicationCategoryRemovalGuard } from '@/modules/applications/guards/application-category-removal.guard';
import { Job } from '@/modules/jobs/entities/job.entity';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Job]), UsersModule, NotificationsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, ApplicationCategoryRemovalGuard],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
