import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Roles } from '../../../core/common/decorators/roles.decorators';
import { StaffRole, UserRole } from '@prisma/client';
import { StaffRoles } from 'src/core/common/decorators/staff-roles.decorator';
import { ScoreEntryService } from '../services/score-entry.service';
import { BulkScoreEntryDto } from '../dto/score-entry.dto';

@Controller('results/scores')
@UseGuards(AuthGuard, PermissionsGuard)
export class ScoreEntryController {
  constructor(private readonly scoreService: ScoreEntryService) {}

  @Post('bulk-record')
  @Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
  @StaffRoles(StaffRole.TEACHER, StaffRole.ADMIN)
  async recordBulkScores(@Body() dto: BulkScoreEntryDto) {
    return this.scoreService.recordScores(dto);
  }
}
