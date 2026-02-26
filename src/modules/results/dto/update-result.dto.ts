import { PartialType } from '@nestjs/mapped-types';
import { CreateResultDto } from './exam-session.dto';

export class UpdateResultDto extends PartialType(CreateResultDto) {}
