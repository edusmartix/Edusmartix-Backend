import { Injectable } from '@nestjs/common';
import { ClassStructureRepository } from '../repositories/class-structure.repository';
import { CreateLevelDto, ReorderLevelsDto } from '../dto/class-level.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class ClassStructureService {
  constructor(
    private readonly repo: ClassStructureRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createLevelWithArms(schoolId: number, dto: CreateLevelDto) {
    // 1. Create the Level (Grade 1)
    const level = await this.repo.createLevel({
      schoolId,
      name: dto.name,
      levelOrder: dto.levelOrder,
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

  async getFullStructure(schoolId: number) {
    return this.repo.findLevels(schoolId);
  }

  async reorderLevels(schoolId: number, dto: ReorderLevelsDto) {
    // We wrap this in a transaction to ensure all levels are updated together.
    // If one fails (e.g. an ID doesn't exist), they all roll back.
    return this.prisma.$transaction(async (tx) => {
      return this.repo.reorderLevels(schoolId, dto.levels, tx);
    });
  }
}
