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

@Controller('teacher/skill-assessment')
// @UseGuards(AuthGuard) // Use your actual auth guard
export class SkillAssessmentController {
  constructor(private readonly assessmentService: SkillAssessmentService) {}

  /**
   * Fetches everything needed to render the behavioral assessment table
   */
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

  /**
   * Saves or Updates scores for multiple students/items at once
   */
  @Post('save-bulk')
  async saveBulk(@Body() dto: BulkSkillAssessmentDto) {
    return this.assessmentService.recordSkills(dto);
  }
}
