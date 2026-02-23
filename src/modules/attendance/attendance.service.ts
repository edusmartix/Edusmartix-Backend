import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AcademicSessionService } from '../academic/services/academic-session.service';
import { MarkAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceRepository } from './attendance.repository';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly repo: AttendanceRepository,
    private readonly sessionService: AcademicSessionService,
    private readonly prisma: PrismaService, // Needed for transaction coordination
  ) {}

  async markAttendance(schoolId: number, dto: MarkAttendanceDto) {
    const currentSession =
      await this.sessionService.getCurrentSession(schoolId);
    const activeTerm = await this.sessionService.getActiveTerm(schoolId);
    const date = new Date(dto.date);

    return this.prisma.$transaction(async (tx) => {
      // We pass the transactional 'tx' or use repo methods
      // Note: For deep transactions, some prefer passing 'tx' to repo methods
      const session = await this.repo.findOrCreateSession({
        classArmId: dto.classArmId,
        academicSessionId: currentSession.id,
        termId: activeTerm.id,
        attendanceDate: date,
      });

      const saveRecords = dto.records.map((rec) =>
        this.repo.upsertRecord(session.id, rec.enrollmentId, rec.status),
      );

      await Promise.all(saveRecords);
      return {
        message: 'Attendance recorded successfully',
        sessionId: session.id,
      };
    });
  }

  async initializeAttendance(
    schoolId: number,
    classArmId: number,
    date: string,
  ) {
    const currentSession =
      await this.sessionService.getCurrentSession(schoolId);
    const activeTerm = await this.sessionService.getActiveTerm(schoolId);
    const targetDate = new Date(date);

    return this.prisma.$transaction(async (tx) => {
      const session = await this.repo.findOrCreateSession({
        classArmId,
        academicSessionId: currentSession.id,
        termId: activeTerm.id,
        attendanceDate: targetDate,
      });

      const existingCount = await this.repo.countRecords(session.id);

      if (existingCount === 0) {
        const enrollments = await this.repo.findActiveEnrollments(
          classArmId,
          currentSession.id,
        );

        if (enrollments.length > 0) {
          const records = enrollments.map((e) => ({
            attendanceSessionId: session.id,
            enrollmentId: e.id,
            status: 'PRESENT' as const,
          }));
          await this.repo.createManyRecords(records);
        }
      }

      return this.repo.getSessionWithRecords(session.id);
    });
  }
}
