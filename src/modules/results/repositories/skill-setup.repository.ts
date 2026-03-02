import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { UpdateSkillLevelDto } from '../dto/skills-setup.dto';

@Injectable()
export class SkillSetupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSkillsByLevel(classLevelId: number) {
    return this.prisma.skillCategory.findMany({
      where: { classLevelId },
      include: { items: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async initializeDefaultSkills(classLevelId: number, defaults: any[]) {
    return this.prisma.$transaction(async (tx) => {
      for (const cat of defaults) {
        await tx.skillCategory.create({
          data: {
            classLevelId,
            name: cat.name,
            orderIndex: cat.orderIndex,
            items: {
              create: cat.items,
            },
          },
        });
      }
      return this.getSkillsByLevel(classLevelId);
    });
  }

  async updateAndCloneSkills(dto: UpdateSkillLevelDto) {
    const targetLevels = Array.from(
      new Set([dto.classLevelId, ...(dto.targetClassLevelIds || [])]),
    );

    return this.prisma.$transaction(async (tx) => {
      for (const levelId of targetLevels) {
        // 1. Find existing categories to clean up items
        const existingCats = await tx.skillCategory.findMany({
          where: { classLevelId: levelId },
        });
        const catIds = existingCats.map((c) => c.id);

        // 2. Clear old data for this level
        await tx.skillItem.deleteMany({
          where: { skillCategoryId: { in: catIds } },
        });
        await tx.skillCategory.deleteMany({ where: { id: { in: catIds } } });

        // 3. Re-create new categories and items
        for (const cat of dto.categories) {
          await tx.skillCategory.create({
            data: {
              classLevelId: levelId,
              name: cat.name,
              orderIndex: cat.orderIndex,
              items: {
                create: cat.items.map((i) => ({
                  name: i.name,
                  maxScore: i.maxScore,
                  orderIndex: i.orderIndex,
                })),
              },
            },
          });
        }
      }
      return { success: true, syncedLevels: targetLevels.length };
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
