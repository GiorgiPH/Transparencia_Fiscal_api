import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsUUID, IsDateString, IsNumber, Min, Max, IsInt } from 'class-validator';

export class CreateDocumentoDto {
  @IsOptional()
  @ApiProperty({
    description: 'Título del documento',
    example: 'Plan Estatal de Desarrollo 2024-2027',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del documento',
    example: 'Documento que establece los objetivos y estrategias del desarrollo estatal',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiProperty({
    description: 'ID del catálogo al que pertenece el documento',
    example: 5,
  })
  @Type(() => Number) // 🔑 CONVIERTE "9" → 9

  @IsNumber({}, { message: 'El catalogo_id debe ser un número valido' })
  catalogo_id: number;

  @ApiProperty({
    description: 'URL del documento en el sistema de almacenamiento',
    example: 'https://storage.morelos.gob.mx/documentos/plan-estatal-2024.pdf',
  })
  @IsOptional()
  @IsString({ message: 'La URL debe ser una cadena de texto' })
  url: string;

  @ApiProperty({
    description: 'Nombre del archivo original',
    example: 'plan-estatal-desarrollo-2024.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre del archivo debe ser una cadena de texto' })
  nombre_archivo?: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 1048576,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El tamaño debe ser un número' })
  @Min(0, { message: 'El tamaño no puede ser negativo' })
  tamano?: number;

  @ApiProperty({
    description: 'Tipo MIME del documento',
    example: 'application/pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El tipo MIME debe ser una cadena de texto' })
  tipo_mime?: string;

  @ApiProperty({
    description: 'ID del tipo de documento (CSV, JSON, XML, Excel)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @Type(() => Number) // 🔑 CONVIERTE "9" → 9
  @IsNumber({}, { message: 'El tipo_documento_id debe ser un UUID válido' })
  tipo_documento_id?: number;

  @ApiProperty({
    description: 'Fecha de publicación del documento',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de publicación debe ser una fecha válida' })
  fecha_publicacion?: string;

  @ApiProperty({
    description: 'Año fiscal del documento',
    example: 2024,
    required: false,
  })
  @IsOptional()
  @Type(() => Number) // 🔑 CONVIERTE "9" → 9

  @IsNumber({}, { message: 'El año fiscal debe ser un número' })
  @Min(2000, { message: 'El año fiscal debe ser mayor o igual a 2000' })
  @Max(2100, { message: 'El año fiscal debe ser menor o igual a 2100' })
  ejercicio_fiscal?: number;

  @ApiProperty({
    description: 'Palabras clave para búsqueda',
    example: 'plan, desarrollo, estatal, 2024',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las palabras clave deben ser una cadena de texto' })
  palabras_clave?: string;

  @ApiProperty({
    description: 'Periodicidad del documento',
    example: 'anual, mensual',
    required: false,
  })
  @IsString({ message: 'Las palabras clave deben ser una cadena de texto' })
  periodicidad?: string;


  @ApiProperty({
    description: 'Indica si el documento es público',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'es_publico debe ser un valor booleano' })
  es_publico?: boolean;

  @ApiProperty({
    description: 'insitutcion qiue emitio el documento',
    example: 'plan, desarrollo, estatal, 2024',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'error' })
  institucion_emisora?: string;
}
