import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class BuscarCatalogosDto {
  @ApiProperty({
    description: 'Texto de búsqueda',
    example: 'finanzas',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El texto de búsqueda debe tener al menos 2 caracteres' })
  q?: string;
}