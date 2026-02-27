import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ExamStatus, Prisma } from '@prisma/client';
import { ScoreDivisionDto } from '../dto/exam-session.dto';

@Injectable()
export class ExamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createExamSession(data: any, levelIds: number[]) {
    const defaultDivisions = [
      { name: '1st CA', maxScore: 10 },
      { name: '2nd CA', maxScore: 30 },
      { name: 'Exam', maxScore: 60 },
    ];

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the main Exam Session
      const session = await tx.examSession.create({
        data: {
          ...data,
          participatingLevels: {
            create: levelIds.map((id) => ({ classLevelId: id })),
          },
        },
      });

      // 2. Map default divisions to every participating level
      const configs: Prisma.ScoreDivisionConfigCreateManyInput[] = [];
      for (const levelId of levelIds) {
        defaultDivisions.forEach((div, index) => {
          configs.push({
            examSessionId: session.id,
            classLevelId: levelId,
            name: div.name,
            maxScore: div.maxScore,
            orderIndex: index,
          });
        });
      }

      // 3. Bulk insert the configurations
      await tx.scoreDivisionConfig.createMany({
        data: configs,
      });

      return session;
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

  async isLevelInSession(sessionId: number, levelId: number): Promise<boolean> {
    const count = await this.prisma.examSessionClassLevel.count({
      where: {
        examSessionId: sessionId,
        classLevelId: levelId,
      },
    });
    return count > 0;
  }
}
