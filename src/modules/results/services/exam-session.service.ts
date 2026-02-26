import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExamRepository } from '../repositories/exam.repository';
import { AcademicSessionService } from 'src/modules/academic/services/academic-session.service';
import { ExamStatus } from '@prisma/client';
import {
  CreateExamSessionDto,
  ScoreDivisionDto,
} from '../dto/exam-session.dto';

@Injectable()
export class ExamSessionService {
  constructor(
    private readonly examRepo: ExamRepository,
    private readonly academicService: AcademicSessionService,
  ) {}

  async createSession(schoolId: number, dto: CreateExamSessionDto) {
    const currentSession =
      await this.academicService.getCurrentSession(schoolId);
    const activeTerm = await this.academicService.getActiveTerm(schoolId);

    // Creates the Session and the participating level links
    return this.examRepo.createExamSession(
      {
        academicSessionId: currentSession.id,
        termId: activeTerm.id,
        title: dto.title,
        examType: dto.examType,
      },
      dto.classLevelIds,
    );
  }

  async setLevelDivisions(
    sessionId: number,
    levelId: number,
    divisions: ScoreDivisionDto[],
  ) {
    // 1. Calculate Total
    const total = divisions.reduce((sum, d) => sum + d.maxScore, 0);
    if (total !== 100) {
      throw new BadRequestException(
        `Total max score must be exactly 100. Current total: ${total}`,
      );
    }

    // 2. Clear existing (if any) and set new configs for this specific level
    return this.examRepo.syncLevelDivisions(sessionId, levelId, divisions);
  }

  // updateSessionStatus remains the same as your state machine logic
  // is already solid and works regardless of class-specific or school-wide.
  async updateSessionStatus(sessionId: number, newStatus: ExamStatus) {
    const session = await this.examRepo.findSessionById(sessionId);
    if (!session) throw new NotFoundException('Exam Session not found');

    const currentStatus = session.status;

    switch (newStatus) {
      case ExamStatus.OPEN:
        if (currentStatus !== ExamStatus.DRAFT)
          throw new BadRequestException('Only DRAFT sessions can be opened');
        break;
      case ExamStatus.LOCKED:
        if (currentStatus !== ExamStatus.OPEN)
          throw new BadRequestException('Only OPEN sessions can be locked');
        break;
      case ExamStatus.PUBLISHED:
        if (currentStatus !== ExamStatus.LOCKED)
          throw new BadRequestException('Must be LOCKED before publishing');
        break;
      case ExamStatus.DRAFT:
        if (currentStatus === ExamStatus.PUBLISHED)
          throw new BadRequestException('Unpublish before reverting to DRAFT');
        break;
    }

    return this.examRepo.updateSessionStatus(sessionId, newStatus);
  }
}
