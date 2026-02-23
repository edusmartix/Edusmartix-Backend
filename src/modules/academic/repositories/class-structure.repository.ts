import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClassStructureRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- CATEGORIES ---
  async createCategory(data: Prisma.ClassCategoryUncheckedCreateInput) {
    return this.prisma.classCategory.create({ data });
  }

  async findAllCategories(schoolId: number) {
    return this.prisma.classCategory.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
    });
  }

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

  async findStructureGroupedByCategory(schoolId: number) {
    return this.prisma.classCategory.findMany({
      where: { schoolId },
      include: {
        classLevels: {
          orderBy: { levelOrder: 'asc' }, // Respects your drag-and-drop order
          include: {
            classArms: {
              orderBy: { name: 'asc' }, // Orders arms (A, B, C) alphabetically
            },
          },
        },
      },
      orderBy: { id: 'asc' }, // Or add a 'categoryOrder' if you want to drag categories too
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

  async reorderLevels(
    schoolId: number,
    levels: { id: number; order: number }[],
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;

    // We return the result of all updates
    return Promise.all(
      levels.map((item) =>
        client.classLevel.update({
          where: { id: item.id, schoolId },
          data: { levelOrder: item.order },
        }),
      ),
    );
  }
}
