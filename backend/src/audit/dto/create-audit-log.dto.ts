import { IsString } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  userId: string;

  @IsString()
  userName: string;

  @IsString()
  action: string;

  @IsString()
  entity: string;

  @IsString()
  entityId: string;

  @IsString()
  description: string;
}
