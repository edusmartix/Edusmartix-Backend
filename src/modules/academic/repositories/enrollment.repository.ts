import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async enrollStudent(data: Prisma.EnrollmentUncheckedCreateInput) {
    return this.prisma.enrollment.create({ data });
  }

  // Bulk Enrollment using createMany
  async bulkEnroll(data: Prisma.EnrollmentUncheckedCreateInput[]) {
    return this.prisma.enrollment.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // Find where a student is currently
  async getStudentCurrentClass(studentId: number, sessionId: number) {
    return this.prisma.enrollment.findUnique({
      where: {
        studentId_academicSessionId: {
          studentId,
          academicSessionId: sessionId,
        },
      },
      include: {
        classArm: {
          include: { classLevel: true },
        },
      },
    });
  }

  // Get everyone in a specific class for the roster
  async getClassList(classArmId: number, sessionId: number) {
    return this.prisma.enrollment.findMany({
      where: { classArmId, academicSessionId: sessionId },
      include: {
        student: true,
      },
      orderBy: {
        student: { lastName: 'asc' },
      },
    });
  }
}
