import { Module } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { SchoolRepository } from './school.repository';
import { TenantModule } from '../../tenant/tenant.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TenantModule, UsersModule],
  controllers: [SchoolController],
  providers: [SchoolService, SchoolRepository],
  exports: [SchoolService, SchoolRepository],
})
export class SchoolModule {}
