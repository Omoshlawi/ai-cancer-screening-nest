import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../common/commond.dto';

export class CreateProviderFacilityDto {
  @ApiProperty({ description: 'Health provider ID', example: 'clxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  providerId: string;

  @ApiProperty({ description: 'Health facility ID', example: 'uuid-xxxx' })
  @IsNotEmpty()
  @IsString()
  facilityId: string;
}

export class FindProviderFacilityDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by provider ID' })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({ description: 'Filter by facility ID' })
  @IsOptional()
  @IsString()
  facilityId?: string;
}
