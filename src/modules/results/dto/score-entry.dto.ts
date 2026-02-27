import {
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DivisionScoreEntryDto {
  @IsInt()
  scoreDivisionConfigId: number;

  @IsNumber()
  @Min(0)
  score: number;
}

export class StudentSubjectScoreDto {
  @IsInt()
  enrollmentId: number;

  @IsBoolean()
  @IsOptional()
  isAbsent?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DivisionScoreEntryDto)
  divisions: DivisionScoreEntryDto[];
}

export class BulkScoreEntryDto {
  @IsInt()
  examSessionId: number;

  @IsInt()
  subjectId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentSubjectScoreDto)
  scores: StudentSubjectScoreDto[];
}
