import { Module } from '@nestjs/common';
import { ExamSessionController } from './controllers/exam-session.controller';
import { ExamSessionService } from './services/exam-session.service';
import { ExamRepository } from './repositories/exam.repository';
import { AcademicModule } from '../academic/academic.module';
import { ScoreEntryController } from './controllers/score-entry.controller';
import { ScoreEntryService } from './services/score-entry.service';
import { ScoreRepository } from './repositories/score-entry.repository';

@Module({
  imports: [AcademicModule],
  controllers: [ExamSessionController, ScoreEntryController],
  providers: [
    ExamSessionService,
    ExamRepository,
    ScoreEntryService,
    ScoreRepository,
  ],
  exports: [
    ExamSessionService,
    ExamRepository,
    ScoreEntryService,
    ScoreRepository,
  ],
})
export class ResultsModule {}
