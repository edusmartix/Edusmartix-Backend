import { Module } from '@nestjs/common';
import { ExamSessionController } from './controllers/exam-session.controller';
import { ExamSessionService } from './services/exam-session.service';
import { ExamRepository } from './repositories/exam.repository';

@Module({
  controllers: [ExamSessionController],
  providers: [ExamSessionService, ExamRepository],
  exports: [ExamSessionService, ExamRepository],
})
export class ResultsModule {}
