import {
  IsInt,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSkillItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  maxScore?: number;

  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class CreateSkillCategoryDto {
  @IsInt()
  classLevelId: number;

  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSkillItemDto)
  items: CreateSkillItemDto[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  targetClassLevelIds?: number[]; // The "Clone" feature
}
