import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { UpdateGradingDto } from '../dto/grading.dto';

@Injectable()
export class GradingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findScale(examSessionId: number, classLevelId: number) {
    return this.prisma.gradingScale.findFirst({
      where: { examSessionId, classLevelId },
      include: { boundaries: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async createDefaultScale(
    examSessionId: number,
    classLevelId: number,
    defaultBoundaries: any[],
  ) {
    return this.prisma.gradingScale.create({
      data: {
        examSessionId,
        classLevelId,
        name: 'Default Grading Scale',
        boundaries: {
          create: defaultBoundaries,
        },
      },
      include: { boundaries: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async updateScaleBoundaries(dto: UpdateGradingDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Wipe existing boundaries
      await tx.gradeBoundary.deleteMany({
        where: { gradingScaleId: dto.scaleId },
      });

      // 2. Update Scale name (if provided) and create new boundaries
      return tx.gradingScale.update({
        where: { id: dto.scaleId },
        data: {
          ...(dto.name && { name: dto.name }),
          boundaries: {
            create: dto.boundaries,
          },
        },
        include: { boundaries: { orderBy: { orderIndex: 'asc' } } },
      });
    });
  }
}
