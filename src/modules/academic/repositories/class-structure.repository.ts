import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClassStructureRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- LEVELS ---
  async createLevel(data: Prisma.ClassLevelUncheckedCreateInput) {
    return this.prisma.classLevel.create({ data });
  }

  async findLevels(schoolId: number) {
    return this.prisma.classLevel.findMany({
      where: { schoolId },
      include: { classArms: true },
      orderBy: { levelOrder: 'asc' },
    });
  }

  // --- ARMS ---
  async createArms(data: Prisma.ClassArmUncheckedCreateInput[]) {
    return this.prisma.classArm.createMany({ data });
  }

  async findLevelWithArms(levelId: number) {
    return this.prisma.classLevel.findUnique({
      where: { id: levelId },
      include: { classArms: true },
    });
  }
}
