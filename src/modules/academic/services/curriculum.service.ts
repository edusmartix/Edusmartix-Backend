import { Injectable } from '@nestjs/common';
import { CurriculumRepository } from '../repositories/curriculum.repository';
import { AcademicSessionService } from './academic-session.service';
import { CreateSubjectDto, AssignSubjectDto } from '../dto/curriculum.dto';

@Injectable()
export class CurriculumService {
  constructor(
    private readonly repo: CurriculumRepository,
    private readonly sessionService: AcademicSessionService,
  ) {}

  async createSubject(schoolId: number, dto: CreateSubjectDto) {
    return this.repo.createSubject({ ...dto, schoolId });
  }

  async assignCurriculum(schoolId: number, dto: AssignSubjectDto) {
    // 1. Get the current session (The context)
    const currentSession =
      await this.sessionService.getCurrentSession(schoolId);

    // 2. Prepare mappings for multiple subjects to one class arm
    const mappings = dto.subjectIds.map((subjectId) => ({
      subjectId,
      classArmId: dto.classArmId,
      academicSessionId: currentSession.id,
      priority: dto.priority,
      isExamSubject: dto.isExamSubject,
    }));

    return this.repo.assignSubjectsToClass(mappings);
  }
}
