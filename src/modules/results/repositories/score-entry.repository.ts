import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StudentSubjectScore } from '@prisma/client';
import { StudentSubjectScoreDto } from '../dto/score-entry.dto';

@Injectable()
export class ScoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveBulkScores(
    sessionId: number,
    academicSessionId: number,
    subjectId: number,
    data: StudentSubjectScoreDto[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const results: StudentSubjectScore[] = [];

      for (const entry of data) {
        // Find the specific enrollment for this student in this academic session
        const enrollment = await tx.enrollment.findUnique({
          where: {
            studentId_academicSessionId: {
              studentId: entry.studentId,
              academicSessionId,
            },
          },
        });

        if (!enrollment) continue; // Or throw error based on preference

        const totalScore = entry.isAbsent
          ? 0
          : entry.divisions.reduce((sum, div) => sum + Number(div.score), 0);

        // 2. Upsert using enrollmentId
        const subjectScore = await tx.studentSubjectScore.upsert({
          where: {
            examSessionId_enrollmentId_subjectId: {
              examSessionId: sessionId,
              enrollmentId: enrollment.id,
              subjectId: subjectId,
            },
          },
          update: {
            totalScore,
            isAbsent: entry.isAbsent ?? false,
          },
          create: {
            examSessionId: sessionId,
            enrollmentId: enrollment.id,
            subjectId: subjectId,
            totalScore,
            isAbsent: entry.isAbsent ?? false,
          },
        });

        // 3. Upsert divisions remains similar, now linked to subjectScore.id
        for (const div of entry.divisions) {
          await tx.studentScoreDivision.upsert({
            where: {
              studentSubjectScoreId_scoreDivisionConfigId: {
                studentSubjectScoreId: subjectScore.id,
                scoreDivisionConfigId: div.scoreDivisionConfigId,
              },
            },
            update: { score: div.score },
            create: {
              studentSubjectScoreId: subjectScore.id,
              scoreDivisionConfigId: div.scoreDivisionConfigId,
              score: div.score,
            },
          });
        }
        results.push(subjectScore);
      }
      return results;
    });
  }

  async getScoreSheetTemplate(
    sessionId: number,
    classArmId: number,
    subjectId: number,
  ) {
    const classArm = await this.prisma.classArm.findUnique({
      where: { id: classArmId },
      select: { classLevelId: true },
    });

    if (!classArm) return null;

    // Fetch enrollments instead of just students
    const [enrollments, configs, existingScores] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { classArmId, enrollmentStatus: 'ACTIVE' },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNo: true,
            },
          },
        },
        orderBy: { student: { lastName: 'asc' } },
      }),
      this.prisma.scoreDivisionConfig.findMany({
        where: {
          examSessionId: sessionId,
          classLevelId: classArm.classLevelId,
        },
        orderBy: { orderIndex: 'asc' },
      }),
      this.prisma.studentSubjectScore.findMany({
        where: { examSessionId: sessionId, subjectId: subjectId },
        include: { divisions: true },
      }),
    ]);

    return { enrollments, configs, existingScores };
  }

  async findEnrollment(studentId: number, academicSessionId: number) {
    return this.prisma.enrollment.findUnique({
      where: {
        studentId_academicSessionId: {
          studentId,
          academicSessionId,
        },
      },
    });
  }

  async validateClassSubject(
    subjectId: number,
    classArmId: number,
    academicSessionId: number,
  ) {
    const mapping = await this.prisma.classSubject.findUnique({
      where: {
        subjectId_classArmId_academicSessionId: {
          subjectId,
          classArmId,
          academicSessionId,
        },
      },
    });

    return !!mapping; // Returns true if it exists, false otherwise
  }
}
