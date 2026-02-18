import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AcademicRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- SESSION QUERIES ---

  async createSession(
    data: Prisma.AcademicSessionUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).academicSession.create({ data });
  }

  async findSessionById(id: number, schoolId: number) {
    return this.prisma.academicSession.findFirst({
      where: { id, schoolId },
      include: { terms: true },
    });
  }

  async deactivateAllSessions(schoolId: number, tx?: Prisma.TransactionClient) {
    return (tx || this.prisma).academicSession.updateMany({
      where: { schoolId, isActive: true },
      data: { isActive: false },
    });
  }

  async findCurrentSession(schoolId: number) {
    return this.prisma.academicSession.findFirst({
      where: { schoolId, isActive: true },
      include: {
        terms: { where: { isActive: true } },
      },
    });
  }

  // --- TERM QUERIES ---

  async createTerms(
    data: Prisma.TermUncheckedCreateInput[],
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).term.createMany({ data });
  }

  async findTermInSession(termId: number, sessionId: number, schoolId: number) {
    return this.prisma.term.findFirst({
      where: {
        id: termId,
        academicSessionId: sessionId,
        academicSession: { schoolId },
      },
    });
  }

  async deactivateAllTermsInSession(
    sessionId: number,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).term.updateMany({
      where: { academicSessionId: sessionId },
      data: { isActive: false },
    });
  }

  async updateTerm(
    id: number,
    data: Prisma.TermUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx || this.prisma).term.update({
      where: { id },
      data,
    });
  }
}
