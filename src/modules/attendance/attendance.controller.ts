import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/create-attendance.dto';
import { Roles } from 'src/core/common/decorators/roles.decorators';
import { StaffRoles } from 'src/core/common/decorators/staff-roles.decorator';
import { UserRole, StaffRole } from '@prisma/client';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Initializes a daily register.
   * If records don't exist, it creates "PRESENT" entries for all active students.
   */
  @Post('initialize')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  @StaffRoles(StaffRole.ADMIN, StaffRole.TEACHER)
  async initAttendance(
    @Req() req,
    @Body('classArmId', ParseIntPipe) classArmId: number,
    @Body('date') date: string,
  ) {
    return this.attendanceService.initializeAttendance(
      req.schoolId,
      classArmId,
      date,
    );
  }

  /**
   * Bulk updates student attendance statuses (e.g., marking someone as ABSENT or LATE).
   */
  @Post('mark')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  @StaffRoles(StaffRole.ADMIN, StaffRole.TEACHER)
  async markAttendance(@Req() req, @Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(req.schoolId, dto);
  }

  /**
   * Fetch attendance for a specific class and date (optional helper).
   */
  @Get('view')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  async getRegister(
    @Req() req,
    @Query('classArmId', ParseIntPipe) classArmId: number,
    @Query('date') date: string,
  ) {
    // Reusing initialize logic as it also fetches existing data safely
    return this.attendanceService.initializeAttendance(
      req.schoolId,
      classArmId,
      date,
    );
  }
}
