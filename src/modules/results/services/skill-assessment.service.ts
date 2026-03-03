import { Injectable } from '@nestjs/common';
import { SkillAssessmentRepository } from '../repositories/skill-assessment.repository';
import { SkillSetupRepository } from '../repositories/skill-setup.repository';
import { BulkSkillAssessmentDto } from '../dto/skill-assessment.dto';

@Injectable()
export class SkillAssessmentService {
  constructor(
    private readonly assessmentRepo: SkillAssessmentRepository,
    private readonly setupRepo: SkillSetupRepository,
  ) {}

  async getAssessmentSheet(
    resultSheetId: number,
    classArmId: number,
    classLevelId: number,
  ) {
    // 1. Get the Column Headers (The Skills defined by Admin)
    const skillCategories = await this.setupRepo.getSkillsByLevel(classLevelId);

    // 2. Get the Rows (The Students and their current scores)
    const studentRows = await this.assessmentRepo.getStudentsWithExistingScores(
      resultSheetId,
      classArmId,
    );

    return {
      skillCategories, // Frontend uses this to build the table columns
      studentRows, // Frontend uses this to build the table rows
    };
  }

  async recordSkills(dto: BulkSkillAssessmentDto) {
    return this.assessmentRepo.saveBulkAssessments(dto);
  }
}
