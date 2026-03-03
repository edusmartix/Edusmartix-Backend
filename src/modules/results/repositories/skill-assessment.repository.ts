import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { BulkSkillAssessmentDto } from '../dto/skill-assessment.dto';

@Injectable()
export class SkillAssessmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAssessmentGrid(resultSheetId: number, classLevelId: number) {
    // 1. Get all students enrolled in the class linked to this ResultSheet
    // (Assuming ResultSheet links to students via Enrollment)
    return this.prisma.studentSkillAssessment.findMany({
      where: { resultSheetId },
      include: {
        skillItem: true,
        enrollment: {
          include: { student: true }, // Assuming Student relation exists
        },
      },
    });
  }

  async saveBulkAssessments(dto: BulkSkillAssessmentDto) {
    return this.prisma.$transaction(
      dto.assessments.map((assessment) =>
        this.prisma.studentSkillAssessment.upsert({
          where: {
            resultSheetId_enrollmentId_skillItemId: {
              resultSheetId: dto.resultSheetId,
              enrollmentId: assessment.enrollmentId,
              skillItemId: assessment.skillItemId,
            },
          },
          update: {
            score: assessment.score,
            grade: assessment.grade,
            remark: assessment.remark,
          },
          create: {
            resultSheetId: dto.resultSheetId,
            enrollmentId: assessment.enrollmentId,
            skillItemId: assessment.skillItemId,
            score: assessment.score,
            grade: assessment.grade,
            remark: assessment.remark,
          },
        }),
      ),
    );
  }
}
