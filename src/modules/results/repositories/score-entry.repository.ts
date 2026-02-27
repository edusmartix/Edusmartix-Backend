import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StudentSubjectScore } from '@prisma/client';
import { StudentSubjectScoreDto } from '../dto/score-entry.dto';

@Injectable()
export class ScoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveBulkScores(
    sessionId: number,
    subjectId: number,
    data: StudentSubjectScoreDto[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      // FIX: Explicitly type the array to avoid 'never' error
      const results: StudentSubjectScore[] = [];

      for (const entry of data) {
        // 1. Calculate total from divisions
        const totalScore = entry.divisions.reduce(
          (sum, div) => sum + Number(div.score),
          0,
        );

        // 2. Upsert the Header
        const subjectScore = await tx.studentSubjectScore.upsert({
          where: {
            examSessionId_studentId_subjectId: {
              examSessionId: sessionId,
              studentId: entry.studentId,
              subjectId: subjectId,
            },
          },
          update: {
            totalScore: totalScore,
            isAbsent: entry.isAbsent ?? false,
          },
          create: {
            examSessionId: sessionId,
            studentId: entry.studentId,
            subjectId: subjectId,
            totalScore: totalScore,
            isAbsent: entry.isAbsent ?? false,
          },
        });

        // 3. Upsert specific divisions (CA1, CA2, Exam)
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
}
