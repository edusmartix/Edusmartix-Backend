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

// Used for the dedicated level config endpoint
export class SetLevelDivisionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoreDivisionDto)
  divisions: ScoreDivisionDto[];
}

export class CreateExamSessionDto {
  @IsString()
  title: string;

  @IsEnum(ExamType)
  examType: ExamType;

  @IsArray()
  @IsInt({ each: true })
  classLevelIds: number[];
}
