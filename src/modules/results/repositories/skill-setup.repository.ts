import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateSkillCategoryDto } from '../dto/skills-setup.dto';

@Injectable()
export class SkillSetupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCategoryWithClones(dto: CreateSkillCategoryDto) {
    const { targetClassLevelIds = [], items, ...categoryData } = dto;

    // Combine the primary classLevelId with the targets for a single loop
    const allLevelIds = Array.from(
      new Set([categoryData.classLevelId, ...targetClassLevelIds]),
    );

    return this.prisma.$transaction(async (tx) => {
      const createdCategories = [];

      for (const levelId of allLevelIds) {
        const category = await tx.skillCategory.create({
          data: {
            name: categoryData.name,
            orderIndex: categoryData.orderIndex,
            classLevelId: levelId,
            items: {
              create: items.map((item) => ({
                name: item.name,
                maxScore: item.maxScore,
                orderIndex: item.orderIndex,
              })),
            },
          },
          include: { items: true },
        });
        createdCategories.push(category);
      }

      return createdCategories;
    });
  }

  async getSkillsByLevel(classLevelId: number) {
    return this.prisma.skillCategory.findMany({
      where: { classLevelId },
      include: { items: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async deleteCategory(categoryId: number) {
    return this.prisma.$transaction([
      this.prisma.skillItem.deleteMany({
        where: { skillCategoryId: categoryId },
      }),
      this.prisma.skillCategory.delete({ where: { id: categoryId } }),
    ]);
  }
}
