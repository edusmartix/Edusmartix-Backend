import { Injectable } from '@nestjs/common';
import { AcademicSessionService } from './academic-session.service';
import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { BulkEnrollDto } from '../dto/enrollment.dto';
import { EnrollmentStatus } from '@prisma/client';
@Injectable()
export class EnrollmentService {
  constructor(
    private readonly repo: EnrollmentRepository,
    private readonly sessionService: AcademicSessionService,
  ) {}

  async enrollStudents(schoolId: number, dto: BulkEnrollDto) {
    // 1. Get the current active session
    const currentSession =
      await this.sessionService.getCurrentSession(schoolId);

    // 2. Prepare the data
    const enrollmentData = dto.studentIds.map((studentId) => ({
      studentId,
      classArmId: dto.classArmId,
      academicSessionId: currentSession.id,
      enrollmentStatus: dto.status || EnrollmentStatus.ACTIVE,
    }));

    // 3. Execute bulk enrollment
    const result = await this.repo.bulkEnroll(enrollmentData);

    return {
      message: `${result.count} students enrolled successfully.`,
      count: result.count,
    };
  }

  async getClassRoster(schoolId: number, classArmId: number) {
    const currentSession =
      await this.sessionService.getCurrentSession(schoolId);
    return this.repo.getClassList(classArmId, currentSession.id);
  }
}
