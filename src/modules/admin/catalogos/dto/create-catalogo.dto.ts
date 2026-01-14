import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, Min, IsUUID } from 'class-validator';

export class CreateCatalogoDto {
  @ApiProperty({
    description: 'Nombre del catálogo',
    example: 'Plan Estatal de Desarrollo',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del catálogo',
    example: 'Documentos relacionados con el plan estatal de desarrollo',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiProperty({
    description: 'ID del catálogo padre (para subcategorías)',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El parent_id debe ser un entero válido' })
  parent_id?: string;

  @ApiProperty({
    description: 'Orden dentro del mismo nivel',
    example: 1,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden no puede ser negativo' })
  orden?: number;

  @ApiProperty({
    description: 'Indica si el catálogo permite documentos',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'permite_documentos debe ser un valor booleano' })
  permite_documentos?: boolean;
  @ApiProperty({
    description: 'Estado activo/inactivo del catálogo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'activo debe ser un valor booleano' })
  activo?: boolean;
}
