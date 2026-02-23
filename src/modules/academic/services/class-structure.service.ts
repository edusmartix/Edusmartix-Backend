import { BadRequestException, Injectable } from '@nestjs/common';
import { ClassStructureRepository } from '../repositories/class-structure.repository';
import {
  CreateCategoryDto,
  CreateLevelDto,
  ReorderLevelsDto,
} from '../dto/class-level.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class ClassStructureService {
  constructor(
    private readonly repo: ClassStructureRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createCategory(schoolId: number, dto: CreateCategoryDto) {
    // 1. Check for duplicate name in the same school
    const existing = await this.prisma.classCategory.findUnique({
      where: {
        schoolId_name: { schoolId, name: dto.name },
      },
    });

    if (existing) {
      throw new BadRequestException(`Category "${dto.name}" already exists.`);
    }

    return this.repo.createCategory({
      schoolId,
      name: dto.name,
      type: dto.type,
    });
  }

  async getAllCategories(schoolId: number) {
    return this.repo.findAllCategories(schoolId);
  }

  async createLevelWithArms(schoolId: number, dto: CreateLevelDto) {
    // 1. Force the calculation of the NEXT order number
    const lastLevel = await this.prisma.classLevel.findFirst({
      where: { schoolId },
      orderBy: { levelOrder: 'desc' },
      select: { levelOrder: true }, // Optimization: only fetch the number
    });

    const nextOrder = lastLevel ? lastLevel.levelOrder + 1 : 1;

    // 2. Pass this nextOrder to the repository
    const level = await this.repo.createLevel({
      schoolId,
      name: dto.name,
      classCategoryId: dto.classCategoryId,
      levelOrder: nextOrder, // This ensures NO unique constraint clash
    });

    // 2. If arms are provided (e.g. ["A", "B"]), create them
    if (dto.arms && dto.arms.length > 0) {
      const armData = dto.arms.map((arm) => ({
        classLevelId: level.id,
        name: arm.name,
        classTeacherId: arm.classTeacherId || null, // Optional assignment
      }));
      await this.repo.createArms(armData);
    }

    return this.repo.findLevelWithArms(level.id);
  }

  async getClassStructure(schoolId: number) {
    return this.repo.findLevels(schoolId);
  }

  async getFullStructure(schoolId: number) {
    return this.repo.findStructureGroupedByCategory(schoolId);
  }

  async reorderLevels(schoolId: number, dto: ReorderLevelsDto) {
    // 1. Get all IDs from the DTO
    const levelIds = dto.levels.map((l) => l.id);

    // 2. Verify all these levels exist for THIS school
    const count = await this.prisma.classLevel.count({
      where: {
        id: { in: levelIds },
        schoolId: schoolId,
      },
    });

    if (count !== levelIds.length) {
      throw new BadRequestException(
        'One or more Level IDs are invalid or belong to another school.',
      );
    }

    // 3. If valid, proceed to the repository
    return this.prisma.$transaction(async (tx) => {
      return this.repo.reorderLevels(schoolId, dto.levels, tx);
    });
  }
}
