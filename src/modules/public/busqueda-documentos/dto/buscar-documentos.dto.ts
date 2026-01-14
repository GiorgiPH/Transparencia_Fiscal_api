import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsArray, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class BuscarDocumentosDto {
  @ApiProperty({
    description: 'Término de búsqueda en nombre o descripción del documento',
    required: false,
    example: 'presupuesto',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'ID del catálogo para filtrar',
    required: false,
    example: 1,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  catalogoId?: number;

  @ApiProperty({
    description: 'Año del ejercicio fiscal',
    required: false,
    example: 2025,
  })
  @IsInt()
  @Min(2000)
  @Max(2100)
  @IsOptional()
  @Type(() => Number)
  anio?: number;

  @ApiProperty({
    description: 'Extensión del archivo (PDF, XLSX, CSV, etc.)',
    required: false,
    example: 'pdf',
  })
  @IsString()
  @IsOptional()
  extension?: string;

  @ApiProperty({
    description: 'Periodicidad del documento',
    required: false,
    example: 'anual',
    enum: ['mensual', 'trimestral', 'semestral', 'anual'],
  })
  @IsString()
  @IsIn(['mensual', 'trimestral', 'semestral', 'anual'])
  @IsOptional()
  periodicidad?: string;

  @ApiProperty({
    description: 'Institución emisora',
    required: false,
    example: 'Secretaría de Finanzas',
  })
  @IsString()
  @IsOptional()
  institucion?: string;

  @ApiProperty({
    description: 'Número de página (para paginación)',
    required: false,
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Tamaño de página (para paginación)',
    required: false,
    example: 20,
    default: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 20;

  @ApiProperty({
    description: 'Campo para ordenar los resultados',
    required: false,
    example: 'fecha_publicacion',
    enum: ['nombre', 'fecha_publicacion', 'ejercicio_fiscal', 'fecha_creacion'],
  })
  @IsString()
  @IsIn(['nombre', 'fecha_publicacion', 'ejercicio_fiscal', 'fecha_creacion'])
  @IsOptional()
  orderBy?: string = 'fecha_publicacion';

  @ApiProperty({
    description: 'Dirección del ordenamiento',
    required: false,
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  order?: string = 'desc';

  @ApiProperty({
    description: 'IDs de categorías para filtro múltiple',
    required: false,
    type: [Number],
    example: [1, 2],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)]
  )
  categorias?: number[];
}
