import { Module } from '@nestjs/common';
import { AcademicSessionService } from './services/academic-session.service';
// import { ClassStructureService } from './services/class-structure.service';
// import { CurriculumService } from './services/curriculum.service';
import { AcademicSessionController } from './controllers/academic-session.controller';
// import { ClassStructureController } from './controllers/class-structure.controller';
// import { CurriculumController } from './controllers/curriculum.controller';

@Module({
  imports: [], // Add CoreModule or PrismaModule here if not global
  controllers: [AcademicSessionController],
  providers: [AcademicSessionService],
  exports: [AcademicSessionService],
})
export class AcademicModule {}
