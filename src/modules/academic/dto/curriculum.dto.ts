import { SubjectPriority } from '@prisma/client';
import { IsString, IsBoolean, IsEnum, IsInt, IsArray } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  name: string; // e.g., "Mathematics"

  @IsString()
  code: string; // e.g., "MATH101"
}

export class AssignSubjectDto {
  @IsInt()
  classArmId: number;

  @IsArray()
  @IsInt({ each: true })
  subjectIds: number[];

  @IsEnum(SubjectPriority)
  priority: SubjectPriority;

  @IsBoolean()
  isExamSubject: boolean;
}
