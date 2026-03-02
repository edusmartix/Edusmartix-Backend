import { Injectable, BadRequestException } from '@nestjs/common';
import { SkillSetupRepository } from '../repositories/skill-setup.repository';
import { CreateSkillCategoryDto } from '../dto/skills-setup.dto';

@Injectable()
export class SkillSetupService {
  constructor(private readonly skillRepo: SkillSetupRepository) {}

  async setupSkills(dto: CreateSkillCategoryDto) {
    // Check if category already exists for the primary level to prevent duplicates
    const existing = await this.skillRepo.getSkillsByLevel(dto.classLevelId);
    if (
      existing.some((cat) => cat.name.toLowerCase() === dto.name.toLowerCase())
    ) {
      throw new BadRequestException(
        `Category '${dto.name}' already exists for this level.`,
      );
    }

    return this.skillRepo.createCategoryWithClones(dto);
  }

  async fetchLevelSkills(classLevelId: number) {
    return this.skillRepo.getSkillsByLevel(classLevelId);
  }
}
