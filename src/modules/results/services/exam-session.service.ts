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

    // The repository now handles creating levels AND default 10/30/60 configs
    const session = await this.examRepo.createExamSession(
      {
        academicSessionId: currentSession.id,
        termId: activeTerm.id,
        title: dto.title,
        examType: dto.examType,
      },
      dto.classLevelIds,
    );

    return this.examRepo.findSessionById(session.id);
  }

  async setLevelDivisions(
    sessionId: number,
    levelId: number,
    divisions: ScoreDivisionDto[],
  ) {
    // 1. Validate that the Exam Session exists
    const session = await this.examRepo.findSessionById(sessionId);
    if (!session) throw new NotFoundException('Exam Session not found');

    // 1.b Integrity Guard: Don't allow structural changes if scores might exist
    if (session.status !== ExamStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot reconfigure divisions once the session is out of DRAFT. Please revert to DRAFT first.',
      );
    }

    // 2. Validate that this Class Level is actually part of this session
    // This prevents setting scores for a level that isn't participating
    const isParticipating = await this.examRepo.isLevelInSession(
      sessionId,
      levelId,
    );
    if (!isParticipating) {
      throw new BadRequestException(
        'This class level is not part of this exam session',
      );
    }

    // 3. Calculate Total (Must be 100)
    const total = divisions.reduce((sum, d) => sum + d.maxScore, 0);
    if (total !== 100) {
      throw new BadRequestException(
        `Total max score must be 100. Current: ${total}`,
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

  // --- QUERIES (READ OPERATIONS) ---

  async findAll(schoolId: number) {
    return this.examRepo.findAll(schoolId);
  }

  async getSessionWithConfigs(sessionId: number) {
    const session = await this.examRepo.getSessionWithConfigs(sessionId);
    if (!session) throw new NotFoundException('Exam Session not found');
    return session;
  }

  async getLevelDivisions(sessionId: number, levelId: number) {
    const divisions = await this.examRepo.getLevelDivisions(sessionId, levelId);

    // If empty, return an empty array so frontend can handle it
    return divisions || [];
  }
}
