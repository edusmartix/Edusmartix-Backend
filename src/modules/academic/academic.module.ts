import { Module } from '@nestjs/common';
import { AcademicSessionService } from './services/academic-session.service';
import { ClassStructureService } from './services/class-structure.service';
import { CurriculumService } from './services/curriculum.service';
import { AcademicSessionController } from './controllers/academic-session.controller';
import { AcademicRepository } from './repositories/academic.repository';
import { ClassStructureController } from './controllers/class-structure.controller';
import { ClassStructureRepository } from './repositories/class-structure.repository';
import { CurriculumController } from './controllers/curriculum.controller';
import { CurriculumRepository } from './repositories/curriculum.repository';

@Module({
  imports: [], // Add CoreModule or PrismaModule here if not global
  controllers: [
    AcademicSessionController,
    ClassStructureController,
    CurriculumController,
  ],
  providers: [
    AcademicSessionService,
    AcademicRepository,
    ClassStructureService,
    ClassStructureRepository,
    CurriculumService,
    CurriculumRepository,
  ],
  exports: [
    AcademicSessionService,
    AcademicRepository,
    ClassStructureService,
    ClassStructureRepository,
    CurriculumService,
    CurriculumRepository,
  ],
})
export class AcademicModule {}
