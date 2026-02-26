import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Roles } from '../../../core/common/decorators/roles.decorators';
import { ExamStatus, StaffRole, UserRole } from '@prisma/client';
import { StaffRoles } from 'src/core/common/decorators/staff-roles.decorator';
import { ExamSessionService } from '../services/exam-session.service';
import { CreateExamSessionDto } from '../dto/exam-session.dto';

@Controller('results/sessions')
@UseGuards(AuthGuard, PermissionsGuard)
export class ExamSessionController {
  constructor(private readonly examService: ExamSessionService) {}

  @Post()
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  @StaffRoles(StaffRole.ADMIN)
  async create(@Req() req, @Body() dto: CreateExamSessionDto) {
    return this.examService.createSession(req.schoolId, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  @StaffRoles(StaffRole.ADMIN)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ExamStatus,
  ) {
    // We'll add status transition logic in the service (e.g., can't publish if DRAFT)
    return this.examService.updateSessionStatus(id, status);
  }
}
