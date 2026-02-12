import { Module } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { SchoolRepository } from './school.repository';
import { TenantModule } from '../../tenant/tenant.module'; // Import to access TenantRepository

@Module({
  imports: [TenantModule], // Gives access to TenantRepository
  controllers: [SchoolController],
  providers: [SchoolService, SchoolRepository],
  exports: [SchoolService, SchoolRepository],
})
export class SchoolModule {}
