import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SkillAssessmentService } from '../services/skill-assessment.service';
import { BulkSkillAssessmentDto } from '../dto/skill-assessment.dto';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller('teacher/skill-assessment')
@UseGuards(AuthGuard, PermissionsGuard)
export class SkillAssessmentController {
  constructor(private readonly assessmentService: SkillAssessmentService) {}

  @Get('sheet')
  async getSheet(
    @Query('resultSheetId', ParseIntPipe) resultSheetId: number,
    @Query('classArmId', ParseIntPipe) classArmId: number,
    @Query('classLevelId', ParseIntPipe) classLevelId: number,
  ) {
    return this.assessmentService.getAssessmentSheet(
      resultSheetId,
      classArmId,
      classLevelId,
    );
  }

  @Post('save-bulk')
  async saveBulk(@Body() dto: BulkSkillAssessmentDto) {
    return this.assessmentService.recordSkills(dto);
  }
}
