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
        // 1. Wipe old data for this level
        const existingCats = await tx.skillCategory.findMany({
          where: { classLevelId: levelId },
          select: { id: true },
        });
        const catIds = existingCats.map((c) => c.id);

        await tx.skillItem.deleteMany({
          where: { skillCategoryId: { in: catIds } },
        });
        await tx.skillCategory.deleteMany({ where: { id: { in: catIds } } });

        // 2. Re-create new categories and capture their IDs
        for (const catDto of dto.categories) {
          const newCategory = await tx.skillCategory.create({
            data: {
              classLevelId: levelId,
              name: catDto.name,
              orderIndex: catDto.orderIndex,
            },
          });

          // 3. BULK INSERT all items for this category in ONE query
          await tx.skillItem.createMany({
            data: catDto.items.map((i) => ({
              skillCategoryId: newCategory.id, // Link to the new ID
              name: i.name,
              maxScore: i.maxScore,
              orderIndex: i.orderIndex,
            })),
          });
        }
      }
      return { success: true, syncedLevels: targetLevels.length };
    });
  }

  // Optimized delete
  async deleteCategory(categoryId: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.skillItem.deleteMany({ where: { skillCategoryId: categoryId } });
      return tx.skillCategory.delete({ where: { id: categoryId } });
    });
  }
}
