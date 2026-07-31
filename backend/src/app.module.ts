import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '@/app.controller';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import configuration from '@/config/configuration';
import { validationSchema } from '@/config/validation';
import { AdminModule } from '@/modules/admin/admin.module';
import { AiModule } from '@/modules/ai/ai.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CatalogsModule } from '@/modules/catalogs/catalogs.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { ApplicationsModule } from '@/modules/applications/applications.module';
import { ChatModule } from '@/modules/chat/chat.module';
import { ContractsModule } from '@/modules/contracts/contracts.module';
import { DisputesModule } from '@/modules/disputes/disputes.module';
import { FirebaseModule } from '@/modules/firebase/firebase.module';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { TimesheetsModule } from '@/modules/timesheets/timesheets.module';
import { MailModule } from '@/modules/mail/mail.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { ProfilesModule } from '@/modules/profiles/profiles.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';
import { SavedItemsModule } from '@/modules/saved-items/saved-items.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('throttle.ttl')! * 1000,
            limit: configService.get<number>('throttle.limit')!,
          },
        ],
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        ssl: configService.get<boolean>('database.ssl') ? { rejectUnauthorized: false } : false,
      }),
    }),
    UsersModule,
    MailModule,
    FirebaseModule,
    AuthModule,
    CategoriesModule,
    ProfilesModule,
    JobsModule,
    ApplicationsModule,
    ContractsModule,
    TimesheetsModule,
    PaymentsModule,
    ChatModule,
    NotificationsModule,
    DisputesModule,
    ReviewsModule,
    CatalogsModule,
    SavedItemsModule,
    AdminModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
