// Phase 2 requires validation pipes mapped to specific DTOs.
// Example boilerplate for Phase 2 constraint: Validation & Serialization

import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMenuItemDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
