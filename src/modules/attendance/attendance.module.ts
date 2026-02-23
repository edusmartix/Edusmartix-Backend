import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AcademicModule } from '../academic/academic.module';
import { AttendanceRepository } from './attendance.repository';

@Module({
  imports: [AcademicModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository],
  exports: [AttendanceService],
})
export class AttendanceModule {}
