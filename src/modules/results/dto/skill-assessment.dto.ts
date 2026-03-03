import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StudentSkillEntryDto {
  @IsInt()
  enrollmentId: number;

  @IsInt()
  skillItemId: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class BulkSkillAssessmentDto {
  @IsInt()
  resultSheetId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentSkillEntryDto)
  assessments: StudentSkillEntryDto[];
}
