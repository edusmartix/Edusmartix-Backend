import { Module } from '@nestjs/common';
import { ExamSessionController } from './controllers/exam-session.controller';
import { ExamSessionService } from './services/exam-session.service';
import { ExamRepository } from './repositories/exam.repository';
import { AcademicModule } from '../academic/academic.module';
import { ScoreEntryController } from './controllers/score-entry.controller';
import { ScoreEntryService } from './services/score-entry.service';
import { ScoreRepository } from './repositories/score-entry.repository';
import { GradingRepository } from './repositories/grading.repository';
import { AdminGradingController } from './controllers/grading.controller';
import { AdminGradingService } from './services/grading.service';

@Module({
  imports: [AcademicModule],
  controllers: [
    ExamSessionController,
    ScoreEntryController,
    AdminGradingController,
  ],
  providers: [
    ExamSessionService,
    ExamRepository,
    ScoreEntryService,
    ScoreRepository,
    AdminGradingService,
    GradingRepository,
  ],
  exports: [
    ExamSessionService,
    ExamRepository,
    ScoreEntryService,
    ScoreRepository,
    AdminGradingService,
    GradingRepository,
  ],
})
export class ResultsModule {}
