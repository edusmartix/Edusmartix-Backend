import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  levelOrder: number; // e.g., 1

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
