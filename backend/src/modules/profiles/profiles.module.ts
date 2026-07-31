import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { ClientProfile } from '@/modules/profiles/entities/client-profile.entity';
import { Identity } from '@/modules/profiles/entities/identity.entity';
import { SeekerProfile } from '@/modules/profiles/entities/seeker-profile.entity';
import { ProfilesController } from '@/modules/profiles/profiles.controller';
import { ProfilesService } from '@/modules/profiles/profiles.service';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Identity, ClientProfile, SeekerProfile]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
