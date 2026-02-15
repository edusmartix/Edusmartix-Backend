import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  //   IsDateString,
} from 'class-validator';
import { ParentRelationship } from '@prisma/client';

export class CreateStudentParentDto {
  // Student Info
  @IsString()
  @IsNotEmpty()
  studentFirstName: string;

  @IsString()
  @IsNotEmpty()
  studentLastName: string;

  @IsString()
  @IsNotEmpty()
  admissionNo: string;

  @IsOptional()
  @IsString()
  gender?: string;

  // Parent Info
  @IsEmail()
  parentEmail: string;

  @IsString()
  @IsNotEmpty()
  parentFirstName: string;

  @IsString()
  @IsNotEmpty()
  parentLastName: string;

  @IsEnum(ParentRelationship)
  relationship: ParentRelationship;
}
