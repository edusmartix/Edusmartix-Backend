import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExamRepository } from '../repositories/exam.repository';
import { AcademicSessionService } from 'src/modules/academic/services/academic-session.service';
import { ExamStatus } from '@prisma/client';
import { CreateExamSessionDto } from '../dto/exam-session.dto';

@Injectable()
export class ExamSessionService {
  constructor(
    private readonly examRepo: ExamRepository,
    private readonly academicService: AcademicSessionService,
  ) {}

  async createSession(schoolId: number, dto: CreateExamSessionDto) {
    // 1. Validate Academic Context
    const currentSession =
      await this.academicService.getCurrentSession(schoolId);
    const activeTerm = await this.academicService.getActiveTerm(schoolId);

    // 2. Create the Session
    const session = await this.examRepo.createExamSession({
      academicSessionId: currentSession.id,
      termId: activeTerm.id,
      classLevelId: dto.classLevelId,
      classArmId: dto.classArmId,
      title: dto.title,
      examType: dto.examType,
    });

    // 3. Initialize default Score Divisions if provided
    if (dto.divisions && dto.divisions.length > 0) {
      const configs = dto.divisions.map((d, index) => ({
        examSessionId: session.id,
        classLevelId: dto.classLevelId,
        name: d.name,
        maxScore: d.maxScore,
        orderIndex: index,
      }));
      await this.examRepo.addScoreDivisionConfigs(configs);
    }

    return this.examRepo.findSessionById(session.id);
  }

  async updateSessionStatus(sessionId: number, newStatus: ExamStatus) {
    const session = await this.examRepo.findSessionById(sessionId);
    if (!session) throw new NotFoundException('Exam Session not found');

    const currentStatus = session.status;

    // Transition Logic
    switch (newStatus) {
      case ExamStatus.OPEN:
        // You can only open a Draft
        if (currentStatus !== ExamStatus.DRAFT) {
          throw new BadRequestException(
            'Only DRAFT sessions can be opened for entry',
          );
        }
        break;

      case ExamStatus.LOCKED:
        // You can only lock an Open session (stops teachers from editing)
        if (currentStatus !== ExamStatus.OPEN) {
          throw new BadRequestException('Only OPEN sessions can be locked');
        }
        break;

      case ExamStatus.PUBLISHED:
        // You can only publish if it was previously locked (final review done)
        if (currentStatus !== ExamStatus.LOCKED) {
          throw new BadRequestException(
            'Session must be LOCKED before publishing to parents',
          );
        }
        break;

      case ExamStatus.DRAFT:
        // Reverting to draft (Admin Reset)
        if (currentStatus === ExamStatus.PUBLISHED) {
          throw new BadRequestException(
            'Cannot revert to DRAFT once published. Unpublish first.',
          );
        }
        break;
    }

    return this.examRepo.updateSessionStatus(sessionId, newStatus);
  }
}
