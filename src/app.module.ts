import { NestModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './core/common/common.module';
import { CoreModule } from './core/core.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantMiddleware } from './tenant/tenant.middleware';
import { UsersModule } from './modules/users/users.module';
import { SchoolModule } from './modules/school/school.module';
import { AcademicModule } from './modules/academic/academic.module';
import { StudentsModule } from './modules/students/students.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { BillingModule } from './modules/billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      expandVariables: true,
    }),
    CoreModule,
    CommonModule,
    TenantModule,
    UsersModule,
    SchoolModule,
    AcademicModule,
    StudentsModule,
    AttendanceModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*'); // Apply tenant resolution to all routes
  }
}
