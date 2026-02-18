import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';

export class CreateLevelDto {
  @IsString()
  name: string; // e.g., "Grade 1"

  @IsInt()
  levelOrder: number; // e.g., 1

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  arms?: string[]; // e.g., ["A", "B", "Gold"]
}
