import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { AcademicRepository } from '../repositories/academic.repository';

@Injectable()
export class AcademicSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicRepo: AcademicRepository,
  ) {}

  async createSession(schoolId: number, dto: CreateSessionDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Business Logic: Ensure single active session
      if (dto.isActive) {
        await this.academicRepo.deactivateAllSessions(schoolId, tx);
      }

      // 2. Data Access: Create Session
      const session = await this.academicRepo.createSession(
        { ...dto, schoolId },
        tx,
      );

      // 3. Business Logic: Prepare default terms
      const defaultTerms = [
        {
          name: 'First Term',
          orderIndex: 1,
          isActive: true,
          academicSessionId: session.id,
        },
        {
          name: 'Second Term',
          orderIndex: 2,
          isActive: false,
          academicSessionId: session.id,
        },
        {
          name: 'Third Term',
          orderIndex: 3,
          isActive: false,
          academicSessionId: session.id,
        },
      ];

      await this.academicRepo.createTerms(defaultTerms, tx);

      // 4. Return complete object
      return this.academicRepo.findSessionById(session.id, schoolId);
    });
  }

  async getCurrentSession(schoolId: number) {
    const session = await this.academicRepo.findCurrentSession(schoolId);
    if (!session)
      throw new NotFoundException('No active academic session found.');
    return session;
  }

  async getActiveTerm(schoolId: number) {
    const activeTerm = await this.prisma.term.findFirst({
      where: {
        academicSession: {
          schoolId: schoolId,
        },
        isActive: true,
      },
    });

    if (!activeTerm) {
      throw new NotFoundException(
        'No active term found. Please activate a term in settings.',
      );
    }

    return activeTerm;
  }

  async activateSession(schoolId: number, sessionId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify session exists and belongs to school
      const session = await this.academicRepo.findSessionById(
        sessionId,
        schoolId,
      );
      if (!session) {
        throw new NotFoundException('Academic session not found');
      }

      // 2. Deactivate all other sessions for this school
      await this.academicRepo.deactivateAllSessions(schoolId, tx);

      // 3. Activate the target session
      return await this.academicRepo.updateSession(
        sessionId,
        { isActive: true },
        tx,
      );
    });
  }

  async getCurrentTerm(schoolId: number) {
    const term = await this.academicRepo.findCurrentTerm(schoolId);
    if (!term) {
      throw new NotFoundException(
        'No active term found for the current session.',
      );
    }
    return term;
  }

  async activateTerm(schoolId: number, sessionId: number, termId: number) {
    return this.prisma.$transaction(async (tx) => {
      const term = await this.academicRepo.findTermInSession(
        termId,
        sessionId,
        schoolId,
      );
      if (!term) throw new NotFoundException('Term not found in this session');

      await this.academicRepo.deactivateAllTermsInSession(sessionId, tx);
      return this.academicRepo.updateTerm(termId, { isActive: true }, tx);
    });
  }
}
