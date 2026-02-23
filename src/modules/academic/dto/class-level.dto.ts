import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryType } from '@prisma/client';

export class CreateCategoryDto {
  @IsString()
  name: string; // e.g., "Senior Secondary"

  @IsEnum(CategoryType)
  type: CategoryType; // e.g., SECONDARY
}

export class ArmInputDto {
  @IsString()
  name: string; // e.g., "A"

  @IsInt()
  @IsOptional()
  classTeacherId?: number; // Optional staff profile ID
}

export class CreateLevelDto {
  @IsString()
  name: string; // e.g., "Grade 1"

  @IsInt()
  classCategoryId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArmInputDto)
  @IsOptional()
  arms?: ArmInputDto[];
}

class LevelOrderInput {
  @IsInt()
  id: number;

  @IsInt()
  order: number;
}

export class ReorderLevelsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LevelOrderInput)
  levels: LevelOrderInput[];
}
