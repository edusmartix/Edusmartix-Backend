import { Module } from '@nestjs/common';
import { ExamSessionController } from './controllers/exam-session.controller';
import { ExamSessionService } from './services/exam-session.service';
import { ExamRepository } from './repositories/exam.repository';
import { AcademicModule } from '../academic/academic.module';

@Module({
  imports: [
    AcademicModule,
  ],
  controllers: [ExamSessionController],
  providers: [ExamSessionService, ExamRepository],
  exports: [ExamSessionService, ExamRepository],
})
export class ResultsModule {}
