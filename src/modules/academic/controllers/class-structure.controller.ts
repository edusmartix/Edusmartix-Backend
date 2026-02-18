import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Roles } from '../../../core/common/decorators/roles.decorators';
import { StaffRole, UserRole } from '@prisma/client';
import { StaffRoles } from 'src/core/common/decorators/staff-roles.decorator';
import { ClassStructureService } from '../services/class-structure.service';
import { CreateLevelDto } from '../dto/create-level.dto';

@Controller('academics/structure')
@UseGuards(AuthGuard, PermissionsGuard)
export class ClassStructureController {
  constructor(private readonly structureService: ClassStructureService) {}

  @Post('levels')
  @Roles(UserRole.SCHOOL_OWNER)
  @StaffRoles(StaffRole.ADMIN)
  async createLevel(@Req() req, @Body() dto: CreateLevelDto) {
    return this.structureService.createLevelWithArms(req.schoolId, dto);
  }

  @Get()
  async getStructure(@Req() req) {
    return this.structureService.getFullStructure(req.schoolId);
  }
}
