import {
  Controller,
  Post,
  Body,
  UseGuards,
  ParseIntPipe,
  Param,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { PermissionsGuard } from '../../../core/guards/permissions.guard';
import { Roles } from '../../../core/common/decorators/roles.decorators';
import { UserRole } from '@prisma/client';
import { UpdateGradingDto } from '../dto/grading.dto';
import { AdminGradingService } from '../services/grading.service';

@Controller('admin/grading')
@UseGuards(AuthGuard, PermissionsGuard)
@Roles(UserRole.SCHOOL_OWNER, UserRole.STAFF)
export class AdminGradingController {
  constructor(private readonly gradingService: AdminGradingService) {}

  @Get(':examSessionId/:classLevelId')
  async getGradingScale(
    @Param('examSessionId', ParseIntPipe) sessionId: number,
    @Param('classLevelId', ParseIntPipe) levelId: number,
  ) {
    return this.gradingService.getOrInitializeScale(sessionId, levelId);
  }

  @Post('update-boundaries')
  async updateBoundaries(@Body() dto: UpdateGradingDto) {
    return this.gradingService.updateScale(dto);
  }
}
