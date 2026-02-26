import { ExamType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
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
  title: string;

  @IsEnum(ExamType)
  examType: ExamType;

  @IsArray()
  @IsInt({ each: true })
  classLevelIds: number[]; // Array of levels participating in this exam

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreDivisionDto)
  divisions: ScoreDivisionDto[];
}
