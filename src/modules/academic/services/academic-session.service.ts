import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateSessionDto } from '../dto/create-session.dto';

@Injectable()
export class AcademicSessionService {
  constructor(private prisma: PrismaService) {}

  async createSession(schoolId: number, dto: CreateSessionDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Handle "Single Active Session" rule
      if (dto.isActive) {
        await tx.academicSession.updateMany({
          where: { schoolId, isActive: true },
          data: { isActive: false },
        });
      }

      // 2. Create the Session
      const session = await tx.academicSession.create({
        data: {
          ...dto,
          schoolId,
        },
      });

      // 3. Auto-generate Default Terms
      const defaultTerms = [
        { name: 'First Term', orderIndex: 1, isActive: true }, // First term active by default
        { name: 'Second Term', orderIndex: 2, isActive: false },
        { name: 'Third Term', orderIndex: 3, isActive: false },
      ];

      await tx.term.createMany({
        data: defaultTerms.map((term) => ({
          ...term,
          academicSessionId: session.id,
        })),
      });

      // Return session with terms for the response
      return tx.academicSession.findUnique({
        where: { id: session.id },
        include: { terms: true },
      });
    });
  }

  async getCurrentSession(schoolId: number) {
    const session = await this.prisma.academicSession.findFirst({
      where: { schoolId, isActive: true },
      include: {
        terms: {
          where: { isActive: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('No active academic session found.');
    }

    return session;
  }

  async activateTerm(schoolId: number, sessionId: number, termId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify the term belongs to the session and the school
      const term = await tx.term.findFirst({
        where: {
          id: termId,
          academicSessionId: sessionId,
          academicSession: { schoolId },
        },
      });

      if (!term) throw new NotFoundException('Term not found in this session');

      // 2. Deactivate all terms in this session
      await tx.term.updateMany({
        where: { academicSessionId: sessionId },
        data: { isActive: false },
      });

      // 3. Activate the target term
      return await tx.term.update({
        where: { id: termId },
        data: { isActive: true },
      });
    });
  }
}
