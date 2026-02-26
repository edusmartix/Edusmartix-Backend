import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ExamStatus, Prisma } from '@prisma/client';
import { ScoreDivisionDto } from '../dto/exam-session.dto';

@Injectable()
export class ExamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createExamSession(data: any, levelIds: number[]) {
    return this.prisma.examSession.create({
      data: {
        ...data,
        participatingLevels: {
          create: levelIds.map((id) => ({ classLevelId: id })),
        },
      },
    });
  }

  async findSessionById(id: number) {
    return this.prisma.examSession.findUnique({
      where: { id },
      include: {
        scoreConfigs: { orderBy: { orderIndex: 'asc' } },
        term: true,
      },
    });
  }

  async addScoreDivisionConfigs(
    configs: Prisma.ScoreDivisionConfigCreateManyInput[],
  ) {
    return this.prisma.scoreDivisionConfig.createMany({
      data: configs,
    });
  }

  async updateSessionStatus(id: number, status: ExamStatus) {
    const updateData: any = { status };
    if (status === ExamStatus.OPEN) updateData.openedAt = new Date();
    if (status === ExamStatus.LOCKED) updateData.lockedAt = new Date();
    if (status === ExamStatus.PUBLISHED) updateData.publishedAt = new Date();

    return this.prisma.examSession.update({
      where: { id },
      data: updateData,
    });
  }

  async syncLevelDivisions(
    sessionId: number,
    levelId: number,
    divisions: ScoreDivisionDto[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Delete existing configs for this level in this session
      await tx.scoreDivisionConfig.deleteMany({
        where: { examSessionId: sessionId, classLevelId: levelId },
      });

      // Create new ones
      return tx.scoreDivisionConfig.createMany({
        data: divisions.map((d, index) => ({
          examSessionId: sessionId,
          classLevelId: levelId,
          name: d.name,
          maxScore: d.maxScore,
          orderIndex: index,
        })),
      });
    });
  }
}
