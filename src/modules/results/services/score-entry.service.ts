import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExamRepository } from '../repositories/exam.repository';
import { ExamStatus } from '@prisma/client';
import { BulkScoreEntryDto } from '../dto/score-entry.dto';
import { ScoreRepository } from '../repositories/score-entry.repository';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class ScoreEntryService {
  constructor(
    private readonly scoreRepo: ScoreRepository,
    private readonly examRepo: ExamRepository,
    private readonly prisma: PrismaService,
  ) {}

  async recordScores(dto: BulkScoreEntryDto) {
    const session = await this.examRepo.findSessionById(dto.examSessionId);
    if (!session) throw new NotFoundException('Exam Session not found');
    if (session.status !== ExamStatus.OPEN) {
      throw new BadRequestException(
        `Score entry locked. Status: ${session.status}`,
      );
    }

    // 1. Get metadata from the first enrollment to validate the subject
    const firstEnrollmentId = dto.scores[0]?.enrollmentId;
    if (!firstEnrollmentId)
      throw new BadRequestException('No score data provided');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: firstEnrollmentId },
      select: { classArmId: true },
    });

    if (!enrollment) throw new BadRequestException('Invalid enrollment ID');

    // 2. Validate Subject Mapping
    const isSubjectValid = await this.scoreRepo.validateClassSubject(
      dto.subjectId,
      enrollment.classArmId,
      session.academicSessionId,
    );

    if (!isSubjectValid) {
      throw new BadRequestException(
        'Subject not assigned to this class arm for this session.',
      );
    }

    // 3. Save Bulk Scores
    return this.scoreRepo.saveBulkScores(
      dto.examSessionId,
      dto.subjectId,
      dto.scores,
    );
  }

  async getScoreSheet(
    sessionId: number,
    classArmId: number,
    subjectId: number,
  ) {
    const data = await this.scoreRepo.getScoreSheetTemplate(
      sessionId,
      classArmId,
      subjectId,
    );
    if (!data) throw new NotFoundException('Data not found');

    const { enrollments, configs, existingScores } = data;

    const sheet = enrollments.map((enrollment) => {
      const scoreRecord = existingScores.find(
        (s) => s.enrollmentId === enrollment.id,
      );

      return {
        studentId: enrollment.student.id,
        enrollmentId: enrollment.id, // Now included for clarity
        name: `${enrollment.student.lastName} ${enrollment.student.firstName}`,
        admissionNumber: enrollment.student.admissionNo,
        isAbsent: scoreRecord?.isAbsent ?? false,
        totalScore: scoreRecord?.totalScore ?? 0,
        scores: configs.map((config) => {
          const divScore = scoreRecord?.divisions.find(
            (d) => d.scoreDivisionConfigId === config.id,
          );
          return {
            configId: config.id,
            configName: config.name,
            maxScore: config.maxScore,
            currentScore: divScore?.score ?? null,
          };
        }),
      };
    });

    return { configs, sheet };
  }
}
