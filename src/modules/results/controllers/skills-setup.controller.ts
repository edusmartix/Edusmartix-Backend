import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SkillSetupService } from '../services/skill-setup.service';
import { UpdateSkillLevelDto } from '../dto/skills-setup.dto';

@Controller('results/skills-setup')
export class AdminSkillsController {
  constructor(private readonly skillService: SkillSetupService) {}

  @Get('class-level/:classLevelId')
  async getSkills(@Param('classLevelId', ParseIntPipe) classLevelId: number) {
    return this.skillService.getOrInitialize(classLevelId);
  }

  @Post('update')
  async updateSkills(@Body() dto: UpdateSkillLevelDto) {
    return this.skillService.updateSkills(dto);
  }

  @Delete('category/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.removeCategory(id);
  }
}
