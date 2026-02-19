import { SubjectPriority } from '@prisma/client';
import {
  IsString,
  IsBoolean,
  IsEnum,
  IsInt,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsString()
  code: string;
}

export class SubjectAssignmentInputDto {
  @IsInt()
  subjectId: number;

  @IsInt()
  @IsOptional()
  teacherId?: number; // The specific teacher for this subject in this class
}

export class AssignSubjectDto {
  @IsInt()
  classArmId: number;

  @IsEnum(SubjectPriority)
  priority: SubjectPriority;

  @IsBoolean()
  isExamSubject: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectAssignmentInputDto)
  subjects: SubjectAssignmentInputDto[];
}
