import { Injectable } from '@nestjs/common';
import { GradingRepository } from '../repositories/grading.repository';
import { UpdateGradingDto } from '../dto/grading.dto';

@Injectable()
export class AdminGradingService {
  constructor(private readonly gradingRepo: GradingRepository) {}

  async getOrInitializeScale(examSessionId: number, classLevelId: number) {
    const scale = await this.gradingRepo.findScale(examSessionId, classLevelId);

    if (scale) return scale;

    // Define defaults here - keeps them out of the repo
    const defaultBoundaries = [
      {
        minScore: 70,
        maxScore: 100,
        grade: 'A',
        remark: 'Excellent',
        orderIndex: 1,
      },
      {
        minScore: 60,
        maxScore: 69.9,
        grade: 'B',
        remark: 'Very Good',
        orderIndex: 2,
      },
      {
        minScore: 50,
        maxScore: 59.9,
        grade: 'C',
        remark: 'Good',
        orderIndex: 3,
      },
      {
        minScore: 45,
        maxScore: 49.9,
        grade: 'D',
        remark: 'Fair',
        orderIndex: 4,
      },
      {
        minScore: 40,
        maxScore: 44.9,
        grade: 'E',
        remark: 'Pass',
        orderIndex: 5,
      },
      {
        minScore: 0,
        maxScore: 39.9,
        grade: 'F',
        remark: 'Fail',
        orderIndex: 6,
      },
    ];

    return this.gradingRepo.createDefaultScale(
      examSessionId,
      classLevelId,
      defaultBoundaries,
    );
  }

  async updateScale(dto: UpdateGradingDto) {
    return this.gradingRepo.updateScaleBoundaries(dto);
  }
}
