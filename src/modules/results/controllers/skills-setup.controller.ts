import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SkillSetupService } from '../services/skill-setup.service';
import { UpdateSkillLevelDto } from '../dto/skills-setup.dto';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller('results/skills-setup')
@UseGuards(AuthGuard, PermissionsGuard)
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
