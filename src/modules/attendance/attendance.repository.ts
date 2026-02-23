import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AttendanceStatus, Prisma } from '@prisma/client';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateSession(data: {
    classArmId: number;
    academicSessionId: number;
    termId: number;
    attendanceDate: Date;
  }) {
    return this.prisma.attendanceSession.upsert({
      where: {
        classArmId_academicSessionId_attendanceDate: {
          classArmId: data.classArmId,
          academicSessionId: data.academicSessionId,
          attendanceDate: data.attendanceDate,
        },
      },
      update: {},
      create: data,
    });
  }

  async upsertRecord(
    sessionId: number,
    enrollmentId: number,
    status: AttendanceStatus,
  ) {
    return this.prisma.attendanceRecord.upsert({
      where: {
        attendanceSessionId_enrollmentId: {
          attendanceSessionId: sessionId,
          enrollmentId: enrollmentId,
        },
      },
      update: { status },
      create: {
        attendanceSessionId: sessionId,
        enrollmentId: enrollmentId,
        status,
      },
    });
  }

  async getSessionWithRecords(sessionId: number) {
    return this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
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
  }

  async countRecords(sessionId: number) {
    return this.prisma.attendanceRecord.count({
      where: { attendanceSessionId: sessionId },
    });
  }

  async findActiveEnrollments(classArmId: number, academicSessionId: number) {
    return this.prisma.enrollment.findMany({
      where: {
        classArmId,
        academicSessionId,
        enrollmentStatus: 'ACTIVE',
      },
    });
  }

  async createManyRecords(records: Prisma.AttendanceRecordCreateManyInput[]) {
    return this.prisma.attendanceRecord.createMany({
      data: records,
      skipDuplicates: true,
    });
  }
}
