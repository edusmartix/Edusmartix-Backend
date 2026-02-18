import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Roles } from '../../../core/common/decorators/roles.decorators';
import { StaffRole, UserRole } from '@prisma/client';
import { StaffRoles } from 'src/core/common/decorators/staff-roles.decorator';
import { AcademicSessionService } from '../services/academic-session.service';
import { CreateSessionDto } from '../dto/create-session.dto';

@Controller('academics/sessions')
@UseGuards(AuthGuard, PermissionsGuard)
export class AcademicSessionController {
  constructor(private sessionService: AcademicSessionService) {}

  @Post()
  @Roles(UserRole.SCHOOL_OWNER)
  @StaffRoles(StaffRole.ADMIN)
  async create(@Req() req, @Body() dto: CreateSessionDto) {
    return this.sessionService.createSession(req.schoolId, dto);
  }

  @Get('current')
  async getCurrent(@Req() req) {
    return this.sessionService.getCurrentSession(req.schoolId);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SCHOOL_OWNER)
  @StaffRoles(StaffRole.ADMIN)
  async activateSession(
    @Req() req,
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    return this.sessionService.activateSession(req.schoolId, sessionId);
  }

  @Patch(':sessionId/terms/:termId/activate')
  @Roles(UserRole.SCHOOL_OWNER)
  @StaffRoles(StaffRole.ADMIN)
  async activateTerm(
    @Req() req,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('termId', ParseIntPipe) termId: number,
  ) {
    return this.sessionService.activateTerm(req.schoolId, sessionId, termId);
  }
}
