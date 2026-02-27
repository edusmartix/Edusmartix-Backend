import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExamRepository } from '../repositories/exam.repository';
import { ExamStatus } from '@prisma/client';
import { BulkScoreEntryDto } from '../dto/score-entry.dto';
import { ScoreRepository } from '../repositories/score-entry.repository';

@Injectable()
export class ScoreEntryService {
  constructor(
    private readonly scoreRepo: ScoreRepository,
    private readonly examRepo: ExamRepository,
  ) {}

  async recordScores(dto: BulkScoreEntryDto) {
    // 1. Check if the session is OPEN
    const session = await this.examRepo.findSessionById(dto.examSessionId);
    if (!session) throw new NotFoundException('Exam Session not found');

    if (session.status !== ExamStatus.OPEN) {
      throw new BadRequestException(
        `Score entry is not allowed. Session status: ${session.status}`,
      );
    }

    // 2. Validate scores against MaxScore (Optional but recommended)
    // We could fetch configs here and verify each division score <= maxScore

    return this.scoreRepo.saveBulkScores(
      dto.examSessionId,
      dto.subjectId,
      dto.scores,
    );
  }
}
