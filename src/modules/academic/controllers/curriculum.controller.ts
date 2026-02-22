import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  //   Get,
  //   ParseIntPipe,
  //   Param,
} from '@nestjs/common';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Roles } from '../../../core/common/decorators/roles.decorators';
import { StaffRole, UserRole } from '@prisma/client';
import { StaffRoles } from 'src/core/common/decorators/staff-roles.decorator';
import { CreateSubjectDto, AssignSubjectDto } from '../dto/curriculum.dto';
import { CurriculumService } from '../services/curriculum.service';

@Controller('academics/curriculum')
@UseGuards(AuthGuard, PermissionsGuard)
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Post('subjects')
  @Roles(UserRole.SCHOOL_OWNER)
  @StaffRoles(StaffRole.ADMIN)
  async createSubject(@Req() req, @Body() dto: CreateSubjectDto) {
    return this.curriculumService.createSubject(req.schoolId, dto);
  }

  @Post('subjects/assign')
  @Roles(UserRole.SCHOOL_OWNER)
  @StaffRoles(StaffRole.ADMIN)
  async assignToClass(@Req() req, @Body() dto: AssignSubjectDto) {
    return this.curriculumService.assignCurriculum(req.schoolId, dto);
  }

  // @Get('class/:armId')
  // async getClassSubjects(
  //   @Req() req,
  //   @Param('armId', ParseIntPipe) armId: number,
  // ) {
  //   // Logic to fetch subjects for the specific class in current session
  //   return this.curriculumService.getClassSubjects(req.schoolId, armId);
  // }
}
