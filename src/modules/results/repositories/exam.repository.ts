import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ExamStatus, Prisma } from '@prisma/client';

@Injectable()
export class ExamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createExamSession(data: Prisma.ExamSessionUncheckedCreateInput) {
    return this.prisma.examSession.create({
      data,
      include: { scoreConfigs: true },
    });
  }

  async findSessionById(id: number) {
    return this.prisma.examSession.findUnique({
      where: { id },
      include: {
        scoreConfigs: { orderBy: { orderIndex: 'asc' } },
        classLevel: true,
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
}
