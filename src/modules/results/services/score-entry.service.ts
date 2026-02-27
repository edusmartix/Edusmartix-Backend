import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExamRepository } from '../repositories/exam.repository';
import { ExamStatus } from '@prisma/client';
import { BulkScoreEntryDto } from '../dto/score-entry.dto';
import { ScoreRepository } from '../repositories/score-entry.repository';

@Injectable()
export class ScoreEntryService {
  constructor(
    private readonly scoreRepo: ScoreRepository,
    private readonly examRepo: ExamRepository,
  ) {}

  async recordScores(dto: BulkScoreEntryDto) {
    const session = await this.examRepo.findSessionById(dto.examSessionId);
    if (!session) throw new NotFoundException('Exam Session not found');

    if (session.status !== ExamStatus.OPEN) {
      throw new BadRequestException(
        `Score entry is not allowed. Status: ${session.status}`,
      );
    }

    const firstStudentId = dto.scores[0]?.studentId;
    if (!firstStudentId)
      throw new BadRequestException('No student data provided');

    // Find enrollment to get the classArmId
    const enrollment = await this.scoreRepo.findEnrollment(
      firstStudentId,
      session.academicSessionId,
    );
    if (!enrollment)
      throw new BadRequestException('Student not enrolled in this session');

    // Validate Subject Mapping
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

    return this.scoreRepo.saveBulkScores(
      dto.examSessionId,
      session.academicSessionId,
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
