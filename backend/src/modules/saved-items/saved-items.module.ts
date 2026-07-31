import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '@/modules/jobs/entities/job.entity';
import { SavedItem } from '@/modules/saved-items/entities/saved-item.entity';
import { SavedItemsController } from '@/modules/saved-items/saved-items.controller';
import { SavedItemsService } from '@/modules/saved-items/saved-items.service';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SavedItem, Job]), UsersModule],
  controllers: [SavedItemsController],
  providers: [SavedItemsService],
  exports: [SavedItemsService],
})
export class SavedItemsModule {}
