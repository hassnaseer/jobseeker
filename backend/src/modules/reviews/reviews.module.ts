import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '@/modules/chat/entities/report.entity';
import { ContractsModule } from '@/modules/contracts/contracts.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { ClientProfile } from '@/modules/profiles/entities/client-profile.entity';
import { SeekerProfile } from '@/modules/profiles/entities/seeker-profile.entity';
import { Review } from '@/modules/reviews/entities/review.entity';
import { ReviewsController } from '@/modules/reviews/reviews.controller';
import { ReviewsService } from '@/modules/reviews/reviews.service';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ClientProfile, SeekerProfile, Report]),
    ContractsModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
