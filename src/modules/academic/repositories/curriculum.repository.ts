import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CurriculumRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- MASTER SUBJECTS ---
  async createSubject(data: Prisma.SubjectUncheckedCreateInput) {
    return this.prisma.subject.create({ data });
  }

  async findSubjectsBySchool(schoolId: number) {
    return this.prisma.subject.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
    });
  }

  // --- CLASS SUBJECTS (Mapping) ---
  async assignSubjectsToClass(data: Prisma.ClassSubjectUncheckedCreateInput[]) {
    return this.prisma.classSubject.createMany({
      data,
      skipDuplicates: true, // Prevents crashing if a subject is already assigned
    });
  }

  async findClassCurriculum(classArmId: number, academicSessionId: number) {
    return this.prisma.classSubject.findMany({
      where: { classArmId, academicSessionId },
      include: { subject: true },
    });
  }
}
