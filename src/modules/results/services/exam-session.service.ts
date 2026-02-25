import { Injectable } from '@nestjs/common';

@Injectable()
export class ExamSessionService {
  constructor(
    private readonly examRepo: ExamRepository,
    private readonly academicService: AcademicSessionService
  ) {}

  async createSession(schoolId: number, dto: CreateExamSessionDto) {
    // 1. Validate Academic Context
    const currentSession = await this.academicService.getCurrentSession(schoolId);
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
}