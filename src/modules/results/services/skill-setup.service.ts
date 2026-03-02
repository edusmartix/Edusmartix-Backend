import { Injectable } from '@nestjs/common';
import { SkillSetupRepository } from '../repositories/skill-setup.repository';
import { UpdateSkillLevelDto } from '../dto/skills-setup.dto';

@Injectable()
export class SkillSetupService {
  constructor(private readonly skillRepo: SkillSetupRepository) {}

  async getOrInitialize(classLevelId: number) {
    const existing = await this.skillRepo.getSkillsByLevel(classLevelId);
    if (existing.length > 0) return existing;

    const defaults = [
      {
        name: 'Affective Skills',
        orderIndex: 1,
        items: [
          { name: 'Punctuality', orderIndex: 1, maxScore: 5 },
          { name: 'Attentiveness', orderIndex: 2, maxScore: 5 },
          { name: 'Neatness', orderIndex: 3, maxScore: 5 },
          { name: 'Honesty', orderIndex: 4, maxScore: 5 },
          { name: 'Politeness', orderIndex: 5, maxScore: 5 },
          { name: 'Perseverance', orderIndex: 6, maxScore: 5 },
          { name: 'Relationship with Others', orderIndex: 7, maxScore: 5 },
          { name: 'Organization Ability', orderIndex: 8, maxScore: 5 },
        ],
      },
      {
        name: 'Psychomotor Skills',
        orderIndex: 2,
        items: [
          { name: 'Hand Writing', orderIndex: 9, maxScore: 5 },
          { name: 'Drawing and Painting', orderIndex: 10, maxScore: 5 },
          { name: 'Speech / Verbal Fluency', orderIndex: 11, maxScore: 5 },
          { name: 'Quantitative Reasoning', orderIndex: 12, maxScore: 5 },
          { name: 'Processing Speed', orderIndex: 13, maxScore: 5 },
          { name: 'Retentiveness', orderIndex: 14, maxScore: 5 },
          { name: 'Visual Memory', orderIndex: 15, maxScore: 5 },
          { name: 'Public Speaking', orderIndex: 16, maxScore: 5 },
          { name: 'Sports and Games', orderIndex: 17, maxScore: 5 },
        ],
      },
    ];

    return this.skillRepo.initializeDefaultSkills(classLevelId, defaults);
  }

  async updateSkills(dto: UpdateSkillLevelDto) {
    return this.skillRepo.updateAndCloneSkills(dto);
  }

  async removeCategory(categoryId: number) {
    return this.skillRepo.deleteCategory(categoryId);
  }
}
