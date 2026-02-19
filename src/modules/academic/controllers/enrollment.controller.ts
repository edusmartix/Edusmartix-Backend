import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Roles } from '../../../core/common/decorators/roles.decorators';
import { StaffRole, UserRole } from '@prisma/client';
import { StaffRoles } from 'src/core/common/decorators/staff-roles.decorator';
import { BulkEnrollDto } from '../dto/enrollment.dto';
import { EnrollmentService } from '../services/enrollment.service';

@Controller('academics/enrollment')
@UseGuards(AuthGuard, PermissionsGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('bulk')
  @Roles(UserRole.SCHOOL_OWNER)
  @StaffRoles(StaffRole.ADMIN)
  async bulkEnroll(@Req() req, @Body() dto: BulkEnrollDto) {
    return this.enrollmentService.enrollStudents(req.schoolId, dto);
  }

  @Get('class/:armId')
  async getRoster(@Req() req, @Param('armId', ParseIntPipe) armId: number) {
    return this.enrollmentService.getClassRoster(req.schoolId, armId);
  }
}
