import { Injectable } from '@nestjs/common';
import { ClassStructureRepository } from '../repositories/class-structure.repository';
import { CreateLevelDto } from '../dto/create-level.dto';

@Injectable()
export class ClassStructureService {
  constructor(private readonly repo: ClassStructureRepository) {}

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
}
