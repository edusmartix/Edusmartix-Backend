import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AcademicSessionService } from '../academic/services/academic-session.service';
import { MarkAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: AcademicSessionService,
  ) {}

  async markAttendance(schoolId: number, dto: MarkAttendanceDto) {
    const currentSession =
      await this.sessionService.getCurrentSession(schoolId);
    const activeTerm = await this.sessionService.getActiveTerm(schoolId);

    return this.prisma.$transaction(async (tx) => {
      // 1. Find or Create the Session for this day
      const session = await tx.attendanceSession.upsert({
        where: {
          classArmId_academicSessionId_attendanceDate: {
            classArmId: dto.classArmId,
            academicSessionId: currentSession.id,
            attendanceDate: new Date(dto.date),
          },
        },
        update: {}, // No changes needed if it exists
        create: {
          classArmId: dto.classArmId,
          academicSessionId: currentSession.id,
          termId: activeTerm.id,
          attendanceDate: new Date(dto.date),
        },
      });

      // 2. Bulk Upsert the individual records
      // Prisma doesn't have a native "bulk upsert" that handles unique constraints
      // perfectly in one query, so we use a loop inside the transaction.
      const saveRecords = dto.records.map((rec) =>
        tx.attendanceRecord.upsert({
          where: {
            attendanceSessionId_enrollmentId: {
              attendanceSessionId: session.id,
              enrollmentId: rec.enrollmentId,
            },
          },
          update: { status: rec.status },
          create: {
            attendanceSessionId: session.id,
            enrollmentId: rec.enrollmentId,
            status: rec.status,
          },
        }),
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
      // 1. Upsert the Session
      const session = await tx.attendanceSession.upsert({
        where: {
          classArmId_academicSessionId_attendanceDate: {
            classArmId,
            academicSessionId: currentSession.id,
            attendanceDate: targetDate,
          },
        },
        update: {},
        create: {
          classArmId,
          academicSessionId: currentSession.id,
          termId: activeTerm.id,
          attendanceDate: targetDate,
        },
      });

      // 2. Check if records already exist to avoid duplicates
      const existingCount = await tx.attendanceRecord.count({
        where: { attendanceSessionId: session.id },
      });

      if (existingCount === 0) {
        // 3. Get all active students in this class
        const enrollments = await tx.enrollment.findMany({
          where: {
            classArmId,
            academicSessionId: currentSession.id,
            enrollmentStatus: 'ACTIVE',
          },
        });

        // 4. Batch Create as PRESENT
        if (enrollments.length > 0) {
          await tx.attendanceRecord.createMany({
            data: enrollments.map((e) => ({
              attendanceSessionId: session.id,
              enrollmentId: e.id,
              status: 'PRESENT',
            })),
            skipDuplicates: true, // Safety net
          });
        }
      }

      // 5. Return the session with students for the frontend
      return tx.attendanceSession.findUnique({
        where: { id: session.id },
        include: {
          records: {
            include: {
              enrollment: {
                include: { student: { include: { user: true } } },
              },
            },
          },
        },
      });
    });
  }
}
