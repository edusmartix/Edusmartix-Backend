import { ExamType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScoreDivisionDto {
  @IsString()
  name: string; // e.g., "1st CA"

  @IsNumber()
  @Min(0)
  maxScore: number; // e.g., 20
}

export class CreateExamSessionDto {
  @IsString()
  title: string; // e.g., "First Term Mid-Term Assessment"

  @IsEnum(ExamType)
  examType: ExamType;

  @IsInt()
  classLevelId: number;

  @IsInt()
  @IsOptional()
  classArmId?: number; // Optional: If NULL, applies to the whole level

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreDivisionDto)
  divisions: ScoreDivisionDto[];
}
