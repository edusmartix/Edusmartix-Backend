import { Controller, Post, Body } from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';

@Controller('school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post('setup')
  async setup(@Body() dto: CreateSchoolDto) {
    return await this.schoolService.setupSchool(dto);
  }
}
